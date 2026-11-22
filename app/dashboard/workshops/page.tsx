import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getLearnerState } from "@/lib/queries/learning";

export const metadata: Metadata = { title: "Workshops" };

export default async function WorkshopsPage() {
  const profile = await requireUser("/dashboard/workshops");
  const { views } = await getLearnerState(profile);
  const workshops = views.filter(
    (v) => v.course.format === "self_paced" && v.enrollment.status !== "revoked",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Workshops</h1>
        <p className="text-muted-foreground mt-1">
          Self-paced: every lesson is open. Work through them whenever you like.
        </p>
      </div>
      {workshops.length === 0 ? (
        <EmptyState
          emoji="🎬"
          title="No workshops yet"
          action={
            <Button asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          }
        >
          Workshops you buy appear here.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {workshops.map((v) => {
            const done = v.progress.respondedCount;
            const next = Math.min(
              v.course.days,
              [...Array(v.course.days).keys()].map((i) => i + 1).find((n) => !v.responded.has(n)) ??
                v.course.days,
            );
            return (
              <li
                key={v.enrollment.id}
                className="rounded-card border-border bg-surface shadow-soft border p-5"
              >
                <Link href={`/dashboard/workshops/${v.course.slug}`} className="block">
                  <p className="font-semibold">
                    <span aria-hidden>{v.course.emoji} </span>
                    {v.course.name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {done === v.course.days
                      ? "All lessons done 🎉"
                      : `${done} of ${v.course.days} lessons done · next: Lesson ${next}`}
                  </p>
                  <div className="mt-3">
                    <ProgressBar
                      value={(done / v.course.days) * 100}
                      color={v.course.accent_color}
                      label={`${v.course.name} progress`}
                    />
                  </div>
                </Link>
                <Button asChild size="sm" className="mt-4">
                  <Link href={`/dashboard/workshops/${v.course.slug}/${next}`}>
                    {done === 0 ? "Start Lesson 1" : `Continue: Lesson ${next}`}{" "}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
