/** Pure pricing maths. All amounts are integer cents in USD. */

/** Stripe will not charge less than US$0.50. */
export const STRIPE_MIN_CHARGE_CENTS = 50;

export interface CouponDiscount {
  percent_off: number | null;
  amount_off_cents: number | null;
}

/** Discount in cents, never more than the price. */
export function discountCents(priceCents: number, coupon: CouponDiscount | null): number {
  if (!coupon || priceCents <= 0) return 0;
  let off = 0;
  if (coupon.percent_off != null) {
    off = Math.round((priceCents * coupon.percent_off) / 100);
  } else if (coupon.amount_off_cents != null) {
    off = coupon.amount_off_cents;
  }
  return Math.max(0, Math.min(priceCents, off));
}

/** Final price = price − discount, never below 0. */
export function finalPriceCents(priceCents: number, coupon: CouponDiscount | null): number {
  return Math.max(0, priceCents - discountCents(priceCents, coupon));
}

/**
 * Split an amount across n items so the parts always add up to the total.
 * Any remainder cents go to the first items. Used for the refundable amount of
 * each course in a bundle.
 */
export function splitAmount(totalCents: number, parts: number): number[] {
  if (parts <= 0) return [];
  const base = Math.floor(totalCents / parts);
  const remainder = totalCents - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < remainder ? 1 : 0));
}

/** "US$9.99" — always marked as US dollars so Canadian visitors are not surprised. */
export function formatUsd(cents: number): string {
  const dollars = cents / 100;
  const text = Number.isInteger(dollars) ? dollars.toFixed(0) : dollars.toFixed(2);
  return `US$${text}`;
}
