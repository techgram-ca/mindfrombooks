import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateCoupon, normalizeCode, type CouponResult } from "@/lib/coupons";
import { toCouponProduct, type ResolvedProduct } from "@/lib/products";
import type { Coupon } from "@/lib/types";

export interface CheckedCoupon {
  coupon: Coupon | null;
  result: CouponResult;
}

/** Look a code up and apply every rule, for this user and this product. */
export async function checkCoupon(
  code: string,
  product: ResolvedProduct,
  userId: string | null,
): Promise<CheckedCoupon> {
  const db = createAdminClient();
  const { data } = await db
    .from("coupons")
    .select("*")
    .eq("code", normalizeCode(code))
    .maybeSingle();
  const coupon = data as Coupon | null;

  let alreadyUsed = false;
  if (coupon && userId) {
    const { count } = await db
      .from("coupon_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)
      .eq("user_id", userId);
    alreadyUsed = (count ?? 0) > 0;
  }

  return {
    coupon,
    result: evaluateCoupon({
      coupon,
      product: toCouponProduct(product),
      priceCents: product.priceCents,
      alreadyUsedByUser: alreadyUsed,
    }),
  };
}
