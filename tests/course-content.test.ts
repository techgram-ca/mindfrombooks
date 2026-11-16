import { describe, expect, it } from "vitest";
import { COURSES, courseAllowances } from "@/scripts/seed-data";

describe("course allowances by length", () => {
  it("gives 2 grace days and 2 samples under 25 days", () => {
    expect(courseAllowances(21)).toEqual({ graceDays: 2, sampleDays: 2 });
    expect(courseAllowances(24)).toEqual({ graceDays: 2, sampleDays: 2 });
  });
  it("gives 3 and 3 from 25 to 50 days", () => {
    expect(courseAllowances(25)).toEqual({ graceDays: 3, sampleDays: 3 });
    expect(courseAllowances(50)).toEqual({ graceDays: 3, sampleDays: 3 });
  });
  it("gives 4 grace days and 3 samples over 50 days", () => {
    expect(courseAllowances(51)).toEqual({ graceDays: 4, sampleDays: 3 });
    expect(courseAllowances(66)).toEqual({ graceDays: 4, sampleDays: 3 });
  });
});

describe("course content", () => {
  it("has six courses and 217 days in total", () => {
    expect(COURSES).toHaveLength(6);
    expect(COURSES.reduce((sum, c) => sum + c.days, 0)).toBe(217);
  });

  it.each(COURSES.map((c) => [c.slug, c] as const))(
    "%s has a complete task for every day",
    (_slug, c) => {
      expect(c.tasks).toHaveLength(c.days);
      expect(new Set(c.tasks.map((t) => t.title)).size).toBe(c.days);
      for (const [i, t] of c.tasks.entries()) {
        const where = `${c.slug} day ${i + 1}`;
        expect(t.title, where).not.toMatch(/coming soon/i);
        expect(t.title.length, where).toBeLessThanOrEqual(200);
        expect(t.book_insight.length, where).toBeGreaterThan(80);
        expect(t.book_insight.length, where).toBeLessThanOrEqual(2000);
        expect(t.book_reference, where).toMatch(/ — /); // "Title — Author"
        expect(t.instructions.length, where).toBeGreaterThanOrEqual(2);
        expect(t.instructions.length, where).toBeLessThanOrEqual(10);
        for (const step of t.instructions) expect(step.length, where).toBeLessThanOrEqual(500);
        expect(t.response_prompt.length, where).toBeGreaterThan(10);
        expect(t.response_prompt.length, where).toBeLessThanOrEqual(600);
      }
    },
  );

  it.each(COURSES.map((c) => [c.slug, c] as const))(
    "%s cites only books listed on its page",
    (_slug, c) => {
      const titles = c.books.map((b) => b.title.replace(" (ethical lessons only)", ""));
      for (const [i, t] of c.tasks.entries()) {
        const cited = titles.some((title) => t.book_reference.includes(title));
        expect(cited, `${c.slug} day ${i + 1}: ${t.book_reference}`).toBe(true);
      }
    },
  );

  it.each(COURSES.map((c) => [c.slug, c] as const))(
    "%s phases cover every day exactly once",
    (_slug, c) => {
      const covered = c.phases.flatMap((p) =>
        Array.from({ length: p.end_day - p.start_day + 1 }, (_, i) => p.start_day + i),
      );
      expect(covered).toEqual(Array.from({ length: c.days }, (_, i) => i + 1));
    },
  );
});
