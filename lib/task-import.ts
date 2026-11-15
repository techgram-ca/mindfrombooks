/**
 * Bulk task import, shared by the browser (preview) and the server (save).
 * Accepts JSON (an array of tasks) or CSV with a header row:
 *   day_number,title,book_insight,book_reference,instructions,response_prompt,min_response_chars,is_sample
 * In CSV, separate instruction bullets with " | ".
 */
import { csvToObjects } from "./csv";
import { importTaskSchema, type ImportTask } from "./validators/admin";

export interface ImportPreview {
  tasks: ImportTask[];
  errors: string[];
}

function toBool(v: unknown): boolean {
  return v === true || /^(true|yes|1|y)$/i.test(String(v ?? "").trim());
}

export function parseTaskImport(raw: string, totalDays: number): ImportPreview {
  const text = raw.trim();
  if (!text) return { tasks: [], errors: ["Paste JSON or CSV, or choose a file."] };

  let rows: Record<string, unknown>[];
  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : (parsed as { tasks?: unknown }).tasks;
      if (!Array.isArray(list)) return { tasks: [], errors: ["JSON must be an array of tasks."] };
      rows = list as Record<string, unknown>[];
    } catch (err) {
      return {
        tasks: [],
        errors: [`That isn't valid JSON: ${err instanceof Error ? err.message : "parse error"}`],
      };
    }
  } else {
    rows = csvToObjects(text).map((r) => ({
      ...r,
      instructions: (r.instructions ?? "")
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean),
    }));
    if (rows.length > 0 && !("day_number" in rows[0] && "title" in rows[0])) {
      return { tasks: [], errors: ["CSV needs a header row with at least day_number and title."] };
    }
  }

  const tasks: ImportTask[] = [];
  const errors: string[] = [];
  const seen = new Set<number>();
  rows.forEach((row, i) => {
    const label = `Row ${i + 1}`;
    const instructions = Array.isArray(row.instructions)
      ? row.instructions
      : String(row.instructions ?? "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
    const result = importTaskSchema.safeParse({
      ...row,
      instructions,
      is_sample: toBool(row.is_sample),
    });
    if (!result.success) {
      errors.push(
        `${label}: ${result.error.issues.map((x) => `${x.path.join(".") || "task"} — ${x.message}`).join("; ")}`,
      );
      return;
    }
    const task = result.data;
    if (task.day_number > totalDays)
      errors.push(`${label}: day ${task.day_number} is beyond this course's ${totalDays} days.`);
    else if (seen.has(task.day_number))
      errors.push(`${label}: day ${task.day_number} appears more than once.`);
    else {
      seen.add(task.day_number);
      tasks.push(task);
    }
  });
  if (rows.length === 0) errors.push("No tasks found.");
  return { tasks: tasks.sort((a, b) => a.day_number - b.day_number), errors };
}
