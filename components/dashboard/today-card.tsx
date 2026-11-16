import Link from "next/link";
import { ArrowRight, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { StartCourseButton } from "@/components/dashboard/start-course-button";
import { formatDateLong } from "@/lib/course-days";
import { phaseNameFor, type EnrollmentView } from "@/lib/queries/learning";

/**
 * Courses whose daily book insight is NOT repeated on the Today screen. The AI
 * course is about doing the steps, so its card stays short; the insight is
 * still on the task page.
 */
const NO_DASHBOARD_INSIGHT = new Set(["ai-for-everyday-life"]);

export function showsDashboardInsight(course: { slug: string }): boolean {
  return !NO_DASHBOARD_INSIGHT.has(course.slug);
}

export function TodayCard({
  view,
  taskTitle,
  hoursLeft,
  insight,
}: {
  view: EnrollmentView;
  taskTitle?: string;
  hoursLeft?: number;
  /** Today's book insight, shown under the button for started courses. */
  insight?: { text: string; reference: string };
}) {
  const { course, progress, openDay } = view;
  const base = `/dashboard/courses/${course.slug}`;
  const pct = (progress.respondedCount / course.days) * 100;
  const phaseName = openDay ? phaseNameFor(view.phases, openDay) : null;

  return (
    <article className="rounded-card border-border bg-surface shadow-soft relative overflow-hidden border p-5">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: course.accent_color }}
      />
      <div className="flex items-start justify-between gap-3">
        <Link href={base} className="font-semibold hover:underline">
          <span aria-hidden>{course.emoji} </span>
          {course.name}
          {openDay && (
            <span className="text-muted-foreground font-normal">
              {" "}
              · Day {openDay}/{course.days}
            </span>
          )}
        </Link>
        {view.todayDone && (
          <span
            className="bg-success flex size-6 shrink-0 items-center justify-center rounded-full text-white"
            role="img"
            aria-label="Done today"
          >
            <Check className="size-3.5" aria-hidden />
          </span>
        )}
      </div>

      {view.phase === "not_started" && (
        <>
          <p className="text-muted-foreground mt-2 text-[15px]">
            {course.days} days · not started yet. Day 1 opens the morning after you start.
          </p>
          <div className="mt-4">
            <StartCourseButton enrollmentId={view.enrollment.id} />
          </div>
        </>
      )}

      {view.phase === "starts_tomorrow" && view.enrollment.start_date && (
        <p className="text-muted-foreground mt-2 flex items-start gap-2 text-[15px]">
          <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
          Day 1 opens at midnight — {formatDateLong(view.enrollment.start_date)}. See you then.
        </p>
      )}

      {view.phase === "in_progress" && (
        <>
          {phaseName && <p className="text-muted-foreground mt-0.5 text-sm">Phase: {phaseName}</p>}
          {view.todayDone ? (
            <p className="text-muted-foreground mt-2 text-[15px]">
              Done today —{" "}
              {openDay === course.days ? "that was the final day 🎉" : "see you tomorrow."}
            </p>
          ) : (
            taskTitle && <p className="mt-2 font-serif text-lg">“{taskTitle}”</p>
          )}
          <div className="mt-3">
            <ProgressBar
              value={pct}
              color={course.accent_color}
              label={`${course.name} progress`}
            />
          </div>
          {!view.todayDone ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href={`${base}/day/${openDay}`}>
                  Act now <ArrowRight aria-hidden />
                </Link>
              </Button>
              {hoursLeft !== undefined && hoursLeft <= 3 && (
                <span className="text-danger text-sm font-medium">
                  Closes in {hoursLeft < 1 ? "under an hour" : `about ${Math.ceil(hoursLeft)} h`}
                </span>
              )}
            </div>
          ) : (
            <Link
              href={`${base}/day/${openDay}`}
              className="text-accent-strong mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline"
            >
              View or edit today&apos;s response
            </Link>
          )}
          {insight?.text && (
            <div className="bg-surface-muted mt-4 rounded-xl p-4">
              <p className="text-muted-foreground font-sans text-[11px] font-semibold tracking-[0.14em] uppercase">
                Book insight of the day
              </p>
              <p className="mt-1.5 font-serif text-[15px] leading-relaxed">{insight.text}</p>
              {insight.reference && (
                <p className="text-muted-foreground mt-2 text-xs">
                  Inspired by {insight.reference}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
}
