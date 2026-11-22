import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Circle, Info, MessageCircle, PlayCircle } from "lucide-react";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getLessons, getWorkshopView } from "@/lib/queries/workshop";
import { INSTAGRAM_URL } from "@/lib/utils";

export const metadata: Metadata = { title: "Workshop" };

export default async function WorkshopOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ enrolled?: string }>;
}) {
  const { slug } = await params;
  const profile = await requireUser(`/dashboard/workshops/${slug}`);
  const view = await getWorkshopView(profile, slug);
  if (!view) notFound();
  const [lessons, sp] = await Promise.all([
    getLessons(view.course.id, view.course.days),
    searchParams,
  ]);
  const { course, enrollment, responded, phases } = view;
  const done = responded.size;
  const next = lessons.find((l) => !responded.has(l.number))?.number ?? null;
  const base = `/dashboard/workshops/${course.slug}`;

  return (
    <div className="space-y-7">
      <header>
        <Link
          href="/dashboard/workshops"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Workshops
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">
          <span aria-hidden>{course.emoji} </span>
          {course.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Self-paced · {course.days} lessons ·{" "}
          {done === course.days ? "all done 🎉" : `${done} done`}
        </p>
      </header>

      {sp.enrolled && (
        <p role="status" className="bg-success-soft text-success rounded-2xl px-4 py-3">
          You&apos;re in! Every lesson is unlocked — start with Lesson 1.
        </p>
      )}

      <Card>
        <CardBody className="space-y-4">
          <ProgressBar
            value={(done / course.days) * 100}
            color={course.accent_color}
            label="Workshop progress"
          />
          {next && (
            <Button asChild size="lg">
              <Link href={`${base}/${next}`}>
                {done === 0 ? "Start Lesson 1" : `Continue: Lesson ${next}`}{" "}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          )}
          {course.notice && (
            <p className="bg-info-soft text-foreground flex items-start gap-2 rounded-xl px-4 py-3 text-sm">
              <Info className="text-info mt-0.5 size-4 shrink-0" aria-hidden />
              {course.notice}
            </p>
          )}
        </CardBody>
      </Card>

      {phases.map((ph, idx) => (
        <section key={ph.id} aria-labelledby={`module-${idx}`}>
          <h2 id={`module-${idx}`} className="text-xl font-semibold">
            <span className="text-muted-foreground mr-2 text-sm font-semibold tracking-wide uppercase">
              Module {idx + 1}
            </span>
            {ph.name}
          </h2>
          <ol className="border-border bg-surface rounded-card mt-3 divide-y overflow-hidden border">
            {lessons
              .filter((l) => l.number >= ph.start_day && l.number <= ph.end_day)
              .map((l) => (
                <li key={l.number}>
                  <Link
                    href={`${base}/${l.number}`}
                    className="hover:bg-surface-muted/60 flex items-center gap-3 px-4 py-3.5"
                  >
                    {responded.has(l.number) ? (
                      <CheckCircle2 className="text-success size-5 shrink-0" aria-label="Done" />
                    ) : (
                      <Circle
                        className="text-muted-foreground size-5 shrink-0"
                        aria-label="Not done yet"
                      />
                    )}
                    <span className="text-muted-foreground w-16 shrink-0 text-sm">
                      Lesson {l.number}
                    </span>
                    <span className="min-w-0 flex-1 font-medium">{l.title}</span>
                    {l.hasVideo && (
                      <PlayCircle
                        className="text-muted-foreground size-4 shrink-0"
                        aria-label="Has a video"
                      />
                    )}
                  </Link>
                </li>
              ))}
          </ol>
        </section>
      ))}

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Stuck on a step?</p>
            <p className="text-muted-foreground text-sm">
              Send a message to @mindfrombooks on Instagram.
            </p>
          </div>
          <Button asChild variant="outline">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden /> Message on Instagram
            </a>
          </Button>
        </CardBody>
      </Card>
      {enrollment.status === "refunded" && (
        <p className="text-muted-foreground text-sm">This purchase was refunded.</p>
      )}
    </div>
  );
}
