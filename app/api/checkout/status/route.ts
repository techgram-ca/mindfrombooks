import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, jsonError } from "@/lib/api";
import { requireUserApi } from "@/lib/auth";
import { fulfillCheckoutSession } from "@/lib/fulfillment";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const sessionIdSchema = z
  .string()
  .regex(/^cs_[A-Za-z0-9_]+$/)
  .max(200);

/**
 * Polled by /checkout/success. Normally the webhook has already created the
 * enrollment; if it is slow (or misconfigured) we confirm the payment with
 * Stripe directly and fulfil it here — same idempotent code path.
 */
export const GET = handle(async (request: Request) => {
  const profile = await requireUserApi();
  const parsed = sessionIdSchema.safeParse(new URL(request.url).searchParams.get("session_id"));
  if (!parsed.success) return jsonError(400, "Missing checkout session.");
  const db = createAdminClient();

  async function lookup() {
    const { data: order } = await db
      .from("orders")
      .select("id, course_id, bundle_id, amount_total_cents, courses(slug, name)")
      .eq("stripe_checkout_session_id", parsed.data)
      .eq("user_id", profile.id)
      .maybeSingle();
    if (!order) return null;
    const { count } = await db
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("order_id", order.id);
    if (!count) return null;
    const course = order.courses as unknown as { slug: string; name: string } | null;
    return {
      ready: true,
      kind: order.bundle_id ? "bundle" : "course",
      name: course?.name ?? "All Access",
      amountCents: order.amount_total_cents as number,
      url: course ? `/dashboard/courses/${course.slug}` : "/dashboard",
    };
  }

  const found = await lookup();
  if (found) return NextResponse.json(found);

  const session = await getStripe().checkout.sessions.retrieve(parsed.data);
  if (session.metadata?.userId !== profile.id) return jsonError(404, "Checkout session not found.");
  if (session.payment_status === "paid") {
    await fulfillCheckoutSession(session);
    const after = await lookup();
    if (after) return NextResponse.json(after);
  }
  return NextResponse.json({ ready: false, paymentStatus: session.payment_status });
});
