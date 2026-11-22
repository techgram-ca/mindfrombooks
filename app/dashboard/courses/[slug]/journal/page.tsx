import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth";
import { formatDateLong } from "@/lib/course-days";
import { getEnrollmentView, getJournal } from "@/lib/queries/learning";

export const metadata: Metadata = { title: "Journal" };

export default async function JournalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await requireUser(`/dashboard/courses/${slug}/journal`);
  const view = await getEnrollmentView(profile, slug);
  if (!view) notFound();
  if (view.enrollment.status === "revoked") redirect("/dashboard/courses");
  if (view.course.format === "self_paced") redirect(`/dashboard/workshops/${view.course.slug}`);
  const entries = await getJournal(view);

  return (
    <div className="space-y-6">
      <header>
        <Link
          href={`/dashboard/courses/${slug}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← {view.course.name}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">Your journal</h1>
        <p className="text-muted-foreground mt-1">
          Everything you wrote in {view.course.name}, newest first.
          {view.enrollment.status === "refunded" &&
            " This course was refunded, so the journal is read-only."}
        </p>
      </header>
      {entries.length === 0 ? (
        <EmptyState emoji="✍️" title="Nothing written yet">
          Your responses will collect here, one day at a time.
        </EmptyState>
      ) : (
        <ol className="border-border relative space-y-5 border-l-2 pl-5">
          {entries.map(({ response, title, prompt, date }) => (
            <li key={response.id} className="relative">
              <span
                aria-hidden
                className="border-background absolute top-1.5 -left-[1.72rem] size-3 rounded-full border-2"
                style={{ background: view.course.accent_color }}
              />
              <p className="text-muted-foreground text-sm">
                Day {response.day_number}
                {date ? ` · ${formatDateLong(date)}` : ""}
              </p>
              <h2 className="mt-0.5 text-lg font-semibold">{title}</h2>
              {prompt && <p className="text-muted-foreground mt-1 text-sm">{prompt}</p>}
              <p className="rounded-card border-border bg-surface shadow-soft mt-2 border p-4 leading-relaxed whitespace-pre-wrap">
                {response.body}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
