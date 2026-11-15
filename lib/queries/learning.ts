import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  computeStreak,
  dateOfDay,
  isPastFinalDay,
  openDayNumber,
  todayInTz,
  type DateStr,
} from "@/lib/course-days";
import { computeProgress, type Progress } from "@/lib/refunds";
import { completeEnrollment } from "@/lib/completion";
import { getSettings } from "@/lib/queries/catalog";
import type {
  AppSettings,
  Course,
  CoursePhase,
  Enrollment,
  Profile,
  ResponseRow,
  Task,
} from "@/lib/types";

export type LearnerPhase = "not_started" | "starts_tomorrow" | "in_progress" | "finished";

export interface EnrollmentView {
  enrollment: Enrollment;
  course: Course;
  phases: CoursePhase[];
  /** Today's date in the enrollment's timezone. */
  today: DateStr;
  responded: Set<number>;
  progress: Progress;
  /** The day accepting a response right now, if any. */
  openDay: number | null;
  todayDone: boolean;
  phase: LearnerPhase;
  /** Can the learner still write (active + a day is open)? */
  canRespond: boolean;
}

export interface LearnerState {
  views: EnrollmentView[];
  streak: number;
  settings: AppSettings;
}

export function phaseNameFor(phases: CoursePhase[], day: number): string | null {
  return phases.find((p) => day >= p.start_day && day <= p.end_day)?.name ?? null;
}

function buildView(
  enrollment: Enrollment,
  course: Course,
  phases: CoursePhase[],
  respondedDays: number[],
  settings: AppSettings,
  now: Date,
): EnrollmentView {
  const today = todayInTz(enrollment.timezone, now);
  const responded = new Set(respondedDays.filter((d) => d <= course.days));
  const progress = computeProgress({
    status: enrollment.status,
    source: enrollment.source,
    amountPaidCents: enrollment.amount_paid_cents,
    startDate: enrollment.start_date,
    graceDays: enrollment.grace_days,
    totalDays: course.days,
    respondedDays: responded,
    today,
    refundWindowDays: settings.refund_window_days,
  });
  const openDay = openDayNumber(enrollment.start_date, today, course.days);
  const phase: LearnerPhase = !enrollment.start_date
    ? "not_started"
    : isPastFinalDay(enrollment.start_date, today, course.days)
      ? "finished"
      : openDay
        ? "in_progress"
        : "starts_tomorrow";
  return {
    enrollment,
    course,
    phases,
    today,
    responded,
    progress,
    openDay,
    todayDone: openDay != null && responded.has(openDay),
    phase,
    canRespond: enrollment.status === "active" && openDay != null,
  };
}

/**
 * Everything the dashboard needs about the signed-in learner, in one go.
 * Reads go through the RLS client, so a missing filter can never leak another
 * person's rows.
 */
export const getLearnerState = cache(async (profile: Profile): Promise<LearnerState> => {
  const supabase = await createClient();
  const [settings, enrollmentsRes, responsesRes] = await Promise.all([
    getSettings(),
    supabase
      .from("enrollments")
      .select("*, courses(*)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: true }),
    supabase.from("responses").select("enrollment_id, day_number").eq("user_id", profile.id),
  ]);
  if (enrollmentsRes.error)
    throw new Error(`Could not load your courses: ${enrollmentsRes.error.message}`);

  type Row = Enrollment & { courses: Course };
  const rows = (enrollmentsRes.data ?? []) as Row[];
  const courseIds = [...new Set(rows.map((r) => r.course_id))];
  const { data: phaseRows } = courseIds.length
    ? await supabase.from("course_phases").select("*").in("course_id", courseIds).order("start_day")
    : { data: [] };
  const phases = (phaseRows ?? []) as CoursePhase[];

  const byEnrollment = new Map<string, number[]>();
  for (const r of (responsesRes.data ?? []) as Pick<
    ResponseRow,
    "enrollment_id" | "day_number"
  >[]) {
    const list = byEnrollment.get(r.enrollment_id) ?? [];
    list.push(r.day_number);
    byEnrollment.set(r.enrollment_id, list);
  }

  const now = new Date();
  const views = rows.map(({ courses: course, ...enrollment }) =>
    buildView(
      enrollment as Enrollment,
      course,
      phases.filter((p) => p.course_id === course.id),
      byEnrollment.get(enrollment.id) ?? [],
      settings,
      now,
    ),
  );

  // Close out courses whose final day has passed (the cron does this too).
  for (const view of views) {
    if (view.enrollment.status === "active" && view.phase === "finished") {
      const done = await completeEnrollment({
        enrollment: view.enrollment,
        course: view.course,
        profile,
        progress: view.progress,
      });
      if (done) view.enrollment = { ...view.enrollment, status: "completed" };
    }
  }

  // Streak: consecutive local days with at least one response in any course.
  const activeDates: DateStr[] = [];
  for (const view of views) {
    if (!view.enrollment.start_date) continue;
    for (const day of view.responded) activeDates.push(dateOfDay(view.enrollment.start_date, day));
  }
  const streak = computeStreak(activeDates, todayInTz(profile.timezone, now));

  return { views, streak, settings };
});

export async function getEnrollmentView(
  profile: Profile,
  slug: string,
): Promise<EnrollmentView | null> {
  const { views } = await getLearnerState(profile);
  return views.find((v) => v.course.slug === slug) ?? null;
}

export interface DayContent {
  dayNumber: number;
  status: "done" | "missed" | "today" | "locked";
  /** Full task for unlocked days; locked days only get a title. */
  task: Task | null;
  title: string;
  response: ResponseRow | null;
}

/**
 * Task content is paid, so it is read with the service role AFTER checking
 * that this learner's enrollment has reached that day.
 */
export async function getDayContent(
  view: EnrollmentView,
  dayNumber: number,
): Promise<DayContent | null> {
  if (dayNumber < 1 || dayNumber > view.course.days) return null;
  const db = createAdminClient();
  const { data: taskRow } = await db
    .from("tasks")
    .select("*")
    .eq("course_id", view.course.id)
    .eq("day_number", dayNumber)
    .maybeSingle();
  const task = taskRow as Task | null;

  const reached = view.progress.currentDay >= dayNumber && view.progress.currentDay > 0;
  const status: DayContent["status"] = view.responded.has(dayNumber)
    ? "done"
    : view.openDay === dayNumber
      ? "today"
      : reached
        ? "missed"
        : "locked";

  let response: ResponseRow | null = null;
  if (status === "done") {
    const { data } = await db
      .from("responses")
      .select("*")
      .eq("enrollment_id", view.enrollment.id)
      .eq("day_number", dayNumber)
      .maybeSingle();
    response = data as ResponseRow | null;
  }

  return {
    dayNumber,
    status,
    task: status === "locked" ? null : task,
    title: task?.title ?? `Day ${dayNumber}`,
    response,
  };
}

/** Day titles for the calendar (titles are public; content is not). */
export async function getDayTitles(courseId: string, days: number): Promise<Map<number, string>> {
  const { data } = await createAdminClient()
    .from("tasks")
    .select("day_number, title")
    .eq("course_id", courseId)
    .lte("day_number", days);
  return new Map((data ?? []).map((t) => [t.day_number as number, t.title as string]));
}

export interface JournalEntry {
  response: ResponseRow;
  title: string;
  prompt: string;
  date: DateStr | null;
}

export async function getJournal(view: EnrollmentView): Promise<JournalEntry[]> {
  const db = createAdminClient();
  const [{ data: responses }, { data: tasks }] = await Promise.all([
    db
      .from("responses")
      .select("*")
      .eq("enrollment_id", view.enrollment.id)
      .eq("user_id", view.enrollment.user_id)
      .order("day_number", { ascending: false }),
    db.from("tasks").select("day_number, title, response_prompt").eq("course_id", view.course.id),
  ]);
  const byDay = new Map((tasks ?? []).map((t) => [t.day_number as number, t]));
  return ((responses ?? []) as ResponseRow[]).map((response) => ({
    response,
    title:
      (byDay.get(response.day_number)?.title as string | undefined) ?? `Day ${response.day_number}`,
    prompt: (byDay.get(response.day_number)?.response_prompt as string | undefined) ?? "",
    date: view.enrollment.start_date
      ? dateOfDay(view.enrollment.start_date, response.day_number)
      : null,
  }));
}
