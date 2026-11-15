import { describe, expect, it } from "vitest";
import {
  addDays,
  closeInstant,
  computeStreak,
  currentDayNumber,
  daysBetween,
  dayStatus,
  isPastFinalDay,
  localHour,
  openDayNumber,
  safeTimezone,
  startDateForEnrollment,
  todayInTz,
  unlockInstant,
} from "@/lib/course-days";

const TORONTO = "America/Toronto";

describe("todayInTz", () => {
  it("uses the learner's timezone, not UTC", () => {
    // 03:30 UTC on Jan 16 is still Jan 15 in Toronto (UTC-5)…
    const now = new Date("2026-01-16T03:30:00Z");
    expect(todayInTz(TORONTO, now)).toBe("2026-01-15");
    // …and already Jan 16 in Kolkata (UTC+5:30).
    expect(todayInTz("Asia/Kolkata", now)).toBe("2026-01-16");
  });

  it("falls back to the default timezone for junk input", () => {
    expect(safeTimezone("Not/AZone")).toBe(TORONTO);
    expect(safeTimezone(null)).toBe(TORONTO);
  });
});

describe("enrollment start date — always the next day", () => {
  it("starts tomorrow when enrolling mid-afternoon", () => {
    expect(startDateForEnrollment(TORONTO, new Date("2026-06-10T18:00:00Z"))).toBe("2026-06-11");
  });

  it("starts tomorrow when enrolling at 11:59 pm", () => {
    // 23:59 Toronto (EDT, UTC-4) on June 10
    expect(startDateForEnrollment(TORONTO, new Date("2026-06-11T03:59:00Z"))).toBe("2026-06-11");
  });

  it("starts tomorrow even when enrolling at 12:01 am", () => {
    // 00:01 Toronto on June 11 → starts June 12, not June 11
    expect(startDateForEnrollment(TORONTO, new Date("2026-06-11T04:01:00Z"))).toBe("2026-06-12");
  });

  it("handles month and year ends", () => {
    expect(startDateForEnrollment("UTC", new Date("2026-12-31T12:00:00Z"))).toBe("2027-01-01");
    expect(startDateForEnrollment("UTC", new Date("2028-02-28T12:00:00Z"))).toBe("2028-02-29");
  });
});

describe("current day", () => {
  const start = "2026-06-11";
  it("is 0 before the start date and with no start date", () => {
    expect(currentDayNumber(start, "2026-06-10", 31)).toBe(0);
    expect(currentDayNumber(null, "2026-06-10", 31)).toBe(0);
    expect(openDayNumber(start, "2026-06-10", 31)).toBeNull();
    expect(openDayNumber(null, "2026-06-10", 31)).toBeNull();
  });

  it("is day 1 on the start date and counts up", () => {
    expect(currentDayNumber(start, "2026-06-11", 31)).toBe(1);
    expect(currentDayNumber(start, "2026-06-12", 31)).toBe(2);
    expect(openDayNumber(start, "2026-07-11", 31)).toBe(31);
  });

  it("is capped at the course length, and nothing is open afterwards", () => {
    expect(currentDayNumber(start, "2026-08-01", 31)).toBe(31);
    expect(openDayNumber(start, "2026-07-12", 31)).toBeNull();
    expect(isPastFinalDay(start, "2026-07-11", 31)).toBe(false);
    expect(isPastFinalDay(start, "2026-07-12", 31)).toBe(true);
  });
});

describe("daylight saving time", () => {
  it("counts calendar days across spring forward (23-hour day)", () => {
    // Toronto springs forward on 2026-03-08.
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
    expect(currentDayNumber("2026-03-07", "2026-03-09", 10)).toBe(3);
  });

  it("counts calendar days across fall back (25-hour day)", () => {
    // Toronto falls back on 2026-11-01.
    expect(currentDayNumber("2026-10-31", "2026-11-02", 10)).toBe(3);
  });

  it("unlocks at local midnight on both sides of a DST change", () => {
    // Day 1 = Mar 7 (EST, UTC-5): midnight local = 05:00Z
    expect(unlockInstant("2026-03-07", 1, TORONTO).toISOString()).toBe("2026-03-07T05:00:00.000Z");
    // Day 3 = Mar 9 (EDT, UTC-4): midnight local = 04:00Z
    expect(unlockInstant("2026-03-07", 3, TORONTO).toISOString()).toBe("2026-03-09T04:00:00.000Z");
    // The DST day itself (Mar 8) is only 23 hours long.
    const open = unlockInstant("2026-03-07", 2, TORONTO).getTime();
    const close = closeInstant("2026-03-07", 2, TORONTO).getTime();
    expect((close - open) / 3_600_000).toBe(23);
  });

  it("flips to the next day exactly at local midnight on the DST day", () => {
    expect(todayInTz(TORONTO, new Date("2026-03-09T03:59:59Z"))).toBe("2026-03-08");
    expect(todayInTz(TORONTO, new Date("2026-03-09T04:00:00Z"))).toBe("2026-03-09");
  });
});

describe("dayStatus", () => {
  const start = "2026-06-11";
  const responded = new Set([1, 3]);
  it("labels each day", () => {
    const today = "2026-06-14"; // day 4
    expect(dayStatus(1, start, today, 10, responded)).toBe("done");
    expect(dayStatus(2, start, today, 10, responded)).toBe("missed");
    expect(dayStatus(4, start, today, 10, responded)).toBe("today");
    expect(dayStatus(5, start, today, 10, responded)).toBe("locked");
  });
  it("locks everything before the course starts", () => {
    expect(dayStatus(1, start, "2026-06-10", 10, new Set())).toBe("locked");
    expect(dayStatus(1, null, "2026-06-10", 10, new Set())).toBe("locked");
  });
  it("marks an unanswered final day as missed once it has passed", () => {
    expect(dayStatus(10, start, "2026-06-21", 10, responded)).toBe("missed");
  });
});

describe("helpers", () => {
  it("addDays crosses months", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("localHour reads the wall clock", () => {
    expect(localHour(TORONTO, new Date("2026-06-10T12:30:00Z"))).toBe(8);
    expect(localHour("Asia/Kolkata", new Date("2026-06-10T12:30:00Z"))).toBe(18);
  });
  it("computeStreak counts back from today or yesterday", () => {
    expect(computeStreak(["2026-06-10", "2026-06-11", "2026-06-12"], "2026-06-12")).toBe(3);
    expect(computeStreak(["2026-06-10", "2026-06-11"], "2026-06-12")).toBe(2); // today still open
    expect(computeStreak(["2026-06-09", "2026-06-10"], "2026-06-12")).toBe(0); // broken
    expect(computeStreak(["2026-06-08", "2026-06-11", "2026-06-12"], "2026-06-12")).toBe(2);
    expect(computeStreak([], "2026-06-12")).toBe(0);
  });
});
