import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { TodayCard, showsDashboardInsight } from "@/components/dashboard/today-card";
import { requireUser } from "@/lib/auth";
import { closeInstant, greetingForHour, localHour } from "@/lib/course-days";
import { getDayContent, getLearnerState, type EnrollmentView } from "@/lib/queries/learning";

function rank(view: EnrollmentView): number {
  if (view.phase === "in_progress" && !view.todayDone) return 0; // pending first
  if (view.phase === "in_progress") return 1; // done today
  if (view.phase === "starts_tomorrow") return 2;
  return 3; // not started
}

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ enrolled?: string; welcome?: string }>;
}) {
  const profile = await requireUser();
  const [{ views, streak }, sp] = await Promise.all([getLearnerState(profile), searchParams]);

  const active = views
    .filter(
      (v) => v.enrollment.status === "active" && v.phase !== "finished" && v.phase !== "workshop",
    )
    .sort((a, b) => rank(a) - rank(b));
  // Self-paced workshops: a "continue" card, never a daily task.
  const workshops = views.filter(
    (v) => v.phase === "workshop" && v.enrollment.status === "active" && !v.progress.isComplete,
  );
  const finished = views.filter(
    (v) => v.enrollment.status === "completed" && v.progress.refundEligible,
  );

  const now = new Date();
  const contents = await Promise.all(
    active.map((v) => (v.openDay ? getDayContent(v, v.openDay) : Promise.resolve(null))),
  );
  const pending = active.filter((v) => v.phase === "in_progress" && !v.todayDone).length;
  const firstName = profile.name.trim().split(/\s+/)[0] || "there";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {greetingForHour(localHour(profile.timezone, now))}, {firstName} 👋
        </h1>
        {(active.length > 0 || workshops.length === 0) && (
          <p className="text-muted-foreground mt-1">
            {streak > 0 ? `🔥 ${streak}-day streak` : "Your streak starts with today's action."}
            {pending > 0 && ` · ${pending} ${pending === 1 ? "task" : "tasks"} waiting`}
          </p>
        )}
      </header>

      {sp.enrolled && (
        <p role="status" className="bg-success-soft text-success rounded-2xl px-4 py-3">
          You&apos;re in!{" "}
          {active.some((v) => v.phase === "not_started")
            ? "Tap Start on a course — Day 1 opens the next morning."
            : "Day 1 opens tomorrow morning."}
        </p>
      )}

      {active.length === 0 && workshops.length > 0 ? null : active.length === 0 ? (
        <section aria-labelledby="empty-title">
          <Card>
            <CardBody className="text-center">
              <div className="text-4xl" aria-hidden>
                📚
              </div>
              <h2 id="empty-title" className="mt-2 text-2xl font-semibold">
                {views.length === 0 ? "Pick your first course" : "Nothing running right now"}
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-sm">
                {views.length === 0
                  ? "When you enroll, today's task shows up here each morning."
                  : "No course is in progress. Your finished courses are under My courses."}
              </p>
              <Button asChild className="mt-5">
                <Link href="/dashboard/courses">Go to My courses</Link>
              </Button>
            </CardBody>
          </Card>
        </section>
      ) : (
        <section aria-labelledby="today-title">
          <h2
            id="today-title"
            className="text-muted-foreground mb-3 font-sans text-xs font-semibold tracking-[0.14em] uppercase"
          >
            Today
          </h2>
          <div className="space-y-3">
            {active.map((view, i) => {
              const close =
                view.openDay && view.enrollment.start_date
                  ? closeInstant(view.enrollment.start_date, view.openDay, view.enrollment.timezone)
                  : null;
              return (
                <TodayCard
                  key={view.enrollment.id}
                  view={view}
                  taskTitle={contents[i]?.title}
                  insight={
                    contents[i]?.task && showsDashboardInsight(view.course)
                      ? {
                          text: contents[i].task.book_insight,
                          reference: contents[i].task.book_reference,
                        }
                      : undefined
                  }
                  hoursLeft={close ? (close.getTime() - now.getTime()) / 3_600_000 : undefined}
                />
              );
            })}
          </div>
        </section>
      )}

      {workshops.length > 0 && (
        <section aria-labelledby="workshops-title">
          <h2
            id="workshops-title"
            className="text-muted-foreground mb-3 font-sans text-xs font-semibold tracking-[0.14em] uppercase"
          >
            Your workshops
          </h2>
          <div className="space-y-3">
            {workshops.map((v) => {
              const next =
                Array.from({ length: v.course.days }, (_, i) => i + 1).find(
                  (n) => !v.responded.has(n),
                ) ?? 1;
              return (
                <Link
                  key={v.enrollment.id}
                  href={`/dashboard/workshops/${v.course.slug}/${next}`}
                  className="rounded-card border-border bg-surface shadow-soft flex items-center justify-between gap-3 border p-4"
                >
                  <span>
                    <span className="block font-medium">
                      <span aria-hidden>{v.course.emoji} </span>
                      {v.course.name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {v.progress.respondedCount} of {v.course.days} lessons done · continue with
                      Lesson {next}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section aria-labelledby="finished-title">
          <h2
            id="finished-title"
            className="text-muted-foreground mb-3 font-sans text-xs font-semibold tracking-[0.14em] uppercase"
          >
            Just finished
          </h2>
          <div className="space-y-3">
            {finished.map((v) => (
              <Link
                key={v.enrollment.id}
                href={`/dashboard/courses/${v.course.slug}/complete`}
                className="rounded-card border-border bg-surface shadow-soft flex items-center justify-between gap-3 border p-4"
              >
                <span className="font-medium">
                  <span aria-hidden>{v.course.emoji} </span>
                  {v.course.name} — see your certificate
                </span>
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
