import "server-only";
import { cache } from "react";
import { createClient as createPlainClient, type SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type Bundle,
  type Course,
  type CourseBook,
  type CoursePhase,
  type Task,
} from "@/lib/types";
import { demoBooks, demoBundle, demoCourses, demoPhases, demoTasks } from "./demo-catalog";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseSecretKey } from "@/lib/supabase/env";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}

function hasServiceRole(): boolean {
  return isSupabaseConfigured() && Boolean(supabaseSecretKey());
}

let anon: SupabaseClient | null = null;
/** Cookie-less anon client: public catalog reads that can be cached / prerendered. */
function publicClient(): SupabaseClient {
  if (!anon) {
    anon = createPlainClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return anon;
}

export const getSettings = cache(async (): Promise<AppSettings> => {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS;
  const { data } = await publicClient().from("app_settings").select("*").maybeSingle();
  return (data as AppSettings | null) ?? DEFAULT_SETTINGS;
});

export const getPublishedCourses = cache(async (): Promise<Course[]> => {
  if (!isSupabaseConfigured()) return demoCourses();
  const { data, error } = await publicClient()
    .from("courses")
    .select("*")
    .eq("status", "published")
    .order("sort_order");
  if (error) throw new Error(`Could not load courses: ${error.message}`);
  return (data ?? []) as Course[];
});

export interface CourseDetail {
  course: Course;
  books: CourseBook[];
  phases: CoursePhase[];
}

export const getCourseBySlug = cache(async (slug: string): Promise<CourseDetail | null> => {
  if (!isSupabaseConfigured()) {
    const course = demoCourses().find((c) => c.slug === slug);
    return course ? { course, books: demoBooks(slug), phases: demoPhases(slug) } : null;
  }
  const db = publicClient();
  const { data: course } = await db
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!course) return null;
  const [books, phases] = await Promise.all([
    db.from("course_books").select("*").eq("course_id", course.id).order("sort_order"),
    db.from("course_phases").select("*").eq("course_id", course.id).order("start_day"),
  ]);
  return {
    course: course as Course,
    books: (books.data ?? []) as CourseBook[],
    phases: (phases.data ?? []) as CoursePhase[],
  };
});

/** Full sample tasks — the only task content that is public. */
export async function getSampleTasks(course: Course): Promise<Task[]> {
  if (!isSupabaseConfigured())
    return demoTasks(course.slug)
      .filter((t) => t.is_sample)
      .slice(0, 5);
  const { data } = await publicClient()
    .from("tasks")
    .select("*")
    .eq("course_id", course.id)
    .eq("is_sample", true)
    .lte("day_number", course.days)
    .order("day_number")
    .limit(5);
  return (data ?? []) as Task[];
}

export interface OutlineItem {
  day_number: number;
  title: string;
}

/** Day titles only (shown blurred on the sales page). */
export async function getOutline(course: Course): Promise<OutlineItem[]> {
  if (!hasServiceRole()) {
    return isSupabaseConfigured()
      ? []
      : demoTasks(course.slug).map(({ day_number, title }) => ({ day_number, title }));
  }
  const { data } = await createAdminClient()
    .from("tasks")
    .select("day_number, title")
    .eq("course_id", course.id)
    .lte("day_number", course.days)
    .order("day_number");
  return (data ?? []) as OutlineItem[];
}

export interface BundleDetail {
  bundle: Bundle;
  courses: Course[];
}

export const getBundle = cache(async (slug = "all-access"): Promise<BundleDetail | null> => {
  if (!isSupabaseConfigured()) {
    return {
      bundle: demoBundle(),
      courses: demoCourses().filter((c) => c.format !== "self_paced"),
    };
  }
  const db = publicClient();
  const { data: bundle } = await db
    .from("bundles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!bundle) return null;
  const { data: links } = await db
    .from("bundle_courses")
    .select("course_id")
    .eq("bundle_id", bundle.id);
  const ids = new Set((links ?? []).map((l) => l.course_id as string));
  const courses = (await getPublishedCourses()).filter((c) => ids.has(c.id));
  return { bundle: bundle as Bundle, courses };
});

export interface Testimonial {
  id: string;
  body: string;
  name: string;
  country: string | null;
  stars: number | null;
  courseName: string;
  courseEmoji: string;
  /** Set when the quote is a daily response. */
  dayNumber: number | null;
}

export interface RatingSummary {
  average: number;
  count: number;
}

/** Show an average only once there are enough real ratings for it to mean something. */
export const MIN_RATINGS_TO_SHOW = 3;

type CourseLabel = { name: string; emoji: string };

/**
 * Real testimonials only, from three sources:
 *  - daily responses an admin starred (with the learner's permission)
 *  - completion ratings whose comment the learner agreed to share, once published
 *  - quotes an admin added by hand, recorded with where they came from
 * Each source fails soft (for example before its migration has been run).
 */
export async function getTestimonials(courseId?: string, limit = 8): Promise<Testimonial[]> {
  if (!hasServiceRole()) return [];
  const db = createAdminClient();

  let responses = db
    .from("responses")
    .select(
      "id, body, testimonial_name, day_number, updated_at, enrollments!inner(course_id, courses!inner(name, emoji))",
    )
    .eq("is_starred", true)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (courseId) responses = responses.eq("enrollments.course_id", courseId);

  let ratings = db
    .from("course_ratings")
    .select("id, comment, stars, display_name, country, updated_at, courses!inner(name, emoji)")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (courseId) ratings = ratings.eq("course_id", courseId);

  let manual = db
    .from("testimonials")
    .select("id, body, stars, name, country, sort_order, created_at, courses(name, emoji)")
    .eq("is_published", true)
    .order("sort_order")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (courseId) manual = manual.eq("course_id", courseId);

  const [r1, r2, r3] = await Promise.all([responses, ratings, manual]);
  for (const [label, res] of [
    ["responses", r1],
    ["course_ratings", r2],
    ["testimonials", r3],
  ] as const) {
    if (res.error) console.error(`[testimonials] ${label}: ${res.error.message}`);
  }

  type ResponseRow = {
    id: string;
    body: string;
    testimonial_name: string | null;
    day_number: number;
    updated_at: string;
    enrollments: { courses: CourseLabel };
  };
  type RatingRow = {
    id: string;
    comment: string;
    stars: number;
    display_name: string | null;
    country: string | null;
    updated_at: string;
    courses: CourseLabel;
  };
  type ManualRow = {
    id: string;
    body: string;
    stars: number | null;
    name: string;
    country: string | null;
    created_at: string;
    courses: CourseLabel | null;
  };

  const items: (Testimonial & { at: string; rank: number })[] = [
    ...((r3.data ?? []) as unknown as ManualRow[]).map((m) => ({
      id: `t-${m.id}`,
      body: m.body,
      name: m.name,
      country: m.country,
      stars: m.stars,
      courseName: m.courses?.name ?? "mindfrombooks",
      courseEmoji: m.courses?.emoji ?? "📚",
      dayNumber: null,
      at: m.created_at,
      rank: 0,
    })),
    ...((r2.data ?? []) as unknown as RatingRow[]).map((r) => ({
      id: `r-${r.id}`,
      body: r.comment,
      name: r.display_name?.trim() || "A mindfrombooks learner",
      country: r.country,
      stars: r.stars,
      courseName: r.courses.name,
      courseEmoji: r.courses.emoji,
      dayNumber: null,
      at: r.updated_at,
      rank: 1,
    })),
    ...((r1.data ?? []) as unknown as ResponseRow[]).map((r) => ({
      id: `s-${r.id}`,
      body: r.body,
      name: r.testimonial_name?.trim() || "A mindfrombooks learner",
      country: null,
      stars: null,
      courseName: r.enrollments.courses.name,
      courseEmoji: r.enrollments.courses.emoji,
      dayNumber: r.day_number,
      at: r.updated_at,
      rank: 1,
    })),
  ];
  return items
    .sort((a, b) => a.rank - b.rank || b.at.localeCompare(a.at))
    .slice(0, limit)
    .map((t) => ({
      id: t.id,
      body: t.body,
      name: t.name,
      country: t.country,
      stars: t.stars,
      courseName: t.courseName,
      courseEmoji: t.courseEmoji,
      dayNumber: t.dayNumber,
    }));
}

/** Average stars from completion ratings, or null when there are too few. */
export async function getRatingSummary(courseId: string): Promise<RatingSummary | null> {
  if (!hasServiceRole()) return null;
  const { data, error } = await createAdminClient()
    .from("course_ratings")
    .select("stars")
    .eq("course_id", courseId);
  if (error || !data || data.length < MIN_RATINGS_TO_SHOW) return null;
  const total = data.reduce((sum, r) => sum + (r.stars as number), 0);
  return { average: Math.round((total / data.length) * 10) / 10, count: data.length };
}
