import "server-only";
import { cache } from "react";
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

/**
 * Per-request list of reporting problems. Report queries fail soft: the page
 * still loads (with empty numbers) and shows the admin what went wrong.
 */
export const reportProblems = cache((): string[] => []);

export function noteReportProblem(what: string, message: string): void {
  console.error(`[admin report] ${what}: ${message}`);
  reportProblems().push(`${what}: ${message}`);
}

export async function getCourseStats(): Promise<Map<string, CourseStats>> {
  const { data, error } = await createAdminClient().rpc("admin_course_stats");
  if (error) {
    noteReportProblem("admin_course_stats", error.message);
    return new Map();
  }
  return new Map(((data ?? []) as CourseStats[]).map((s) => [s.course_id, s]));
}

export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
