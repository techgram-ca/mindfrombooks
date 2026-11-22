import { describe, expect, it } from "vitest";
import { computeProgress, type ProgressInput } from "@/lib/refunds";

const START = "2026-06-11";
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

function progress(overrides: Partial<ProgressInput> = {}) {
  return computeProgress({
    status: "active",
    source: "stripe",
    amountPaidCents: 999,
    startDate: START,
    graceDays: 0,
    totalDays: 10,
    respondedDays: range(1, 10),
    today: "2026-06-21", // the day after day 10
    refundWindowDays: 14,
    ...overrides,
  });
}

describe("refund eligibility", () => {
  it("is eligible after responding to every day", () => {
    const p = progress();
    expect(p.refundEligible).toBe(true);
    expect(p.refundIneligibleReason).toBeNull();
    expect(p.isComplete).toBe(true);
    expect(p.refundDeadline).toBe("2026-07-04"); // final day Jun 20 + 14
  });

  it("is eligible on the final day itself once that response is in", () => {
    expect(progress({ today: "2026-06-20" }).refundEligible).toBe(true);
  });

  it("is not eligible before the course is finished", () => {
    const p = progress({ today: "2026-06-15", respondedDays: range(1, 5) });
    expect(p.refundEligible).toBe(false);
    expect(p.onTrackForRefund).toBe(true);
    expect(p.refundIneligibleReason).toBe("Available once you finish Day 10");
  });

  it("explains which days were missed", () => {
    const p = progress({ respondedDays: [1, 2, 3, 4, 6, 7, 8, 9] });
    expect(p.refundEligible).toBe(false);
    expect(p.missedDays).toEqual([5, 10]);
    expect(p.refundIneligibleReason).toBe("Missed 2 days (Day 5, Day 10)");
  });

  it("uses the singular for one missed day", () => {
    expect(progress({ respondedDays: range(2, 10) }).refundIneligibleReason).toBe(
      "Missed 1 day (Day 1)",
    );
  });

  it("does not count today as missed while it is still open", () => {
    const p = progress({ today: "2026-06-15", respondedDays: range(1, 4) });
    expect(p.missedDays).toEqual([]);
    expect(p.onTrackForRefund).toBe(true);
  });

  it("loses the guarantee the moment a day is missed with no grace", () => {
    const p = progress({ today: "2026-06-15", respondedDays: [1, 2, 4] });
    expect(p.missedDays).toEqual([3]);
    expect(p.onTrackForRefund).toBe(false);
  });

  it("closes after the refund window", () => {
    expect(progress({ today: "2026-07-04" }).refundEligible).toBe(true); // last day of window
    const late = progress({ today: "2026-07-05" });
    expect(late.refundEligible).toBe(false);
    expect(late.refundIneligibleReason).toBe("Refund window closed on 2026-07-04");
  });

  it("respects a different window length", () => {
    expect(progress({ today: "2026-06-28", refundWindowDays: 7 }).refundEligible).toBe(false);
    expect(progress({ today: "2026-06-27", refundWindowDays: 7 }).refundEligible).toBe(true);
  });

  it("is never eligible once refunded or revoked", () => {
    expect(progress({ status: "refunded" }).refundIneligibleReason).toBe("Already refunded");
    expect(progress({ status: "revoked" }).refundIneligibleReason).toBe("Access revoked");
  });

  it("stays eligible after the cron marks it completed", () => {
    expect(progress({ status: "completed" }).refundEligible).toBe(true);
  });

  it("treats free access as not refundable", () => {
    for (const source of ["admin_grant", "coupon_free"] as const) {
      const p = progress({ source, amountPaidCents: 0 });
      expect(p.refundEligible).toBe(false);
      expect(p.isPaid).toBe(false);
      expect(p.refundIneligibleReason).toBe("Free access");
    }
  });

  it("covers each bundle course on its own", () => {
    const p = progress({ source: "bundle", amountPaidCents: 650 });
    expect(p.refundEligible).toBe(true);
  });

  it("is not eligible for a bundle course that hasn't been started", () => {
    const p = progress({
      source: "bundle",
      amountPaidCents: 650,
      startDate: null,
      respondedDays: [],
    });
    expect(p.refundEligible).toBe(false);
    expect(p.currentDay).toBe(0);
    expect(p.refundIneligibleReason).toBe("Course not started yet");
  });

  it("ignores responses outside the course length (course shortened by admin)", () => {
    const p = progress({ totalDays: 3, respondedDays: range(1, 10), today: "2026-06-14" });
    expect(p.respondedCount).toBe(3);
    expect(p.refundEligible).toBe(true);
  });
});

describe("grace days", () => {
  it("allows missed days up to the grace allowance", () => {
    const p = progress({ graceDays: 2, respondedDays: [1, 2, 3, 4, 6, 7, 8, 9] });
    expect(p.missedDays).toEqual([5, 10]);
    expect(p.refundEligible).toBe(true);
    expect(p.graceLeft).toBe(0);
  });

  it("rejects one miss too many and says how many are allowed", () => {
    const p = progress({ graceDays: 2, respondedDays: [1, 2, 3, 6, 7, 8, 9] });
    expect(p.refundEligible).toBe(false);
    expect(p.refundIneligibleReason).toBe("Missed 3 days (Day 4, Day 5, Day 10) — up to 2 allowed");
  });

  it("uses the allowance stored on the enrollment, whatever the course says now", () => {
    // Bought when the course allowed 2; the admin later changed the course to 0.
    // The enrollment still carries graceDays = 2, which is what is passed in.
    expect(progress({ graceDays: 2, respondedDays: range(3, 10) }).refundEligible).toBe(true);
    // And the reverse: bought with 0, course later raised to 2 → still 0.
    expect(progress({ graceDays: 0, respondedDays: range(3, 10) }).refundEligible).toBe(false);
  });

  it("reports grace left while the course is running", () => {
    const p = progress({ graceDays: 2, today: "2026-06-15", respondedDays: [1, 2, 4] });
    expect(p.onTrackForRefund).toBe(true);
    expect(p.graceLeft).toBe(1);
  });

  it("lets a missed final day be covered by grace once the day has passed", () => {
    const p = progress({ graceDays: 1, respondedDays: range(1, 9), today: "2026-06-21" });
    expect(p.isComplete).toBe(true);
    expect(p.refundEligible).toBe(true);
    // …but not while the final day is still open
    expect(
      progress({ graceDays: 1, respondedDays: range(1, 9), today: "2026-06-20" }).refundEligible,
    ).toBe(false);
  });
});

describe("progress numbers", () => {
  it("reports the day before the course starts", () => {
    const p = progress({ today: "2026-06-10", respondedDays: [] });
    expect(p.currentDay).toBe(0);
    expect(p.remainingDays).toBe(10);
    expect(p.missedDays).toEqual([]);
  });
  it("counts remaining days including today when unanswered", () => {
    expect(progress({ today: "2026-06-13", respondedDays: [1, 2] }).remainingDays).toBe(8);
    expect(progress({ today: "2026-06-13", respondedDays: [1, 2, 3] }).remainingDays).toBe(7);
  });
});

describe("courses without the guarantee", () => {
  it("are never refund-eligible, even when every day was done", () => {
    const p = progress({ hasGuarantee: false });
    expect(p.refundEligible).toBe(false);
    expect(p.onTrackForRefund).toBe(false);
    expect(p.refundIneligibleReason).toBe("No refund guarantee on this course");
  });
});

describe("self-paced workshops", () => {
  const workshop = (respondedDays: number[], status: ProgressInput["status"] = "active") =>
    computeProgress({
      status,
      source: "stripe",
      amountPaidCents: 699,
      startDate: "2026-06-11",
      graceDays: 0,
      totalDays: 14,
      respondedDays,
      today: "2026-09-01",
      refundWindowDays: 14,
      format: "self_paced",
      hasGuarantee: false,
    });

  it("count ticked lessons and never miss days", () => {
    const p = workshop([1, 2, 5]);
    expect(p.respondedCount).toBe(3);
    expect(p.missedDays).toEqual([]);
    expect(p.remainingDays).toBe(11);
    expect(p.isComplete).toBe(false);
  });
  it("are complete when every lesson is ticked", () => {
    expect(workshop(range(1, 14)).isComplete).toBe(true);
  });
  it("are never refund-eligible", () => {
    expect(workshop(range(1, 14)).refundEligible).toBe(false);
    expect(workshop([], "refunded").refundIneligibleReason).toBe("Already refunded");
  });
});
