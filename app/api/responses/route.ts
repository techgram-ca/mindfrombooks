import { NextResponse } from "next/server";
import { handle, jsonError, parseBody } from "@/lib/api";
import { requireUserApi } from "@/lib/auth";
import { computeStreak, dateOfDay, openDayNumber, todayInTz } from "@/lib/course-days";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { responseSchema } from "@/lib/validators/responses";
import type { Course, Enrollment, Task } from "@/lib/types";

/**
 * Save (or edit) today's response. The client never says which day it is —
 * the server works it out from the enrollment's start date and timezone, so a
 * response can only ever land on the day that is open right now.
 */
export const POST = handle(async (request: Request) => {
  const profile = await requireUserApi();
  if (!rateLimit(`response:${profile.id}`, 20, 60_000)) {
    return jsonError(429, "You're saving very quickly. Wait a moment and try again.");
  }
  const body = await parseBody(request, responseSchema);
  const db = createAdminClient();

  const { data } = await db
    .from("enrollments")
    .select("*, courses(*)")
    .eq("id", body.enrollmentId)
    .eq("user_id", profile.id)
    .maybeSingle();
  type Row = Enrollment & { courses: Course };
  const enrollment = data as Row | null;
  if (!enrollment) return jsonError(404, "We couldn't find that course.");
  if (enrollment.status !== "active") {
    return jsonError(409, "This course is closed, so responses can't be changed any more.");
  }
  const course = enrollment.courses;
  if (course.format === "self_paced") {
    return jsonError(409, "This is a self-paced workshop — mark lessons as done instead.");
  }

  const today = todayInTz(enrollment.timezone);
  const day = openDayNumber(enrollment.start_date, today, course.days);
  if (day == null) {
    return jsonError(
      409,
      !enrollment.start_date
        ? "Start this course first — Day 1 opens the next morning."
        : today < enrollment.start_date
          ? "Day 1 opens tomorrow morning."
          : "This course has finished.",
    );
  }

  const { data: taskRow } = await db
    .from("tasks")
    .select("id, min_response_chars")
    .eq("course_id", course.id)
    .eq("day_number", day)
    .maybeSingle();
  const task = taskRow as Pick<Task, "id" | "min_response_chars"> | null;
  const min = task?.min_response_chars ?? 0;
  if (body.body.length < min) {
    return jsonError(400, `Write at least ${min} characters — you're at ${body.body.length}.`);
  }

  const { data: before } = await db
    .from("responses")
    .select("id")
    .eq("enrollment_id", enrollment.id)
    .eq("day_number", day)
    .maybeSingle();

  // submitted_at is left out on purpose: it is set once, on the first save.
  const { error } = await db.from("responses").upsert(
    {
      enrollment_id: enrollment.id,
      user_id: profile.id,
      task_id: task?.id ?? null,
      day_number: day,
      body: body.body,
    },
    { onConflict: "enrollment_id,day_number" },
  );
  if (error) throw new Error(`response save failed: ${error.message}`);

  await db
    .from("profiles")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", profile.id);

  // Streak across all of this learner's courses.
  const { data: all } = await db
    .from("responses")
    .select("day_number, enrollments!inner(start_date)")
    .eq("user_id", profile.id);
  const dates = (
    (all ?? []) as unknown as { day_number: number; enrollments: { start_date: string | null } }[]
  )
    .filter((r) => r.enrollments.start_date)
    .map((r) => dateOfDay(r.enrollments.start_date as string, r.day_number));
  const streak = computeStreak(dates, todayInTz(profile.timezone));

  const { count } = await db
    .from("responses")
    .select("id", { count: "exact", head: true })
    .eq("enrollment_id", enrollment.id)
    .lte("day_number", course.days);

  return NextResponse.json({
    saved: true,
    edited: Boolean(before),
    dayNumber: day,
    totalDays: course.days,
    isFinalDay: day === course.days,
    respondedCount: count ?? 0,
    streak,
  });
});
