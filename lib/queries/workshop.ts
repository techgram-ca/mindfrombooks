import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LessonResource, Profile } from "@/lib/types";
import { getLearnerState, type EnrollmentView } from "@/lib/queries/learning";

export interface Lesson {
  number: number;
  taskId: string;
  title: string;
  intro: string;
  bookReference: string;
  steps: string[];
  resources: LessonResource[];
  hasVideo: boolean;
}

/** The signed-in learner's workshop enrolment, if they have one for this slug. */
export async function getWorkshopView(
  profile: Profile,
  slug: string,
): Promise<EnrollmentView | null> {
  const { views } = await getLearnerState(profile);
  const view = views.find((v) => v.course.slug === slug && v.course.format === "self_paced");
  if (!view || view.enrollment.status === "revoked") return null;
  return view;
}

/** All lessons of a workshop. Video ids are never returned — only whether a video exists. */
export async function getLessons(courseId: string, total: number): Promise<Lesson[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("tasks")
    .select("id, day_number, title, book_insight, book_reference, instructions, resources")
    .eq("course_id", courseId)
    .lte("day_number", total)
    .order("day_number");
  if (error) throw new Error(`Could not load lessons: ${error.message}`);
  const rows = (data ?? []) as {
    id: string;
    day_number: number;
    title: string;
    book_insight: string;
    book_reference: string;
    instructions: string[];
    resources: LessonResource[] | null;
  }[];
  const { data: videos } = await db
    .from("lesson_videos")
    .select("task_id")
    .in(
      "task_id",
      rows.map((r) => r.id),
    );
  const withVideo = new Set((videos ?? []).map((v) => v.task_id as string));
  return rows.map((r) => ({
    number: r.day_number,
    taskId: r.id,
    title: r.title,
    intro: r.book_insight,
    bookReference: r.book_reference,
    steps: r.instructions ?? [],
    resources: Array.isArray(r.resources) ? r.resources : [],
    hasVideo: withVideo.has(r.id),
  }));
}

/** Pull an 11-character YouTube id out of a URL or a bare id. */
export function parseYouTubeId(input: string): string | null {
  const v = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(v)) return v;
  try {
    const url = new URL(v);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return url.pathname.slice(1, 12) || null;
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && /^[A-Za-z0-9_-]{11}$/.test(fromQuery)) return fromQuery;
      const m = url.pathname.match(/\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch {
    return null;
  }
  return null;
}
