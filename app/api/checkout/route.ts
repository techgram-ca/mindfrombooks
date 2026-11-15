import { NextResponse } from "next/server";
import { handle, jsonError, parseBody } from "@/lib/api";
import { requireUserApi } from "@/lib/auth";
import { readAttribution } from "@/lib/attribution.server";
import { checkCoupon } from "@/lib/coupons.server";
import { fulfillPurchase } from "@/lib/fulfillment";
import { resolveProduct } from "@/lib/products";
import { rateLimit } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validators/checkout";

export const POST = handle(async (request: Request) => {
  const profile = await requireUserApi();
  if (!rateLimit(`checkout:${profile.id}`, 10, 60_000)) {
    return jsonError(429, "Too many tries. Wait a minute and try again.");
  }
  const body = await parseBody(request, checkoutSchema);
  const product = await resolveProduct(body);
  const db = createAdminClient();

  // Already enrolled? (A bundle is blocked only when every course is held.)
  const { data: held } = await db
    .from("enrollments")
    .select("course_id")
    .eq("user_id", profile.id)
    .in(
      "course_id",
      product.courses.map((c) => c.id),
    );
  const heldCount = held?.length ?? 0;
  if (heldCount >= product.courses.length) {
    return NextResponse.json(
      {
        owned: true,
        error:
          product.kind === "course"
            ? "You're already enrolled in this course."
            : "You already have every course in this bundle.",
        url:
          product.kind === "course" ? `/dashboard/courses/${product.slug}` : "/dashboard/courses",
      },
      { status: 409 },
    );
  }

  // Price is always recomputed here — nothing from the browser is trusted.
  let finalCents = product.priceCents;
  let couponId: string | null = null;
  if (body.code) {
    const { coupon, result } = await checkCoupon(body.code, product, profile.id);
    if (!result.ok || !coupon) {
      return jsonError(400, result.ok ? "That code didn't work." : result.message);
    }
    finalCents = result.finalCents;
    couponId = coupon.id;
  }
  const discountCents = product.priceCents - finalCents;
  const utmCampaign = (await readAttribution())?.campaign ?? profile.signup_campaign ?? null;

  // ---- Free: skip Stripe and enroll straight away
  if (finalCents === 0) {
    const { data: order, error } = await db
      .from("orders")
      .insert({
        user_id: profile.id,
        amount_total_cents: 0,
        amount_discount_cents: discountCents,
        coupon_id: couponId,
        course_id: product.kind === "course" ? product.id : null,
        bundle_id: product.kind === "bundle" ? product.id : null,
        utm_campaign: utmCampaign,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(`free order insert failed: ${error.message}`);
    const orderId = order.id as string;

    if (couponId) {
      const { data: redeemed, error: redeemError } = await db.rpc("redeem_coupon", {
        p_coupon_id: couponId,
        p_user_id: profile.id,
        p_order_id: orderId,
      });
      if (redeemError || redeemed !== true) {
        await db.from("orders").delete().eq("id", orderId);
        return jsonError(400, "That code has just been used up. Remove it and try again.");
      }
    }

    try {
      await fulfillPurchase({
        userId: profile.id,
        product,
        amountTotalCents: 0,
        amountDiscountCents: discountCents,
        couponId,
        utmCampaign,
        stripeSessionId: null,
        stripePaymentIntentId: null,
        existingOrderId: orderId,
      });
      await db.from("orders").update({ status: "paid" }).eq("id", orderId);
    } catch (err) {
      if (couponId) await db.rpc("release_coupon", { p_coupon_id: couponId, p_order_id: orderId });
      await db.from("orders").delete().eq("id", orderId);
      throw err;
    }

    return NextResponse.json({
      free: true,
      url:
        product.kind === "course"
          ? `/dashboard/courses/${product.slug}?enrolled=1`
          : "/dashboard?enrolled=1",
    });
  }

  // ---- Paid: Stripe Checkout
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: profile.email,
    client_reference_id: profile.id,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: finalCents,
          product_data: {
            name:
              product.kind === "course"
                ? `${product.name} — ${product.courses[0].days}-day course`
                : `${product.name} — all courses`,
          },
        },
      },
    ],
    metadata: {
      userId: profile.id,
      courseId: product.kind === "course" ? product.id : "",
      bundleId: product.kind === "bundle" ? product.id : "",
      couponId: couponId ?? "",
      utmCampaign: utmCampaign ?? "",
      priceCents: String(product.priceCents),
    },
    payment_intent_data: {
      metadata: { userId: profile.id, product: product.slug },
    },
    success_url: siteUrl("/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
    cancel_url: siteUrl(
      `${product.path}${body.code ? `?code=${encodeURIComponent(body.code)}` : ""}`,
    ),
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return NextResponse.json({ url: session.url });
});
