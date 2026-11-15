import "server-only";
import { HttpError } from "@/lib/auth";
import { sendRefundEmail } from "@/lib/emails";
import { isPaidSource } from "@/lib/refunds";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Course, Enrollment, Order, Profile, RefundType } from "@/lib/types";

interface ProgressRow {
  refund_eligible: boolean;
  refund_ineligible_reason: string | null;
}

/**
 * Refund one enrollment through Stripe.
 *  - "guarantee": the learner's one-click refund. Eligibility is re-checked in
 *    SQL (enrollment_progress) right before any money moves.
 *  - "admin_manual": an admin override; skips the eligibility rules.
 * Idempotent: Stripe gets an idempotency key derived from the enrollment id,
 * and the refunds table allows one row per enrollment.
 */
export async function processRefund(input: {
  enrollmentId: string;
  type: RefundType;
  actor: Profile;
}): Promise<{ amountCents: number; courseName: string }> {
  const db = createAdminClient();
  const { data } = await db
    .from("enrollments")
    .select("*, courses(*), orders(*)")
    .eq("id", input.enrollmentId)
    .maybeSingle();
  type Row = Enrollment & { courses: Course; orders: Order | null };
  const row = data as Row | null;
  if (!row) throw new HttpError(404, "We couldn't find that enrollment.");

  if (input.type === "guarantee") {
    if (row.user_id !== input.actor.id)
      throw new HttpError(404, "We couldn't find that enrollment.");
    const { data: progress, error } = await db
      .rpc("enrollment_progress", { p_enrollment_id: row.id })
      .maybeSingle();
    if (error) throw new Error(`eligibility check failed: ${error.message}`);
    const p = progress as ProgressRow | null;
    if (!p?.refund_eligible) {
      throw new HttpError(
        400,
        p?.refund_ineligible_reason ?? "This course isn't eligible for a refund.",
      );
    }
  } else {
    if (input.actor.role !== "admin") throw new HttpError(403, "Admins only.");
    if (row.status === "refunded") throw new HttpError(400, "Already refunded.");
    if (!isPaidSource(row.source, row.amount_paid_cents)) {
      throw new HttpError(400, "This was free access — there is nothing to refund.");
    }
  }

  const order = row.orders;
  if (!order?.stripe_payment_intent_id) {
    throw new HttpError(400, "No payment is linked to this enrollment. Please contact us.");
  }

  const refund = await getStripe().refunds.create(
    {
      payment_intent: order.stripe_payment_intent_id,
      amount: row.amount_paid_cents,
      reason: "requested_by_customer",
      metadata: { enrollmentId: row.id, type: input.type },
    },
    { idempotencyKey: `refund_${row.id}` },
  );

  const { error: refundError } = await db.from("refunds").upsert(
    {
      enrollment_id: row.id,
      order_id: order.id,
      user_id: row.user_id,
      stripe_refund_id: refund.id,
      amount_cents: row.amount_paid_cents,
      type: input.type,
    },
    { onConflict: "enrollment_id" },
  );
  if (refundError) throw new Error(`refund record failed: ${refundError.message}`);

  const { error: statusError } = await db
    .from("enrollments")
    .update({ status: "refunded" })
    .eq("id", row.id);
  if (statusError) throw new Error(`enrollment update failed: ${statusError.message}`);

  const { data: allRefunds } = await db
    .from("refunds")
    .select("amount_cents")
    .eq("order_id", order.id);
  const refunded = (allRefunds ?? []).reduce((sum, r) => sum + (r.amount_cents as number), 0);
  await db
    .from("orders")
    .update({
      amount_refunded_cents: refunded,
      status: refunded >= order.amount_total_cents ? "refunded" : "partially_refunded",
    })
    .eq("id", order.id);

  const { data: user } = await db
    .from("profiles")
    .select("id, email, name")
    .eq("id", row.user_id)
    .maybeSingle();
  if (user) {
    await sendRefundEmail({
      user: user as Pick<Profile, "id" | "email" | "name">,
      courseName: row.courses.name,
      amountCents: row.amount_paid_cents,
    });
  }

  return { amountCents: row.amount_paid_cents, courseName: row.courses.name };
}
