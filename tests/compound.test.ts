import { describe, expect, it } from "vitest";
import { futureValue, project } from "@/lib/offers/compound";

describe("compounding illustration", () => {
  it("with no return is just the sum of deposits", () => {
    expect(futureValue(100, 10, 0)).toBe(12000);
  });
  it("matches the standard annuity formula", () => {
    // 100/month for 30 years at 7%/yr compounded monthly ≈ 121,997
    expect(Math.round(futureValue(100, 30, 7))).toBe(121997);
  });
  it("splits contributions and growth", () => {
    const p = project(100, 30, 7);
    expect(p.contributed).toBe(36000);
    expect(Math.round(p.growth)).toBe(85997);
  });
  it("shows the cost of starting 10 years later", () => {
    const p = project(100, 30, 7);
    expect(p.delayYears).toBe(10);
    expect(Math.round(p.ifDelayed)).toBe(Math.round(futureValue(100, 20, 7)));
    expect(p.ifDelayed).toBeLessThan(p.value);
  });
  it("never delays past the plan itself", () => {
    expect(project(100, 3, 7).delayYears).toBe(2);
    expect(project(100, 1, 7).delayYears).toBe(0);
  });
  it("handles zero amounts", () => {
    expect(futureValue(0, 10, 7)).toBe(0);
    expect(futureValue(100, 0, 7)).toBe(0);
  });
});
