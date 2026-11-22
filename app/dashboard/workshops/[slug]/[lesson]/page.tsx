import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MarkDoneButton } from "@/components/workshop/mark-done-button";
import { LessonResources } from "@/components/workshop/lesson-resources";
import { LessonVideo } from "@/components/workshop/lesson-video";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { phaseNameFor } from "@/lib/queries/learning";
import { getLessons, getWorkshopView } from "@/lib/queries/workshop";

export const metadata: Metadata = { title: "Lesson" };

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lesson: string }>;
}) {
  const { slug, lesson: raw } = await params;
  const number = Number(raw);
  if (!Number.isInteger(number) || number < 1) notFound();
  const profile = await requireUser(`/dashboard/workshops/${slug}/${raw}`);
  const view = await getWorkshopView(profile, slug);
  // Not bought yet (or revoked): send them to the offer page.
  if (!view) redirect(`/courses/${slug}`);
  const lessons = await getLessons(view.course.id, view.course.days);
  const lesson = lessons.find((l) => l.number === number);
  if (!lesson) notFound();

  const { course, enrollment, responded, phases } = view;
  const base = `/dashboard/workshops/${course.slug}`;
  const prev = number > 1 ? `${base}/${number - 1}` : null;
  const next = number < course.days ? `${base}/${number + 1}` : null;
  const moduleIndex = phases.findIndex((p) => number >= p.start_day && number <= p.end_day);
  const canTick = enrollment.status !== "refunded";

  return (
    <article className="space-y-7">
      <header>
        <Link href={base} className="text-muted-foreground hover:text-foreground text-sm">
          ← {course.name}
        </Link>
        <p
          className="mt-3 text-sm font-semibold tracking-wide uppercase"
          style={{ color: course.accent_color }}
        >
          {moduleIndex >= 0 ? `Module ${moduleIndex + 1} · ${phaseNameFor(phases, number)} · ` : ""}
          Lesson {number} of {course.days}
        </p>
        <h1 className="mt-1 text-3xl font-semibold">{lesson.title}</h1>
      </header>

      {lesson.hasVideo ? (
        <LessonVideo enrollmentId={enrollment.id} lesson={number} title={lesson.title} />
      ) : (
        <div className="bg-surface-muted text-muted-foreground flex aspect-video w-full items-center justify-center rounded-2xl text-sm">
          The video for this lesson is coming soon — the written steps below cover everything.
        </div>
      )}

      {lesson.intro && (
        <section aria-label="Why this matters" className="bg-surface-muted rounded-card p-5">
          <p className="font-serif text-lg leading-relaxed">{lesson.intro}</p>
          {lesson.bookReference && (
            <p className="text-muted-foreground mt-3 text-sm">Inspired by {lesson.bookReference}</p>
          )}
        </section>
      )}

      {lesson.steps.length > 0 && (
        <section aria-labelledby="steps">
          <h2 id="steps" className="text-xl font-semibold">
            Steps
          </h2>
          <ol className="mt-3 space-y-2.5">
            {lesson.steps.map((line, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: course.accent_color }}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed">{line}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {lesson.resources.length > 0 && (
        <section aria-labelledby="resources">
          <h2 id="resources" className="mb-3 text-xl font-semibold">
            Prompts, commands and links
          </h2>
          <LessonResources resources={lesson.resources} />
        </section>
      )}

      <div className="border-border flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        {canTick ? (
          <MarkDoneButton
            enrollmentId={enrollment.id}
            lesson={number}
            done={responded.has(number)}
            nextHref={next}
          />
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {prev && (
            <Button asChild variant="ghost">
              <Link href={prev}>
                <ArrowLeft aria-hidden /> Previous
              </Link>
            </Button>
          )}
          {next ? (
            <Button asChild variant="ghost">
              <Link href={next}>
                Next <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost">
              <Link href={base}>Back to overview</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
