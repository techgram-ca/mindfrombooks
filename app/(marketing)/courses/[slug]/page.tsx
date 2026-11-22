import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Check, Info, Lock } from "lucide-react";
import { BookCard } from "@/components/marketing/book-card";
import { EnrollPanel } from "@/components/marketing/enroll-panel";
import { Faq } from "@/components/marketing/faq";
import { OfferPage } from "@/components/offer/offer-page";
import { WorkshopOfferPage } from "@/components/offer/workshop-offer-page";
import { getOffer, getWorkshopOffer } from "@/lib/offers";
import { GuaranteeBanner } from "@/components/marketing/guarantee";
import { CourseTestimonials } from "@/components/marketing/testimonials";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCourseBySlug,
  getOutline,
  getPublishedCourses,
  getSampleTasks,
  getSettings,
  getRatingSummary,
  getTestimonials,
} from "@/lib/queries/catalog";
import { formatUsd } from "@/lib/pricing";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const courses = await getPublishedCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getCourseBySlug(slug);
  if (!detail) return { title: "Course not found" };
  const { course } = detail;
  const title = `${course.name} — ${course.days}-day course`;
  return {
    title,
    description: course.short_description,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: { title, description: course.short_description },
  };
}

export default async function CoursePage({ params }: { params: Params }) {
  const { slug } = await params;
  const detail = await getCourseBySlug(slug);
  if (!detail) notFound();
  const { course, books, phases } = detail;
  const [samples, outline, settings, testimonials, ratingSummary] = await Promise.all([
    getSampleTasks(course),
    getOutline(course),
    getSettings(),
    getTestimonials(course.id, 8),
    getRatingSummary(course.id),
  ]);
  const workshopOffer = getWorkshopOffer(course.slug);
  if (workshopOffer && course.format === "self_paced") {
    return (
      <WorkshopOfferPage
        course={course}
        phases={phases}
        outline={outline}
        testimonials={testimonials}
        ratingSummary={ratingSummary}
        offer={workshopOffer}
      />
    );
  }
  const offer = getOffer(course.slug);
  if (offer) {
    return (
      <OfferPage
        course={course}
        books={books}
        phases={phases}
        samples={samples}
        outline={outline}
        testimonials={testimonials}
        ratingSummary={ratingSummary}
        windowDays={settings.refund_window_days}
        offer={offer}
      />
    );
  }

  const sampleDays = new Set(samples.map((s) => s.day_number));
  const locked = outline.filter((o) => !sampleDays.has(o.day_number));
  const lockedPreview = locked.slice(0, 8);

  const enroll = (
    <Suspense fallback={<Skeleton className="h-44 w-full" />}>
      <EnrollPanel
        product={{ kind: "course", id: course.id, slug: course.slug, name: course.name }}
        priceCents={course.price_cents}
        note="Day 1 opens tomorrow morning, in your timezone."
      />
    </Suspense>
  );

  return (
    <div className="pb-24 md:pb-0">
      <section
        className="border-border border-b"
        style={{ background: `linear-gradient(180deg, ${course.accent_color}17, transparent)` }}
      >
        <div className="container-page grid gap-8 py-10 md:grid-cols-[1.25fr_0.75fr] md:py-14">
          <div>
            <p className="text-sm font-medium" style={{ color: course.accent_color }}>
              {course.category} · {course.days} days
            </p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
              <span aria-hidden>{course.emoji} </span>
              {course.name}
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
              {course.short_description}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]">
              <span className="font-semibold">{formatUsd(course.price_cents)} one-time</span>
              <span className="text-muted-foreground">One task a day</span>
              <span className="text-muted-foreground">5–15 minutes</span>
            </div>
            <p className="border-border bg-surface mt-5 max-w-2xl rounded-2xl border px-4 py-3 text-[15px]">
              <span className="font-semibold" style={{ color: course.accent_color }}>
                Why {course.days} days?
              </span>{" "}
              {course.number_reason}
            </p>
            {course.notice && (
              <p
                role="note"
                className="bg-info-soft text-info mt-4 flex max-w-2xl items-start gap-2 rounded-2xl px-4 py-3 text-sm"
              >
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                {course.notice}
              </p>
            )}
          </div>
          <div className="md:sticky md:top-24 md:self-start">{enroll}</div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-10 md:grid-cols-[1.25fr_0.75fr]">
        <div className="min-w-0 space-y-12">
          {books.length > 0 && (
            <section aria-labelledby="books-title">
              <h2 id="books-title" className="text-2xl font-semibold">
                Inspired by
              </h2>
              <div
                className="-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pb-2"
                tabIndex={0}
                role="group"
                aria-label="Books this course is inspired by"
              >
                {books.map((b) => (
                  <BookCard key={b.id} book={b} color={course.accent_color} />
                ))}
              </div>
              <p className="text-muted-foreground mt-3 text-sm">
                Ideas are explained in our own words. This course is not affiliated with or endorsed
                by the authors or publishers.
              </p>
            </section>
          )}

          <section aria-labelledby="about-title">
            <h2 id="about-title" className="text-2xl font-semibold">
              What this course is
            </h2>
            <p className="text-foreground/85 mt-3 leading-relaxed">{course.description}</p>
          </section>

          {course.outcomes.length > 0 && (
            <section aria-labelledby="outcomes-title">
              <h2 id="outcomes-title" className="text-2xl font-semibold">
                What you&apos;ll achieve
              </h2>
              <ul className="mt-4 space-y-3">
                {course.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-3">
                    <span className="bg-success-soft text-success mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {phases.length > 0 && (
            <section aria-labelledby="phases-title">
              <h2 id="phases-title" className="text-2xl font-semibold">
                The {phases.length} phases
              </h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {phases.map((p, i) => (
                  <li key={p.id} className="border-border bg-surface rounded-2xl border p-4">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                      Phase {i + 1}
                    </p>
                    <p className="mt-1 font-serif text-lg font-semibold">{p.name}</p>
                    <p className="text-muted-foreground text-sm">
                      Days {p.start_day}–{p.end_day}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {samples.length > 0 && (
            <section aria-labelledby="samples-title">
              <h2 id="samples-title" className="text-2xl font-semibold">
                Sample days
              </h2>
              <p className="text-muted-foreground mt-2">
                Here&apos;s exactly what a day looks like.
              </p>
              <div className="mt-5 space-y-4">
                {samples.map((t) => (
                  <article
                    key={t.id}
                    className="rounded-card border-border bg-surface shadow-soft border p-5"
                  >
                    <p
                      className="text-xs font-semibold tracking-wide uppercase"
                      style={{ color: course.accent_color }}
                    >
                      Day {t.day_number}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">{t.title}</h3>
                    {t.book_insight && (
                      <p className="text-foreground/85 mt-3 leading-relaxed">{t.book_insight}</p>
                    )}
                    {t.book_reference && (
                      <p className="text-muted-foreground mt-2 text-sm">
                        Inspired by {t.book_reference}
                      </p>
                    )}
                    {t.instructions.length > 0 && (
                      <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px]">
                        {t.instructions.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    )}
                    {t.response_prompt && (
                      <p className="bg-surface-muted mt-4 rounded-xl px-4 py-3 text-[15px]">
                        <span className="font-semibold">You&apos;ll answer: </span>
                        {t.response_prompt}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {locked.length > 0 && (
            <section aria-labelledby="outline-title">
              <h2 id="outline-title" className="text-2xl font-semibold">
                The rest of the {course.days} days
              </h2>
              <p className="text-muted-foreground mt-2">
                Each day unlocks at midnight once you&apos;re enrolled.
              </p>
              <ul className="divide-border rounded-card border-border bg-surface mt-4 divide-y border">
                {lockedPreview.map((o) => (
                  <li key={o.day_number} className="flex items-center gap-3 px-4 py-3">
                    <Lock className="text-muted-foreground size-4 shrink-0" aria-hidden />
                    <span className="text-muted-foreground w-14 shrink-0 text-sm font-medium">
                      Day {o.day_number}
                    </span>
                    <span className="min-w-0 truncate blur-[5px] select-none" aria-hidden>
                      {o.title}
                    </span>
                    <span className="sr-only">Locked until you enroll</span>
                  </li>
                ))}
                {locked.length > lockedPreview.length && (
                  <li className="text-muted-foreground px-4 py-3 text-center text-sm">
                    + {locked.length - lockedPreview.length} more days
                  </li>
                )}
              </ul>
            </section>
          )}

          <GuaranteeBanner graceDays={course.grace_days} windowDays={settings.refund_window_days} />

          <CourseTestimonials items={testimonials} summary={ratingSummary} className="md:hidden" />

          {course.faq.length > 0 && (
            <section aria-labelledby="course-faq-title">
              <h2 id="course-faq-title" className="mb-5 text-2xl font-semibold">
                Questions
              </h2>
              <Faq items={course.faq} />
            </section>
          )}
        </div>
        <aside className="hidden md:block">
          <CourseTestimonials items={testimonials} summary={ratingSummary} />
        </aside>
      </div>
    </div>
  );
}
