import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Clock, Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponseForm } from "@/components/dashboard/response-form";
import { requireUser } from "@/lib/auth";
import { closeInstant, dateOfDay, formatDateLong } from "@/lib/course-days";
import { getDayContent, getEnrollmentView, phaseNameFor } from "@/lib/queries/learning";

export const metadata: Metadata = { title: "Today's task" };

export default async function TaskPage({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}) {
  const { slug, n } = await params;
  const dayNumber = Number(n);
  if (!Number.isInteger(dayNumber)) notFound();
  const profile = await requireUser(`/dashboard/courses/${slug}/day/${n}`);
  const view = await getEnrollmentView(profile, slug);
  if (!view) notFound();
  if (view.enrollment.status === "revoked") redirect("/dashboard/courses");
  if (view.course.format === "self_paced") redirect(`/dashboard/workshops/${view.course.slug}`);
  const content = await getDayContent(view, dayNumber);
  if (!content) notFound();

  const { course, enrollment } = view;
  const base = `/dashboard/courses/${course.slug}`;
  const phaseName = phaseNameFor(view.phases, dayNumber);
  const task = content.task;
  const canWrite = view.canRespond && view.openDay === dayNumber;
  const now = new Date();
  const hoursLeft =
    canWrite && enrollment.start_date
      ? (closeInstant(enrollment.start_date, dayNumber, enrollment.timezone).getTime() -
          now.getTime()) /
        3_600_000
      : null;

  return (
    <article className="space-y-6">
      <header>
        <Link href={base} className="text-muted-foreground hover:text-foreground text-sm">
          ← {course.name}
        </Link>
        <p
          className="mt-3 text-sm font-semibold tracking-wide uppercase"
          style={{ color: course.accent_color }}
        >
          Day {dayNumber} of {course.days}
          {phaseName ? ` · ${phaseName}` : ""}
        </p>
        {content.status === "locked" ? (
          <h1 className="mt-1 text-3xl font-semibold">
            <span className="blur-[6px] select-none" aria-hidden>
              {content.title}
            </span>
            <span className="sr-only">Locked</span>
          </h1>
        ) : (
          <h1 className="mt-1 text-3xl font-semibold">{content.title}</h1>
        )}
      </header>

      {content.status === "locked" && (
        <div className="rounded-card border-border bg-surface shadow-soft border p-6 text-center">
          <Lock className="text-muted-foreground mx-auto size-6" aria-hidden />
          <h2 className="mt-3 text-xl font-semibold">This day is locked</h2>
          <p className="text-muted-foreground mt-1">
            {enrollment.start_date
              ? `It opens at midnight on ${formatDateLong(dateOfDay(enrollment.start_date, dayNumber))}.`
              : "Start the course first — Day 1 opens the next morning."}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href={base}>Back to the course</Link>
          </Button>
        </div>
      )}

      {task && (
        <>
          {dayNumber === 1 && course.notice && (
            <p
              role="note"
              className="bg-info-soft text-info flex items-start gap-2 rounded-2xl px-4 py-3 text-sm"
            >
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              {course.notice}
            </p>
          )}

          {task.book_insight && (
            <section aria-labelledby="insight" className="rounded-card bg-surface-muted p-5">
              <h2
                id="insight"
                className="text-muted-foreground font-sans text-xs font-semibold tracking-[0.14em] uppercase"
              >
                The idea
              </h2>
              <p className="mt-2 font-serif text-lg leading-relaxed">{task.book_insight}</p>
              {task.book_reference && (
                <p className="text-muted-foreground mt-3 text-sm">
                  Inspired by {task.book_reference}
                </p>
              )}
            </section>
          )}

          {task.instructions.length > 0 && (
            <section aria-labelledby="todo">
              <h2 id="todo" className="text-xl font-semibold">
                What to do today
              </h2>
              <ul className="mt-3 space-y-2.5">
                {task.instructions.map((line, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: course.accent_color }}
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label="Your response" className="border-border border-t pt-6">
            {canWrite ? (
              <>
                {hoursLeft != null && (
                  <p
                    className={`mb-4 flex items-center gap-2 text-sm ${hoursLeft <= 3 ? "text-danger font-medium" : "text-muted-foreground"}`}
                  >
                    <Clock className="size-4" aria-hidden />
                    {hoursLeft <= 1
                      ? "Closes in under an hour — at 11:59 pm your time."
                      : `Closes at 11:59 pm your time (about ${Math.floor(hoursLeft)} h left).`}
                  </p>
                )}
                <ResponseForm
                  key={content.response?.updated_at ?? "new"}
                  enrollmentId={enrollment.id}
                  courseSlug={course.slug}
                  courseName={course.name}
                  dayNumber={dayNumber}
                  totalDays={course.days}
                  prompt={task.response_prompt}
                  minChars={task.min_response_chars}
                  initialBody={content.response?.body ?? ""}
                  accentColor={course.accent_color}
                />
              </>
            ) : content.response ? (
              <>
                <h2 className="font-serif text-lg font-semibold">
                  {task.response_prompt || "Your response"}
                </h2>
                <p className="rounded-card border-border bg-surface shadow-soft mt-3 border p-5 leading-relaxed whitespace-pre-wrap">
                  {content.response.body}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  This day has closed, so your response is read-only.
                </p>
              </>
            ) : (
              <div className="rounded-card border-danger/25 bg-danger-soft border p-5">
                <h2 className="text-danger text-lg font-semibold">You missed this day</h2>
                <p className="text-foreground/80 mt-1 text-[15px]">
                  Each task is only open on its own day, so this one can&apos;t be answered any
                  more. That&apos;s okay — the next open day is what matters.
                </p>
                {task.response_prompt && (
                  <p className="text-muted-foreground mt-3 text-sm">
                    The question was: {task.response_prompt}
                  </p>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </article>
  );
}
