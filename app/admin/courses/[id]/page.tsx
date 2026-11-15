import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";
import { AdminHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Course, CourseBook, CoursePhase } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit course" };

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = createAdminClient();
  const { data: course } = await db.from("courses").select("*").eq("id", id).maybeSingle();
  if (!course) notFound();
  const [books, phases] = await Promise.all([
    db.from("course_books").select("*").eq("course_id", id).order("sort_order"),
    db.from("course_phases").select("*").eq("course_id", id).order("start_day"),
  ]);
  const c = course as Course;
  return (
    <>
      <AdminHeader
        title={`${c.emoji} ${c.name}`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/courses/${id}/tasks`}>Edit tasks</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/courses/${id}/analytics`}>Analytics</Link>
            </Button>
            {c.status === "published" && (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/courses/${c.slug}`}>View page</Link>
              </Button>
            )}
          </>
        }
      />
      <CourseForm
        key={c.id}
        course={c}
        books={(books.data ?? []) as CourseBook[]}
        phases={(phases.data ?? []) as CoursePhase[]}
      />
    </>
  );
}
