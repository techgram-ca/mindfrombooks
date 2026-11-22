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
  const workshop = c.format === "self_paced";
  const { data: videoRows } = await db
    .from("lesson_videos")
    .select("task_id, youtube_id")
    .in(
      "task_id",
      list.map((t) => t.id),
    );
  const videos = Object.fromEntries(
    (videoRows ?? []).map((v) => [v.task_id as string, v.youtube_id as string]),
  );
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
        <AdminHeader
          title={workshop ? "Lessons" : "Tasks"}
          description={`${written} of ${c.days} ${workshop ? "lessons" : "days"} written.`}
        />
      </div>
      <TaskEditor
        key={list.map((t) => `${t.id}:${t.day_number}`).join("|")}
        courseId={id}
        days={c.days}
        tasks={list}
        workshop={workshop}
        videos={videos}
      />
    </>
  );
}
