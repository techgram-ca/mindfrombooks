import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { fulfillCheckoutSession } from "@/lib/fulfillment";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Enrollment, Order } from "@/lib/types";

/**
 * A refund happened in Stripe (from our refund button, or from the Stripe
 * dashboard). Our own refunds are already recorded; this keeps the order in
 * step and covers refunds made by hand in Stripe.
 */
async function syncRefund(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return;
  const db = createAdminClient();
  const { data } = await db
    .from("orders")
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();
  const order = data as Order | null;
  if (!order) return;

  const fully = charge.amount_refunded >= order.amount_total_cents;
  await db
    .from("orders")
    .update({
      amount_refunded_cents: charge.amount_refunded,
      status: fully ? "refunded" : charge.amount_refunded > 0 ? "partially_refunded" : order.status,
    })
    .eq("id", order.id);

  if (!fully) return;
  // Whole order refunded: close any enrollment that isn't already refunded.
  const { data: rows } = await db
    .from("enrollments")
    .select("*")
    .eq("order_id", order.id)
    .neq("status", "refunded");
  for (const e of (rows ?? []) as Enrollment[]) {
    const { error } = await db.from("refunds").insert({
      enrollment_id: e.id,
      order_id: order.id,
      user_id: e.user_id,
      amount_cents: e.amount_paid_cents,
      type: "admin_manual",
    });
    if (error && error.code !== "23505") throw new Error(`refund sync failed: ${error.message}`);
    await db.from("enrollments").update({ status: "refunded" }).eq("id", e.id);
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // The signature is computed over the exact raw body.
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillCheckoutSession(event.data.object);
        break;
      case "charge.refunded":
        await syncRefund(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    // A 500 makes Stripe retry; every handler above is idempotent.
    console.error(`[stripe webhook] ${event.type} ${event.id} failed`, err);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
