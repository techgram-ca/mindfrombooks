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

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function hasServiceRole(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let anon: SupabaseClient | null = null;
/** Cookie-less anon client: public catalog reads that can be cached / prerendered. */
function publicClient(): SupabaseClient {
  if (!anon) {
    anon = createPlainClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
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
  if (!isSupabaseConfigured()) return { bundle: demoBundle(), courses: demoCourses() };
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
  courseName: string;
  courseEmoji: string;
  dayNumber: number;
}

/** Starred responses, shown with the display name the admin chose. */
export async function getTestimonials(courseId?: string, limit = 6): Promise<Testimonial[]> {
  if (!hasServiceRole()) return [];
  let query = createAdminClient()
    .from("responses")
    .select(
      "id, body, testimonial_name, day_number, enrollments!inner(course_id, courses!inner(name, emoji))",
    )
    .eq("is_starred", true)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (courseId) query = query.eq("enrollments.course_id", courseId);
  const { data, error } = await query;
  if (error) {
    console.error("[testimonials]", error.message);
    return [];
  }
  type Row = {
    id: string;
    body: string;
    testimonial_name: string | null;
    day_number: number;
    enrollments: { courses: { name: string; emoji: string } };
  };
  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    body: r.body,
    name: r.testimonial_name?.trim() || "A mindfrombooks learner",
    courseName: r.enrollments.courses.name,
    courseEmoji: r.enrollments.courses.emoji,
    dayNumber: r.day_number,
  }));
}
