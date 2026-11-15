import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskEditor } from "@/components/admin/task-editor";
import { AdminHeader } from "@/components/admin/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Course, Task } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Tasks" };

export default async function CourseTasksPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = createAdminClient();
  const { data: course } = await db.from("courses").select("*").eq("id", id).maybeSingle();
  if (!course) notFound();
  const { data: tasks } = await db
    .from("tasks")
    .select("*")
    .eq("course_id", id)
    .order("day_number");
  const c = course as Course;
  const list = (tasks ?? []) as Task[];
  const written = list.filter(
    (t) => t.day_number <= c.days && !/coming soon$/i.test(t.title),
  ).length;
  return (
    <>
      <Link
        href={`/admin/courses/${id}`}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← {c.name}
      </Link>
      <div className="mt-2">
        <AdminHeader title="Tasks" description={`${written} of ${c.days} days written.`} />
      </div>
      <TaskEditor
        key={list.map((t) => `${t.id}:${t.day_number}`).join("|")}
        courseId={id}
        days={c.days}
        tasks={list}
      />
    </>
  );
}
