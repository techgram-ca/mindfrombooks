import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { StartCourseButton } from "@/components/dashboard/start-course-button";
import { CourseCard } from "@/components/marketing/course-card";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth";
import { getPublishedCourses } from "@/lib/queries/catalog";
import { getLearnerState, type EnrollmentView } from "@/lib/queries/learning";

export const metadata: Metadata = { title: "My courses" };

function statusLine(v: EnrollmentView): string {
  if (v.enrollment.status === "refunded") return "Refunded · journal is read-only";
  if (v.enrollment.status === "revoked") return "Access revoked";
  if (v.phase === "not_started") return "Not started";
  if (v.phase === "starts_tomorrow") return "Starts tomorrow";
  if (v.phase === "finished")
    return `Finished · ${v.progress.respondedCount} of ${v.course.days} days done`;
  return `Day ${v.openDay} of ${v.course.days}${v.todayDone ? " · done today" : " · task waiting"}`;
}

function CourseRow({ v }: { v: EnrollmentView }) {
  const linkable = v.enrollment.status !== "revoked";
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="font-semibold">
          <span aria-hidden>{v.course.emoji} </span>
          {v.course.name}
        </span>
        {!v.progress.isPaid && v.enrollment.status === "active" && (
          <Badge variant="info">Free access</Badge>
        )}
      </div>
      <p className="text-muted-foreground mt-1 text-sm">{statusLine(v)}</p>
      {v.phase !== "not_started" && v.enrollment.status !== "revoked" && (
        <div className="mt-3">
          <ProgressBar
            value={(v.progress.respondedCount / v.course.days) * 100}
            color={v.course.accent_color}
            label={`${v.course.name} progress`}
          />
        </div>
      )}
    </>
  );
  return (
    <li className="rounded-card border-border bg-surface shadow-soft border p-5">
      {linkable ? (
        <Link href={`/dashboard/courses/${v.course.slug}`} className="block">
          {body}
        </Link>
      ) : (
        body
      )}
      {v.phase === "not_started" && v.enrollment.status === "active" && (
        <div className="mt-4">
          <StartCourseButton enrollmentId={v.enrollment.id} size="sm" />
        </div>
      )}
    </li>
  );
}

function List({ items, empty }: { items: EnrollmentView[]; empty: string }) {
  if (items.length === 0) return <p className="text-muted-foreground py-6 text-center">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((v) => (
        <CourseRow key={v.enrollment.id} v={v} />
      ))}
    </ul>
  );
}

export default async function MyCoursesPage() {
  const profile = await requireUser("/dashboard/courses");
  const [{ views }, catalog] = await Promise.all([getLearnerState(profile), getPublishedCourses()]);
  const owned = new Set(views.map((v) => v.course.id));
  const more = catalog.filter((c) => !owned.has(c.id));
  const active = views.filter((v) => v.enrollment.status === "active");
  const completed = views.filter((v) => v.enrollment.status === "completed");
  const refunded = views.filter(
    (v) => v.enrollment.status === "refunded" || v.enrollment.status === "revoked",
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">My courses</h1>
      {views.length === 0 ? (
        <EmptyState emoji="📚" title="No courses yet">
          Choose a course below and Day 1 opens tomorrow morning.
        </EmptyState>
      ) : (
        <Tabs defaultValue={active.length > 0 || completed.length === 0 ? "active" : "completed"}>
          <TabsList>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
            <TabsTrigger value="refunded">Refunded ({refunded.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <List items={active} empty="No active courses right now." />
          </TabsContent>
          <TabsContent value="completed">
            <List items={completed} empty="Finished courses will appear here." />
          </TabsContent>
          <TabsContent value="refunded">
            <List items={refunded} empty="No refunded courses." />
          </TabsContent>
        </Tabs>
      )}
      {more.length > 0 && (
        <section aria-labelledby="explore-title" className="pt-4">
          <h2 id="explore-title" className="text-xl font-semibold">
            Explore more courses
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {more.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
