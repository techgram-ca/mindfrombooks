import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EnrollPanel } from "@/components/marketing/enroll-panel";
import { GuaranteeBanner } from "@/components/marketing/guarantee";
import { Skeleton } from "@/components/ui/skeleton";
import { getBundle, getSettings } from "@/lib/queries/catalog";
import { formatUsd, splitAmount } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "All Access — every course",
  description:
    "All six daily-action courses in one bundle. Start each course whenever you're ready.",
  alternates: { canonical: "/all-access" },
};

export default async function AllAccessPage() {
  const [detail, settings] = await Promise.all([getBundle(), getSettings()]);
  if (!detail || detail.courses.length === 0) notFound();
  const { bundle, courses } = detail;
  const totalDays = courses.reduce((s, c) => s + c.days, 0);
  const separate = courses.reduce((s, c) => s + c.price_cents, 0);
  const saving = separate - bundle.price_cents;
  const perCourse = splitAmount(bundle.price_cents, courses.length)[0] ?? 0;

  return (
    <div className="pb-24 md:pb-0">
      <section className="border-border bg-primary text-primary-foreground border-b">
        <div className="container-page grid gap-8 py-10 md:grid-cols-[1.25fr_0.75fr] md:py-14">
          <div>
            <p className="text-accent text-sm font-medium tracking-wide uppercase">All Access</p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
              Every course. {totalDays} days of action.
            </h1>
            <p className="text-primary-foreground/80 mt-4 max-w-xl text-lg">
              All {courses.length} courses for {formatUsd(bundle.price_cents)}. You decide when each
              one starts — do them one at a time, or stack a couple.
            </p>
            <dl className="mt-6 grid max-w-md grid-cols-3 gap-3 text-center">
              {[
                { k: "Courses", v: String(courses.length) },
                { k: "Days", v: String(totalDays) },
                { k: "You save", v: saving > 0 ? formatUsd(saving) : "—" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl bg-white/10 px-2 py-3">
                  <dd className="font-serif text-2xl font-semibold">{s.v}</dd>
                  <dt className="text-primary-foreground/70 text-xs">{s.k}</dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="text-foreground md:sticky md:top-24 md:self-start">
            <Suspense fallback={<Skeleton className="h-44 w-full" />}>
              <EnrollPanel
                product={{ kind: "bundle", id: bundle.id, slug: bundle.slug, name: bundle.name }}
                priceCents={bundle.price_cents}
                note="Start each course when you're ready. Day 1 opens the next morning."
              />
            </Suspense>
          </div>
        </div>
      </section>

      <div className="container-page min-w-0 space-y-10 py-10">
        <section aria-labelledby="included-title">
          <h2 id="included-title" className="text-2xl font-semibold">
            What&apos;s included
          </h2>
          <div className="rounded-card border-border bg-surface mt-4 overflow-hidden border">
            <ul className="divide-border divide-y">
              {courses.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/courses/${c.slug}`}
                    className="hover:bg-surface-muted/60 flex items-center gap-4 px-4 py-4 sm:px-5"
                  >
                    <span aria-hidden className="text-2xl">
                      {c.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{c.name}</span>
                      <span className="text-muted-foreground block truncate text-sm">
                        {c.days} days · {c.number_reason}
                      </span>
                    </span>
                    <span className="text-muted-foreground text-sm line-through">
                      {formatUsd(c.price_cents)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-border bg-surface-muted/60 flex items-center justify-between border-t px-4 py-4 sm:px-5">
              <span className="text-muted-foreground text-sm">
                Separately {formatUsd(separate)} · All Access
              </span>
              <span className="font-serif text-xl font-semibold">
                {formatUsd(bundle.price_cents)}
              </span>
            </div>
          </div>
        </section>

        <GuaranteeBanner windowDays={settings.refund_window_days} />
        <p className="text-muted-foreground text-sm">
          With All Access, the guarantee works per course: each course you complete can be refunded
          on its own for an equal share of what you paid (about {formatUsd(perCourse)} each).
        </p>
      </div>
    </div>
  );
}
