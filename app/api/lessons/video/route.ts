import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, jsonError } from "@/lib/api";
import { requireUserApi } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const query = z.object({
  enrollmentId: z.string().uuid(),
  lesson: z.coerce.number().int().min(1).max(366),
});

/**
 * Hands the lesson video's embed address to an enrolled learner, on demand.
 * The id is never in the page HTML or readable with the public key.
 */
export const GET = handle(async (request: Request) => {
  const profile = await requireUserApi();
  if (!rateLimit(`video:${profile.id}`, 60, 60_000))
    return jsonError(429, "Slow down a little and try again.");
  const url = new URL(request.url);
  const parsed = query.safeParse({
    enrollmentId: url.searchParams.get("enrollmentId"),
    lesson: url.searchParams.get("lesson"),
  });
  if (!parsed.success) return jsonError(400, "Invalid request.");
  const db = createAdminClient();

  const { data: enrollment } = await db
    .from("enrollments")
    .select("id, user_id, status, course_id")
    .eq("id", parsed.data.enrollmentId)
    .maybeSingle();
  const allowed =
    enrollment &&
    (enrollment.user_id === profile.id || profile.role === "admin") &&
    enrollment.status !== "revoked";
  if (!allowed) return jsonError(404, "Video not found.");

  const { data: task } = await db
    .from("tasks")
    .select("id")
    .eq("course_id", enrollment.course_id as string)
    .eq("day_number", parsed.data.lesson)
    .maybeSingle();
  if (!task) return jsonError(404, "Video not found.");
  const { data: video } = await db
    .from("lesson_videos")
    .select("youtube_id")
    .eq("task_id", task.id)
    .maybeSingle();
  if (!video) return jsonError(404, "This lesson's video isn't ready yet.");

  const params = new URLSearchParams({
    rel: "0",
    playsinline: "1",
    autoplay: "1",
  });
  return NextResponse.json(
    { src: `https://www.youtube-nocookie.com/embed/${video.youtube_id}?${params}` },
    { headers: { "cache-control": "no-store" } },
  );
});
