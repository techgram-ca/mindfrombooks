import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Course } from "@/lib/types";

export interface CourseStats {
  course_id: string;
  enrollments: number;
  paid_enrollments: number;
  finished: number;
  completed: number;
  refunded: number;
}

export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await createAdminClient().from("courses").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Course[];
}

export async function getCourseStats(): Promise<Map<string, CourseStats>> {
  const { data, error } = await createAdminClient().rpc("admin_course_stats");
  if (error) throw new Error(error.message);
  return new Map(((data ?? []) as CourseStats[]).map((s) => [s.course_id, s]));
}

export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
