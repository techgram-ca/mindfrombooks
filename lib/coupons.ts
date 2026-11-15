/** Pure coupon rules. The server loads the rows; this decides. */
import { discountCents, STRIPE_MIN_CHARGE_CENTS, formatUsd } from "./pricing";

export interface CouponRule {
  id: string;
  code: string;
  percent_off: number | null;
  amount_off_cents: number | null;
  course_ids: string[] | null;
  max_redemptions: number | null;
  times_redeemed: number;
  one_per_user: boolean;
  expires_at: string | null;
  active: boolean;
}

export type Product = { kind: "course"; id: string } | { kind: "bundle"; id: string };

export type CouponFailure =
  | "not_found"
  | "inactive"
  | "expired"
  | "used_up"
  | "already_used"
  | "wrong_product"
  | "below_minimum";

export type CouponResult =
  | { ok: true; discountCents: number; finalCents: number }
  | { ok: false; reason: CouponFailure; message: string };

export const COUPON_MESSAGES: Record<CouponFailure, string> = {
  not_found: "That code doesn't exist. Check the spelling and try again.",
  inactive: "That code is no longer active.",
  expired: "That code has expired.",
  used_up: "That code has been fully used.",
  already_used: "You've already used this code.",
  wrong_product: "That code isn't valid for this course.",
  below_minimum: `That code would bring the price below ${formatUsd(STRIPE_MIN_CHARGE_CENTS)}, the smallest amount we can charge.`,
};

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function fail(reason: CouponFailure): CouponResult {
  return { ok: false, reason, message: COUPON_MESSAGES[reason] };
}

export function evaluateCoupon(input: {
  coupon: CouponRule | null;
  product: Product;
  priceCents: number;
  /** Has this user already redeemed this coupon? (false for logged-out visitors) */
  alreadyUsedByUser: boolean;
  now?: Date;
}): CouponResult {
  const { coupon, product, priceCents, alreadyUsedByUser } = input;
  const now = input.now ?? new Date();

  if (!coupon) return fail("not_found");
  if (!coupon.active) return fail("inactive");
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() <= now.getTime()) {
    return fail("expired");
  }
  if (coupon.max_redemptions != null && coupon.times_redeemed >= coupon.max_redemptions) {
    return fail("used_up");
  }
  if (coupon.one_per_user && alreadyUsedByUser) return fail("already_used");
  // course_ids = null means "every course and the bundle". A restricted code
  // works only for the listed courses, never for the bundle.
  if (coupon.course_ids != null) {
    if (product.kind === "bundle" || !coupon.course_ids.includes(product.id)) {
      return fail("wrong_product");
    }
  }

  const discount = discountCents(priceCents, coupon);
  const finalCents = priceCents - discount;
  if (finalCents > 0 && finalCents < STRIPE_MIN_CHARGE_CENTS) return fail("below_minimum");
  return { ok: true, discountCents: discount, finalCents };
}
