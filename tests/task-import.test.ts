import { describe, expect, it } from "vitest";
import { parseCsv } from "@/lib/csv";
import { parseTaskImport } from "@/lib/task-import";

describe("parseCsv", () => {
  it("handles quotes, commas, escaped quotes and newlines inside fields", () => {
    expect(parseCsv('a,b\r\n"x, y","he said ""hi"""\n"line1\nline2",z\n')).toEqual([
      ["a", "b"],
      ["x, y", 'he said "hi"'],
      ["line1\nline2", "z"],
    ]);
  });
});

describe("parseTaskImport", () => {
  it("reads JSON", () => {
    const { tasks, errors } = parseTaskImport(
      JSON.stringify([
        { day_number: 2, title: "B", instructions: ["one", "two"] },
        { day_number: 1, title: "A" },
      ]),
      5,
    );
    expect(errors).toEqual([]);
    expect(tasks.map((t) => t.day_number)).toEqual([1, 2]);
    expect(tasks[1].instructions).toEqual(["one", "two"]);
    expect(tasks[0].min_response_chars).toBe(0);
  });

  it("reads CSV with pipe-separated instructions", () => {
    const csv =
      'day_number,title,instructions,min_response_chars,is_sample\n4,"Cancel one, maybe two",Open app | Cancel it,50,yes\n';
    const { tasks, errors } = parseTaskImport(csv, 5);
    expect(errors).toEqual([]);
    expect(tasks[0]).toMatchObject({
      day_number: 4,
      title: "Cancel one, maybe two",
      instructions: ["Open app", "Cancel it"],
      min_response_chars: 50,
      is_sample: true,
    });
  });

  it("reports bad rows without dropping the good ones", () => {
    const { tasks, errors } = parseTaskImport(
      JSON.stringify([
        { day_number: 1, title: "ok" },
        { day_number: 2 },
        { day_number: 9, title: "late" },
        { day_number: 1, title: "dup" },
      ]),
      5,
    );
    expect(tasks).toHaveLength(1);
    expect(errors).toHaveLength(3);
    expect(errors[1]).toContain("beyond this course's 5 days");
    expect(errors[2]).toContain("more than once");
  });

  it("rejects junk", () => {
    expect(parseTaskImport("[oops", 5).errors[0]).toContain("valid JSON");
    expect(parseTaskImport("foo,bar\n1,2", 5).errors[0]).toContain("header row");
    expect(parseTaskImport("", 5).errors).toHaveLength(1);
  });
});
