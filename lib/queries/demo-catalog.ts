/**
 * Fallback catalog used only when Supabase is not configured (first run,
 * local preview, CI build). Lets the public site render from the seed data so
 * you can look at it before connecting a database.
 */
import { BUNDLE, COURSES, courseAllowances } from "@/scripts/seed-data";
import type { Bundle, Course, CourseBook, CoursePhase, Task } from "@/lib/types";

export function demoCourses(): Course[] {
  return COURSES.map((c, i) => ({
    id: `demo-${c.slug}`,
    slug: c.slug,
    name: c.name,
    category: c.category,
    emoji: c.emoji,
    accent_color: c.accent_color,
    short_description: c.short_description,
    description: c.description,
    number_reason: c.number_reason,
    outcomes: c.outcomes,
    notice: c.notice,
    days: c.days,
    price_cents: c.price_cents,
    currency: "usd",
    grace_days: courseAllowances(c.days).graceDays,
    cover_image_url: null,
    status: "published",
    sort_order: i + 1,
    faq: c.faq,
    created_at: new Date(0).toISOString(),
  }));
}

export function demoBooks(slug: string): CourseBook[] {
  const c = COURSES.find((x) => x.slug === slug);
  return (c?.books ?? []).map((b, i) => ({
    id: `demo-book-${slug}-${i}`,
    course_id: `demo-${slug}`,
    title: b.title,
    author: b.author,
    image_url: null,
    sort_order: i,
  }));
}

export function demoPhases(slug: string): CoursePhase[] {
  const c = COURSES.find((x) => x.slug === slug);
  return (c?.phases ?? []).map((p, i) => ({
    id: `demo-phase-${slug}-${i}`,
    course_id: `demo-${slug}`,
    ...p,
  }));
}

export function demoTasks(slug: string): Task[] {
  const c = COURSES.find((x) => x.slug === slug);
  if (!c) return [];
  return Array.from({ length: c.days }, (_, i) => {
    const real = c.tasks[i];
    return {
      id: `demo-task-${slug}-${i + 1}`,
      course_id: `demo-${slug}`,
      day_number: i + 1,
      title: real?.title ?? `Day ${i + 1} — coming soon`,
      book_insight: real?.book_insight ?? "",
      book_reference: real?.book_reference ?? "",
      instructions: real?.instructions ?? [],
      response_prompt: real?.response_prompt ?? "",
      min_response_chars: 0,
      is_sample: i < courseAllowances(c.days).sampleDays,
    };
  });
}

export function demoBundle(): Bundle {
  return { id: "demo-bundle", ...BUNDLE, status: "published" };
}
