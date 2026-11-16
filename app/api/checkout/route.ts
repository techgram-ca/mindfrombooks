import { NextResponse } from "next/server";
import { handle, jsonError, parseBody } from "@/lib/api";
import { getSessionProfile } from "@/lib/auth";
import { isValidTimezone } from "@/lib/course-days";
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
  // Logged out is fine: a paid purchase creates the account after payment.
  const profile = await getSessionProfile();
  const who =
    profile?.id ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!rateLimit(`checkout:${who}`, 10, 60_000)) {
    return jsonError(429, "Too many tries. Wait a minute and try again.");
  }
  const body = await parseBody(request, checkoutSchema);
  const product = await resolveProduct(body);
  const db = createAdminClient();

  // Already enrolled? (A bundle is blocked only when every course is held.)
  // Guests can't be checked here; if they turn out to own it, fulfilment
  // refunds the payment automatically.
  const { data: held } = profile
    ? await db
        .from("enrollments")
        .select("course_id")
        .eq("user_id", profile.id)
        .in(
          "course_id",
          product.courses.map((c) => c.id),
        )
    : { data: [] };
  const heldCount = held?.length ?? 0;
  if (profile && heldCount >= product.courses.length) {
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
    const { coupon, result } = await checkCoupon(body.code, product, profile?.id ?? null);
    if (!result.ok || !coupon) {
      return jsonError(400, result.ok ? "That code didn't work." : result.message);
    }
    finalCents = result.finalCents;
    couponId = coupon.id;
  }
  const discountCents = product.priceCents - finalCents;
  const attribution = await readAttribution();
  const utmCampaign = attribution?.campaign ?? profile?.signup_campaign ?? null;

  // ---- Free with a code: needs an account, so one-per-person codes stay one per person.
  if (finalCents === 0 && !profile) {
    return NextResponse.json(
      { signup: true, error: "Create a free account to use this code." },
      { status: 401 },
    );
  }

  // ---- Free: skip Stripe and enroll straight away
  if (finalCents === 0 && profile) {
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
    // Logged in: we know the email. Guest: Stripe asks for it, and the account
    // is created from it after payment.
    ...(profile ? { customer_email: profile.email, client_reference_id: profile.id } : {}),
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
      userId: profile?.id ?? "",
      timezone: body.timezone && isValidTimezone(body.timezone) ? body.timezone : "",
      attrSource: profile ? "" : (attribution?.source ?? ""),
      attrMedium: profile ? "" : (attribution?.medium ?? ""),
      attrLanding: profile ? "" : (attribution?.landing ?? ""),
      attrReferrer: profile ? "" : (attribution?.referrer ?? ""),
      courseId: product.kind === "course" ? product.id : "",
      bundleId: product.kind === "bundle" ? product.id : "",
      couponId: couponId ?? "",
      utmCampaign: utmCampaign ?? "",
      priceCents: String(product.priceCents),
    },
    payment_intent_data: {
      metadata: { userId: profile?.id ?? "guest", product: product.slug },
    },
    success_url: siteUrl("/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
    cancel_url: siteUrl(
      `${product.path}${body.code ? `?code=${encodeURIComponent(body.code)}` : ""}`,
    ),
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return NextResponse.json({ url: session.url });
});
