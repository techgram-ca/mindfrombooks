import { describe, expect, it } from "vitest";
import { discountCents, finalPriceCents, formatUsd, splitAmount, percentOff } from "@/lib/pricing";

describe("discounts", () => {
  it("applies a percentage", () => {
    expect(discountCents(999, { percent_off: 20, amount_off_cents: null })).toBe(200);
    expect(finalPriceCents(999, { percent_off: 20, amount_off_cents: null })).toBe(799);
  });
  it("applies a fixed amount", () => {
    expect(finalPriceCents(999, { percent_off: null, amount_off_cents: 899 })).toBe(100);
  });
  it("never goes below zero", () => {
    expect(finalPriceCents(799, { percent_off: null, amount_off_cents: 5000 })).toBe(0);
    expect(discountCents(799, { percent_off: null, amount_off_cents: 5000 })).toBe(799);
  });
  it("makes a 100% code free", () => {
    expect(finalPriceCents(1299, { percent_off: 100, amount_off_cents: null })).toBe(0);
  });
  it("is unchanged with no coupon", () => {
    expect(finalPriceCents(999, null)).toBe(999);
  });
});

describe("bundle refund split", () => {
  it("splits evenly when it divides", () => {
    expect(splitAmount(3900, 6)).toEqual([650, 650, 650, 650, 650, 650]);
  });
  it("gives leftover cents to the first courses and always sums to the total", () => {
    const parts = splitAmount(3899, 6);
    expect(parts).toEqual([650, 650, 650, 650, 650, 649]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(3899);
  });
  it("handles a discounted bundle and odd sizes", () => {
    for (const [total, n] of [
      [1950, 6],
      [100, 6],
      [5, 6],
      [3900, 4],
      [0, 6],
    ] as const) {
      const parts = splitAmount(total, n);
      expect(parts).toHaveLength(n);
      expect(parts.reduce((a, b) => a + b, 0)).toBe(total);
      expect(Math.max(...parts) - Math.min(...parts)).toBeLessThanOrEqual(1);
    }
  });
  it("returns nothing for zero parts", () => {
    expect(splitAmount(3900, 0)).toEqual([]);
  });
});

describe("percentOff", () => {
  it("rounds to a whole percent", () => {
    expect(percentOff(1999, 699)).toBe(65); // 65.03
    expect(percentOff(1000, 298)).toBe(70); // 70.2 → 70
    expect(percentOff(1000, 295)).toBe(71); // 70.5 → 71
  });
  it("is 0 without a real discount", () => {
    expect(percentOff(null, 699)).toBe(0);
    expect(percentOff(undefined, 699)).toBe(0);
    expect(percentOff(699, 699)).toBe(0);
    expect(percentOff(500, 699)).toBe(0);
  });
  it("is 100 when free", () => {
    expect(percentOff(1999, 0)).toBe(100);
  });
});

describe("formatUsd", () => {
  it("always marks US dollars", () => {
    expect(formatUsd(999)).toBe("US$9.99");
    expect(formatUsd(3900)).toBe("US$39");
    expect(formatUsd(650)).toBe("US$6.50");
  });
});
