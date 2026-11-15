import { describe, expect, it } from "vitest";
import { evaluateCoupon, normalizeCode, type CouponRule } from "@/lib/coupons";

const COURSE = { kind: "course", id: "course-1" } as const;
const BUNDLE = { kind: "bundle", id: "bundle-1" } as const;
const now = new Date("2026-06-10T12:00:00Z");

function coupon(overrides: Partial<CouponRule> = {}): CouponRule {
  return {
    id: "c1",
    code: "SAVE20",
    percent_off: 20,
    amount_off_cents: null,
    course_ids: null,
    max_redemptions: null,
    times_redeemed: 0,
    one_per_user: true,
    expires_at: null,
    active: true,
    ...overrides,
  };
}

function check(c: CouponRule | null, extra: Partial<Parameters<typeof evaluateCoupon>[0]> = {}) {
  return evaluateCoupon({
    coupon: c,
    product: COURSE,
    priceCents: 999,
    alreadyUsedByUser: false,
    now,
    ...extra,
  });
}

describe("evaluateCoupon", () => {
  it("accepts a valid code and returns the price", () => {
    expect(check(coupon())).toEqual({ ok: true, discountCents: 200, finalCents: 799 });
  });

  it("rejects an unknown code", () => {
    expect(check(null)).toMatchObject({ ok: false, reason: "not_found" });
  });

  it("rejects an inactive code", () => {
    expect(check(coupon({ active: false }))).toMatchObject({ ok: false, reason: "inactive" });
  });

  it("rejects an expired code, and accepts one that expires later", () => {
    expect(check(coupon({ expires_at: "2026-06-10T11:59:59Z" }))).toMatchObject({
      ok: false,
      reason: "expired",
    });
    expect(check(coupon({ expires_at: "2026-06-10T12:00:01Z" }))).toMatchObject({ ok: true });
  });

  it("rejects a used-up code", () => {
    expect(check(coupon({ max_redemptions: 5, times_redeemed: 5 }))).toMatchObject({
      ok: false,
      reason: "used_up",
    });
    expect(check(coupon({ max_redemptions: 5, times_redeemed: 4 }))).toMatchObject({ ok: true });
  });

  it("enforces one per user only when switched on", () => {
    expect(check(coupon(), { alreadyUsedByUser: true })).toMatchObject({
      ok: false,
      reason: "already_used",
    });
    expect(check(coupon({ one_per_user: false }), { alreadyUsedByUser: true })).toMatchObject({
      ok: true,
    });
  });

  it("limits a code to its courses", () => {
    expect(check(coupon({ course_ids: ["course-1"] }))).toMatchObject({ ok: true });
    expect(check(coupon({ course_ids: ["course-2"] }))).toMatchObject({
      ok: false,
      reason: "wrong_product",
    });
  });

  it("only allows unrestricted codes on the bundle", () => {
    expect(check(coupon(), { product: BUNDLE, priceCents: 3900 })).toEqual({
      ok: true,
      discountCents: 780,
      finalCents: 3120,
    });
    expect(
      check(coupon({ course_ids: ["course-1"] }), { product: BUNDLE, priceCents: 3900 }),
    ).toMatchObject({
      ok: false,
      reason: "wrong_product",
    });
  });

  it("makes a 100% code free (TEST100)", () => {
    expect(check(coupon({ code: "TEST100", percent_off: 100, max_redemptions: 5 }))).toEqual({
      ok: true,
      discountCents: 999,
      finalCents: 0,
    });
  });

  it("supports a $1 test price", () => {
    expect(check(coupon({ percent_off: null, amount_off_cents: 899 }))).toEqual({
      ok: true,
      discountCents: 899,
      finalCents: 100,
    });
  });

  it("rejects a price Stripe can't charge (1–49 cents)", () => {
    expect(check(coupon({ percent_off: null, amount_off_cents: 960 }))).toMatchObject({
      ok: false,
      reason: "below_minimum",
    });
    expect(check(coupon({ percent_off: null, amount_off_cents: 949 }))).toMatchObject({
      ok: true,
      finalCents: 50,
    });
  });

  it("caps a fixed discount at the price", () => {
    expect(check(coupon({ percent_off: null, amount_off_cents: 5000 }))).toEqual({
      ok: true,
      discountCents: 999,
      finalCents: 0,
    });
  });
});

describe("normalizeCode", () => {
  it("trims and uppercases", () => {
    expect(normalizeCode("  test100 ")).toBe("TEST100");
  });
});
