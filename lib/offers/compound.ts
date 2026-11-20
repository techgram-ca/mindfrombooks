/** Future value of a fixed monthly contribution, compounded monthly. Pure, unit-tested. */
export function futureValue(monthly: number, years: number, yearlyRatePct: number): number {
  const n = Math.round(years * 12);
  const r = yearlyRatePct / 100 / 12;
  if (n <= 0 || monthly <= 0) return 0;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r);
}

export interface Projection {
  contributed: number;
  value: number;
  growth: number;
  /** Value if the same plan starts this many years later (same end date). */
  ifDelayed: number;
  delayYears: number;
}

export function project(
  monthly: number,
  years: number,
  ratePct: number,
  delayYears = 10,
): Projection {
  const value = futureValue(monthly, years, ratePct);
  const contributed = monthly * years * 12;
  const d = Math.min(delayYears, Math.max(0, years - 1));
  return {
    contributed,
    value,
    growth: Math.max(0, value - contributed),
    ifDelayed: futureValue(monthly, years - d, ratePct),
    delayYears: d,
  };
}
