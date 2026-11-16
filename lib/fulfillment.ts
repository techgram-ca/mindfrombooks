import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { startDateForEnrollment, safeTimezone } from "@/lib/course-days";
import { splitAmount } from "@/lib/pricing";
import { resolveProduct, type ResolvedProduct } from "@/lib/products";
import { sendWelcomeEmail } from "@/lib/emails";
import { findOrCreateBuyer, setPasswordLink } from "@/lib/guest-accounts";
import { getStripe } from "@/lib/stripe";
import { sessionMetadataSchema } from "@/lib/validators/checkout";
import type { Enrollment, Order, Profile } from "@/lib/types";

export interface FulfillInput {
  userId: string;
  product: ResolvedProduct;
  amountTotalCents: number;
  amountDiscountCents: number;
  couponId: string | null;
  utmCampaign: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  /** Set for the free (100% coupon) path, where the order row already exists. */
  existingOrderId?: string;
  /** Guest checkout: the email used at Stripe. */
  guestEmail?: string | null;
  /** Guest checkout: this payment created the buyer's account. */
  createdAccount?: boolean;
}

export interface FulfillResult {
  order: Order;
  enrollments: Enrollment[];
  created: number;
  /** The buyer already held every course in what they bought. */
  alreadyOwned: boolean;
}

/**
 * Turn a completed purchase into an order + enrollment(s). Safe to call more
 * than once for the same purchase (Stripe retries webhooks, and the success
 * page may call this too): the order is keyed on the Checkout Session id and
 * enrollments on (user, course).
 */
export async function fulfillPurchase(input: FulfillInput): Promise<FulfillResult> {
  const db = createAdminClient();
  const { product } = input;
  const isFree = input.amountTotalCents === 0;

  // 1. Order
  let order: Order;
  if (input.existingOrderId) {
    const { data, error } = await db
      .from("orders")
      .select("*")
      .eq("id", input.existingOrderId)
      .single();
    if (error) throw new Error(`order lookup failed: ${error.message}`);
    order = data as Order;
  } else {
    const { data, error } = await db
      .from("orders")
      .upsert(
        {
          user_id: input.userId,
          stripe_checkout_session_id: input.stripeSessionId,
          stripe_payment_intent_id: input.stripePaymentIntentId,
          amount_total_cents: input.amountTotalCents,
          amount_discount_cents: input.amountDiscountCents,
          currency: "usd",
          coupon_id: input.couponId,
          course_id: product.kind === "course" ? product.id : null,
          bundle_id: product.kind === "bundle" ? product.id : null,
          utm_campaign: input.utmCampaign,
          ...(input.guestEmail ? { guest_email: input.guestEmail } : {}),
          // Only ever switched on, so a retry can't erase it.
          ...(input.createdAccount ? { created_account: true } : {}),
        },
        { onConflict: "stripe_checkout_session_id" },
      )
      .select("*")
      .single();
    if (error) throw new Error(`order upsert failed: ${error.message}`);
    order = data as Order;
  }

  // 2. Who is this for
  const { data: profileRow, error: profileError } = await db
    .from("profiles")
    .select("*")
    .eq("id", input.userId)
    .single();
  if (profileError) throw new Error(`profile lookup failed: ${profileError.message}`);
  const profile = profileRow as Profile;
  const timezone = safeTimezone(profile.timezone);

  // 3. Which courses this order covers: everything in the product the learner
  //    doesn't already hold from somewhere else. Stable across retries.
  const courseIds = product.courses.map((c) => c.id);
  const { data: existingRows } = await db
    .from("enrollments")
    .select("*")
    .eq("user_id", input.userId)
    .in("course_id", courseIds);
  const existing = (existingRows ?? []) as Enrollment[];
  const heldElsewhere = new Set(
    existing.filter((e) => e.order_id !== order.id).map((e) => e.course_id),
  );
  const targets = product.courses.filter((c) => !heldElsewhere.has(c.id));
  const amounts = splitAmount(input.amountTotalCents, targets.length);
  const already = new Set(existing.filter((e) => e.order_id === order.id).map((e) => e.course_id));

  const rows = targets
    .map((course, i) => ({ course, amount: amounts[i] }))
    .filter(({ course }) => !already.has(course.id))
    .map(({ course, amount }) => ({
      user_id: input.userId,
      course_id: course.id,
      order_id: order.id,
      source: isFree ? "coupon_free" : product.kind === "bundle" ? "bundle" : "stripe",
      amount_paid_cents: amount,
      coupon_id: input.couponId,
      // A single course always starts tomorrow. Bundle courses wait until the
      // learner taps "Start" on each one.
      start_date: product.kind === "bundle" ? null : startDateForEnrollment(timezone),
      timezone,
      grace_days: course.grace_days,
      utm_campaign: input.utmCampaign,
    }));

  let created: Enrollment[] = [];
  if (rows.length > 0) {
    const { data, error } = await db
      .from("enrollments")
      .upsert(rows, { onConflict: "user_id,course_id", ignoreDuplicates: true })
      .select("*");
    if (error) throw new Error(`enrollment insert failed: ${error.message}`);
    created = (data ?? []) as Enrollment[];
  }
  if (targets.length === 0) {
    console.error(`[fulfillment] order ${order.id} paid but the buyer already holds every course`);
  }

  // 4. Coupon (best effort for paid orders — the money is already taken)
  if (input.couponId && !input.existingOrderId) {
    const { error } = await db.rpc("redeem_coupon", {
      p_coupon_id: input.couponId,
      p_user_id: input.userId,
      p_order_id: order.id,
    });
    if (error) console.error("[fulfillment] coupon redemption failed", error.message);
  }

  // 5. Welcome email, only the first time through
  if (created.length > 0) {
    const days = targets.reduce((sum, c) => sum + c.days, 0);
    await sendWelcomeEmail({
      user: profile,
      productName: product.name,
      days,
      isBundle: product.kind === "bundle",
      paid: !isFree,
      graceDays: product.kind === "course" ? product.courses[0].grace_days : 0,
      path: product.kind === "course" ? `/dashboard/courses/${product.slug}` : "/dashboard",
      setPasswordUrl: input.createdAccount ? await setPasswordLink(profile.email) : null,
    });
  }

  return {
    order,
    enrollments: [...existing.filter((e) => e.order_id === order.id), ...created],
    created: created.length,
    alreadyOwned: targets.length === 0,
  };
}

/** Fulfil a paid Stripe Checkout Session (used by the webhook and the success page). */
export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<FulfillResult | null> {
  if (session.mode !== "payment" || session.payment_status !== "paid") return null;
  const meta = sessionMetadataSchema.safeParse(session.metadata ?? {});
  if (!meta.success) {
    console.error(`[fulfillment] session ${session.id} has unexpected metadata`);
    return null;
  }
  const m = meta.data;
  const product = await resolveProduct(
    { courseId: m.courseId || null, bundleId: m.bundleId || null },
    false,
  );
  const total = session.amount_total ?? 0;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  // Who is this for? A logged-in buyer, or a guest identified by the email
  // they gave Stripe.
  let userId = m.userId || null;
  let createdAccount = false;
  let guestEmail: string | null = null;
  if (!userId) {
    const db = createAdminClient();
    const { data: prior } = await db
      .from("orders")
      .select("user_id, created_account")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();
    guestEmail =
      (session.customer_details?.email ?? session.customer_email ?? "").trim().toLowerCase() ||
      null;
    if (prior?.user_id) {
      userId = prior.user_id as string;
      createdAccount = prior.created_account === true;
    } else {
      if (!guestEmail) {
        console.error(`[fulfillment] guest session ${session.id} has no email`);
        return null;
      }
      const buyer = await findOrCreateBuyer({
        email: guestEmail,
        name: session.customer_details?.name ?? null,
        timezone: m.timezone ?? null,
        attribution: {
          source: m.attrSource,
          medium: m.attrMedium,
          campaign: m.utmCampaign,
          landing: m.attrLanding,
          referrer: m.attrReferrer,
        },
      });
      userId = buyer.userId;
      createdAccount = buyer.created;
    }
  }

  const result = await fulfillPurchase({
    userId,
    product,
    amountTotalCents: total,
    amountDiscountCents: Math.max(0, m.priceCents - total),
    couponId: m.couponId || null,
    utmCampaign: m.utmCampaign || null,
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    guestEmail,
    createdAccount,
  });

  // Bought something they already own (possible when not logged in): refund it.
  if (result.alreadyOwned && total > 0 && paymentIntentId && result.order.status !== "refunded") {
    await getStripe().refunds.create(
      {
        payment_intent: paymentIntentId,
        reason: "duplicate",
        metadata: { orderId: result.order.id },
      },
      { idempotencyKey: `duplicate_${session.id}` },
    );
    await createAdminClient()
      .from("orders")
      .update({ status: "refunded", amount_refunded_cents: total })
      .eq("id", result.order.id);
    console.info(`[fulfillment] order ${result.order.id}: already owned, refunded automatically`);
  }
  return result;
}
