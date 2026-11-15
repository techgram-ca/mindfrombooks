import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { TodayCard } from "@/components/dashboard/today-card";
import { CourseCard } from "@/components/marketing/course-card";
import { requireUser } from "@/lib/auth";
import { closeInstant, greetingForHour, localHour } from "@/lib/course-days";
import { getPublishedCourses } from "@/lib/queries/catalog";
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
  const [{ views, streak }, sp, catalog] = await Promise.all([
    getLearnerState(profile),
    searchParams,
    getPublishedCourses(),
  ]);

  const active = views
    .filter((v) => v.enrollment.status === "active" && v.phase !== "finished")
    .sort((a, b) => rank(a) - rank(b));
  const finished = views.filter(
    (v) => v.enrollment.status === "completed" && v.progress.refundEligible,
  );
  const owned = new Set(views.map((v) => v.course.id));
  const more = catalog.filter((c) => !owned.has(c.id));

  const now = new Date();
  const contents = await Promise.all(
    active.map((v) => (v.openDay ? getDayContent(v, v.openDay) : Promise.resolve(null))),
  );
  const insight = contents.find((c) => c?.task?.book_insight)?.task ?? null;
  const pending = active.filter((v) => v.phase === "in_progress" && !v.todayDone).length;
  const firstName = profile.name.trim().split(/\s+/)[0] || "there";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {greetingForHour(localHour(profile.timezone, now))}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {streak > 0 ? `🔥 ${streak}-day streak` : "Your streak starts with today's response."}
          {pending > 0 && ` · ${pending} ${pending === 1 ? "task" : "tasks"} waiting`}
        </p>
      </header>

      {sp.enrolled && (
        <p role="status" className="bg-success-soft text-success rounded-2xl px-4 py-3">
          You&apos;re in!{" "}
          {active.some((v) => v.phase === "not_started")
            ? "Tap Start on a course — Day 1 opens the next morning."
            : "Day 1 opens tomorrow morning."}
        </p>
      )}

      {active.length === 0 ? (
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
                One small task a day. Choose what you want to change and Day 1 opens tomorrow
                morning.
              </p>
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
                  hoursLeft={close ? (close.getTime() - now.getTime()) / 3_600_000 : undefined}
                />
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

      {insight && (
        <section
          aria-labelledby="insight-title"
          className="rounded-card bg-primary text-primary-foreground p-5 sm:p-6"
        >
          <h2
            id="insight-title"
            className="text-accent font-sans text-xs font-semibold tracking-[0.14em] uppercase"
          >
            Book insight of the day
          </h2>
          <p className="mt-2 font-serif text-lg leading-relaxed">{insight.book_insight}</p>
          {insight.book_reference && (
            <p className="text-primary-foreground/70 mt-3 text-sm">
              Inspired by {insight.book_reference}
            </p>
          )}
        </section>
      )}

      {more.length > 0 && (
        <section aria-labelledby="more-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="more-title" className="text-xl font-semibold">
              {views.length === 0 ? "Courses" : "Explore more courses"}
            </h2>
            <Button asChild variant="link" size="sm">
              <Link href="/courses">
                View all <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(views.length === 0 ? more : more.slice(0, 2)).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
