import { NextResponse } from "next/server";
import { handle, jsonError, parseBody } from "@/lib/api";
import { getSessionProfile } from "@/lib/auth";
import { checkCoupon } from "@/lib/coupons.server";
import { resolveProduct } from "@/lib/products";
import { rateLimit } from "@/lib/rate-limit";
import { validateCouponSchema } from "@/lib/validators/checkout";

export const POST = handle(async (request: Request) => {
  const profile = await getSessionProfile();
  const who =
    profile?.id ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!rateLimit(`coupon:${who}`, 12, 60_000)) {
    return jsonError(429, "Too many tries. Wait a minute and try again.");
  }

  const body = await parseBody(request, validateCouponSchema);
  const product = await resolveProduct(body);
  const { result } = await checkCoupon(body.code, product, profile?.id ?? null);

  if (!result.ok) {
    return NextResponse.json({ valid: false, reason: result.reason, message: result.message });
  }
  return NextResponse.json({
    valid: true,
    priceCents: product.priceCents,
    discountCents: result.discountCents,
    finalCents: result.finalCents,
  });
});
