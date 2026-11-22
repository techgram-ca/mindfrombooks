import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { CalendarGrid } from "@/components/dashboard/calendar-grid";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { RefundPanel } from "@/components/dashboard/refund-panel";
import { StartCourseButton } from "@/components/dashboard/start-course-button";
import { requireUser } from "@/lib/auth";
import { computeStreak, dateOfDay, formatDateLong } from "@/lib/course-days";
import {
  getDayContent,
  getDayTitles,
  getEnrollmentView,
  phaseNameFor,
} from "@/lib/queries/learning";

export const metadata: Metadata = { title: "Course progress" };

export default async function CourseProgressPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ enrolled?: string }>;
}) {
  const { slug } = await params;
  const profile = await requireUser(`/dashboard/courses/${slug}`);
  const view = await getEnrollmentView(profile, slug);
  if (!view) notFound();
  if (view.enrollment.status === "revoked") redirect("/dashboard/courses");
  if (view.course.format === "self_paced") redirect(`/dashboard/workshops/${view.course.slug}`);

  const { course, enrollment, progress, openDay } = view;
  const [titles, todayContent, sp] = await Promise.all([
    getDayTitles(course.id, course.days),
    openDay ? getDayContent(view, openDay) : Promise.resolve(null),
    searchParams,
  ]);
  const base = `/dashboard/courses/${course.slug}`;
  const phaseName = openDay ? phaseNameFor(view.phases, openDay) : null;
  const courseStreak = enrollment.start_date
    ? computeStreak(
        [...view.responded].map((d) => dateOfDay(enrollment.start_date as string, d)),
        view.today,
      )
    : 0;
  const readOnly = enrollment.status !== "active";

  return (
    <div className="space-y-7">
      <header>
        <Link
          href="/dashboard/courses"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← My courses
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">
          <span aria-hidden>{course.emoji} </span>
          {course.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          {view.phase === "not_started" && `${course.days} days · not started`}
          {view.phase === "starts_tomorrow" &&
            enrollment.start_date &&
            `Day 1 opens ${formatDateLong(enrollment.start_date)}`}
          {view.phase === "in_progress" &&
            `Day ${openDay} of ${course.days}${phaseName ? ` · ${phaseName}` : ""}`}
          {view.phase === "finished" && `Finished · ${course.days} days`}
          {enrollment.status === "refunded" && " · refunded (read-only)"}
        </p>
      </header>

      {sp.enrolled && (
        <p role="status" className="bg-success-soft text-success rounded-2xl px-4 py-3">
          You&apos;re in! Day 1 opens tomorrow morning, at midnight your time.
        </p>
      )}

      <Card>
        <CardBody className="space-y-4">
          <ProgressBar
            value={(progress.respondedCount / course.days) * 100}
            color={course.accent_color}
            label="Course progress"
          />
          <dl className="grid grid-cols-4 gap-2 text-center">
            {[
              { k: "Done", v: progress.respondedCount },
              { k: "Missed", v: progress.missedDays.length },
              { k: "Left", v: progress.remainingDays },
              { k: "Streak", v: `🔥 ${courseStreak}` },
            ].map((s) => (
              <div key={s.k} className="bg-surface-muted rounded-xl px-1 py-2.5">
                <dd className="font-serif text-xl font-semibold">{s.v}</dd>
                <dt className="text-muted-foreground text-xs">{s.k}</dt>
              </div>
            ))}
          </dl>
          <RefundPanel view={view} />
        </CardBody>
      </Card>

      {view.phase === "not_started" && !readOnly && (
        <Card>
          <CardBody>
            <h2 className="text-xl font-semibold">Ready when you are</h2>
            <p className="text-muted-foreground mt-1 mb-4">
              Start this course and Day 1 opens tomorrow morning. From then on there&apos;s one task
              every day for {course.days} days.
            </p>
            <StartCourseButton enrollmentId={enrollment.id} />
          </CardBody>
        </Card>
      )}

      {view.phase === "in_progress" && todayContent && !readOnly && (
        <section aria-labelledby="today-task">
          <h2 id="today-task" className="mb-3 text-xl font-semibold">
            Today&apos;s task
          </h2>
          <Card>
            <CardBody>
              <p className="text-sm font-medium" style={{ color: course.accent_color }}>
                Day {openDay}
                {phaseName ? ` · ${phaseName}` : ""}
              </p>
              <p className="mt-1 font-serif text-xl font-semibold">{todayContent.title}</p>
              <Button asChild className="mt-4">
                <Link href={`${base}/day/${openDay}`}>
                  {view.todayDone ? "View my response" : "Act now"} <ArrowRight aria-hidden />
                </Link>
              </Button>
            </CardBody>
          </Card>
        </section>
      )}

      {(view.phase === "finished" || progress.isComplete) && (
        <Button asChild variant="accent">
          <Link href={`${base}/complete`}>See my certificate</Link>
        </Button>
      )}

      <section aria-labelledby="calendar-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="calendar-title" className="text-xl font-semibold">
            All {course.days} days
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={`${base}/journal`}>
              <BookOpenText aria-hidden /> Journal
            </Link>
          </Button>
        </div>
        <CalendarGrid view={view} titles={titles} />
      </section>
    </div>
  );
}
