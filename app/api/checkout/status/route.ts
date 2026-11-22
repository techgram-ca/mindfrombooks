import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, jsonError } from "@/lib/api";
import { getSessionProfile } from "@/lib/auth";
import { fulfillCheckoutSession } from "@/lib/fulfillment";
import { CLAIM_WINDOW_MS } from "@/lib/guest-accounts";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const sessionIdSchema = z
  .string()
  .regex(/^cs_[A-Za-z0-9_]+$/)
  .max(200);

export type AccountStep =
  /** Already logged in as the buyer. */
  | "signed_in"
  /** This payment created the account: choose a password now. */
  | "set_password"
  /** The account already existed (or the password was already set): log in. */
  | "login";

/**
 * Polled by /checkout/success. Works logged out: the Checkout Session id is
 * only ever in the buyer's own redirect URL. Normally the webhook has already
 * created the order; if it is slow, we confirm with Stripe and fulfil here —
 * the same idempotent code path.
 */
export const GET = handle(async (request: Request) => {
  const parsed = sessionIdSchema.safeParse(new URL(request.url).searchParams.get("session_id"));
  if (!parsed.success) return jsonError(400, "Missing checkout session.");
  const sessionId = parsed.data;
  const db = createAdminClient();
  const profile = await getSessionProfile();

  async function lookup() {
    const { data: order } = await db
      .from("orders")
      .select(
        "id, user_id, bundle_id, amount_total_cents, status, created_account, account_claimed_at, created_at, courses(slug, name, format)",
      )
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();
    if (!order?.user_id) return null;
    const { count } = await db
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("order_id", order.id);
    const alreadyOwned = (count ?? 0) === 0 && order.status === "refunded";
    if (!count && !alreadyOwned) return null;

    const course = order.courses as unknown as {
      slug: string;
      name: string;
      format?: string;
    } | null;
    const selfPaced = course?.format === "self_paced";
    const url = course
      ? `/dashboard/${selfPaced ? "workshops" : "courses"}/${course.slug}`
      : "/dashboard";
    const { data: buyer } = await db
      .from("profiles")
      .select("email, name")
      .eq("id", order.user_id as string)
      .maybeSingle();

    let account: AccountStep = "login";
    if (profile?.id === order.user_id) account = "signed_in";
    else if (
      order.created_account &&
      !order.account_claimed_at &&
      Date.now() - new Date(order.created_at as string).getTime() < CLAIM_WINDOW_MS
    ) {
      account = "set_password";
    }

    return {
      ready: true,
      kind: order.bundle_id ? "bundle" : "course",
      selfPaced,
      name: course?.name ?? "All Access",
      amountCents: order.amount_total_cents as number,
      url,
      account,
      alreadyOwned,
      email: account === "signed_in" ? undefined : (buyer?.email as string | undefined),
      buyerName:
        account === "set_password" ? ((buyer?.name as string | undefined) ?? "") : undefined,
    };
  }

  const found = await lookup();
  if (found) return NextResponse.json(found);

  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (session.payment_status === "paid") {
    await fulfillCheckoutSession(session);
    const after = await lookup();
    if (after) return NextResponse.json(after);
  }
  return NextResponse.json({ ready: false, paymentStatus: session.payment_status });
});
