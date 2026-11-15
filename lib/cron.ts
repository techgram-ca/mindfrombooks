import "server-only";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { completeEnrollment } from "@/lib/completion";
import { isPastFinalDay, localHour, openDayNumber, todayInTz } from "@/lib/course-days";
import { computeProgress } from "@/lib/refunds";
import { getSettings } from "@/lib/queries/catalog";
import { plural, siteUrl } from "@/lib/utils";
import type { Course, Enrollment, Profile } from "@/lib/types";

/** Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. */
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

type Row = Enrollment & { courses: Course; profiles: Profile };

async function loadActive(): Promise<Row[]> {
  const db = createAdminClient();
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("enrollments")
      .select("*, courses(*), profiles!enrollments_user_id_fkey(*)")
      .eq("status", "active")
      .not("start_date", "is", null)
      .order("created_at")
      .range(from, from + 999);
    if (error) throw new Error(`could not load enrollments: ${error.message}`);
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

async function respondedDays(enrollmentIds: string[]): Promise<Map<string, Set<number>>> {
  const db = createAdminClient();
  const map = new Map<string, Set<number>>();
  for (let i = 0; i < enrollmentIds.length; i += 200) {
    const { data, error } = await db
      .from("responses")
      .select("enrollment_id, day_number")
      .in("enrollment_id", enrollmentIds.slice(i, i + 200));
    if (error) throw new Error(`could not load responses: ${error.message}`);
    for (const r of data ?? []) {
      const set = map.get(r.enrollment_id as string) ?? new Set<number>();
      set.add(r.day_number as number);
      map.set(r.enrollment_id as string, set);
    }
  }
  return map;
}

export type DigestKind = "daily_reminder" | "missed_yesterday";

export interface DigestResult {
  due: number;
  sent: number;
  skipped: number;
  failed: number;
}

/**
 * The daily email. Each learner gets at most ONE a day, at their reminder
 * hour, and only if a task is still waiting:
 *   - "missed_yesterday" when they skipped yesterday in any course
 *   - "daily_reminder" otherwise
 * The two cron routes call this with their own kind; a learner only ever
 * matches one of them, and email_log's unique index is the final guard.
 */
export async function runDailyDigest(kind: DigestKind, now = new Date()): Promise<DigestResult> {
  const result: DigestResult = { due: 0, sent: 0, skipped: 0, failed: 0 };
  const rows = (await loadActive()).filter(
    (r) =>
      r.profiles?.email_reminders &&
      localHour(r.profiles.timezone, now) === r.profiles.reminder_hour,
  );
  if (rows.length === 0) return result;
  const responded = await respondedDays(rows.map((r) => r.id));
  const db = createAdminClient();

  const byUser = new Map<string, Row[]>();
  for (const r of rows) byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r]);

  for (const [, enrollments] of byUser) {
    const profile = enrollments[0].profiles;
    type Pending = { row: Row; day: number; missedYesterday: boolean };
    const pending: Pending[] = [];
    for (const row of enrollments) {
      const today = todayInTz(row.timezone, now);
      const day = openDayNumber(row.start_date, today, row.courses.days);
      const done = responded.get(row.id) ?? new Set<number>();
      if (day == null || done.has(day)) continue;
      pending.push({ row, day, missedYesterday: day > 1 && !done.has(day - 1) });
    }
    if (pending.length === 0) continue;

    const missed = pending.find((p) => p.missedYesterday);
    const userKind: DigestKind = missed ? "missed_yesterday" : "daily_reminder";
    if (userKind !== kind) continue;
    result.due += 1;

    const focus = missed ?? pending[0];
    const { row, day } = focus;
    const { data: task } = await db
      .from("tasks")
      .select("title")
      .eq("course_id", row.course_id)
      .eq("day_number", day)
      .maybeSingle();

    const done = responded.get(row.id) ?? new Set<number>();
    const progress = computeProgress({
      status: row.status,
      source: row.source,
      amountPaidCents: row.amount_paid_cents,
      startDate: row.start_date,
      graceDays: row.grace_days,
      totalDays: row.courses.days,
      respondedDays: done,
      today: todayInTz(row.timezone, now),
      refundWindowDays: 14,
    });
    const others = pending.length - 1;

    const outcome = await sendEmail({
      to: profile.email,
      userId: profile.id,
      templateKey: kind,
      enrollmentId: row.id,
      dedupeKey: "daily",
      localDate: todayInTz(profile.timezone, now),
      vars: {
        name: profile.name.trim().split(/\s+/)[0] || "there",
        course_name: row.courses.name,
        day,
        days: row.courses.days,
        task_title: (task?.title as string | undefined) ?? `Day ${day}`,
        more_line:
          others > 0 ? `\n\nYou also have ${plural(others, "more task")} waiting today.` : "",
        grace_line:
          progress.isPaid && progress.onTrackForRefund
            ? `\n\nYou're still covered by the refund guarantee — ${plural(progress.graceLeft, "grace day")} left.`
            : "",
      },
      buttonUrl: siteUrl(`/dashboard/courses/${row.courses.slug}/day/${day}`),
    });
    result[outcome.status] += 1;
  }
  return result;
}

/** Close out enrollments whose final day has passed in the learner's timezone. */
export async function runCompletions(
  now = new Date(),
): Promise<{ checked: number; completed: number }> {
  const rows = (await loadActive()).filter((r) =>
    isPastFinalDay(r.start_date, todayInTz(r.timezone, now), r.courses.days),
  );
  if (rows.length === 0) return { checked: 0, completed: 0 };
  const [responded, settings] = await Promise.all([
    respondedDays(rows.map((r) => r.id)),
    getSettings(),
  ]);
  const db = createAdminClient();
  const { data: catalog } = await db
    .from("courses")
    .select("id, name")
    .eq("status", "published")
    .order("sort_order");

  let completed = 0;
  for (const row of rows) {
    const progress = computeProgress({
      status: row.status,
      source: row.source,
      amountPaidCents: row.amount_paid_cents,
      startDate: row.start_date,
      graceDays: row.grace_days,
      totalDays: row.courses.days,
      respondedDays: responded.get(row.id) ?? [],
      today: todayInTz(row.timezone, now),
      refundWindowDays: settings.refund_window_days,
    });
    const { data: held } = await db
      .from("enrollments")
      .select("course_id")
      .eq("user_id", row.user_id);
    const heldIds = new Set((held ?? []).map((h) => h.course_id as string));
    const next = (catalog ?? []).find((c) => !heldIds.has(c.id as string));
    const done = await completeEnrollment({
      enrollment: row,
      course: row.courses,
      profile: row.profiles,
      progress,
      nextCourseName: (next?.name as string | undefined) ?? null,
    });
    if (done) completed += 1;
  }
  return { checked: rows.length, completed };
}
