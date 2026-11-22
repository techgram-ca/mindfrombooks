import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, jsonError, parseBody } from "@/lib/api";
import { requireUserApi } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  enrollmentId: z.string().uuid(),
  lesson: z.coerce.number().int().min(1).max(366),
  done: z.boolean(),
});

/** Tick (or untick) a workshop lesson. */
export const POST = handle(async (request: Request) => {
  const profile = await requireUserApi();
  if (!rateLimit(`lesson:${profile.id}`, 60, 60_000))
    return jsonError(429, "Slow down a little and try again.");
  const body = await parseBody(request, schema);
  const db = createAdminClient();
  const { data } = await db
    .from("enrollments")
    .select("id, user_id, status, courses(days, format)")
    .eq("id", body.enrollmentId)
    .eq("user_id", profile.id)
    .maybeSingle();
  const course = data?.courses as unknown as { days: number; format: string } | null;
  if (!data || !course) return jsonError(404, "We couldn't find that workshop.");
  if (course.format !== "self_paced") return jsonError(400, "This is a daily course.");
  if (data.status === "revoked" || data.status === "refunded")
    return jsonError(409, "This workshop is closed.");
  if (body.lesson > course.days) return jsonError(400, "That lesson doesn't exist.");

  if (body.done) {
    const { error } = await db
      .from("lesson_progress")
      .upsert(
        { enrollment_id: data.id, user_id: profile.id, lesson_number: body.lesson },
        { onConflict: "enrollment_id,lesson_number", ignoreDuplicates: true },
      );
    if (error) throw new Error(`lesson tick failed: ${error.message}`);
  } else {
    await db
      .from("lesson_progress")
      .delete()
      .eq("enrollment_id", data.id)
      .eq("lesson_number", body.lesson);
  }
  const { count } = await db
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("enrollment_id", data.id)
    .lte("lesson_number", course.days);
  // All lessons ticked → completed (shows under My courses → Completed);
  // unticking one reopens it.
  const allDone = (count ?? 0) >= course.days;
  if (allDone && data.status === "active")
    await db
      .from("enrollments")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("status", "active");
  else if (!allDone && data.status === "completed")
    await db
      .from("enrollments")
      .update({ status: "active", completed_at: null })
      .eq("id", data.id)
      .eq("status", "completed");
  await db
    .from("profiles")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", profile.id);
  return NextResponse.json({ ok: true, done: count ?? 0, total: course.days });
});
