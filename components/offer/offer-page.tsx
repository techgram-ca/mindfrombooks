import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Lock,
  Quote as QuoteIcon,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { CompoundCalculator } from "@/components/offer/compound-calculator";
import { EnrollPanel } from "@/components/marketing/enroll-panel";
import { Faq } from "@/components/marketing/faq";
import { CourseTestimonials } from "@/components/marketing/testimonials";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OfferContent, OfferQuote } from "@/lib/offers";
import type { OutlineItem, RatingSummary, Testimonial } from "@/lib/queries/catalog";
import { formatUsd } from "@/lib/pricing";
import type { Course, CourseBook, CoursePhase, Task } from "@/lib/types";
import { plural } from "@/lib/utils";

interface Props {
  course: Course;
  books: CourseBook[];
  phases: CoursePhase[];
  samples: Task[];
  outline: OutlineItem[];
  testimonials: Testimonial[];
  ratingSummary: RatingSummary | null;
  windowDays: number;
  offer: OfferContent;
}

const INK = "#0f2a1f";
const GOLD = "#f3c77a";

function SectionTitle({
  eyebrow,
  title,
  intro,
  id,
  light,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  id: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p
          className={`text-sm font-semibold tracking-[0.12em] uppercase ${light ? "text-[#f3c77a]" : "text-accent-strong"}`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={`mt-2 text-3xl leading-tight font-semibold sm:text-4xl ${light ? "text-white" : ""}`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-3 text-lg leading-relaxed ${light ? "text-white/75" : "text-muted-foreground"}`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}

function QuoteCard({ q }: { q: OfferQuote }) {
  return (
    <figure className="border-border bg-surface shadow-soft flex h-full flex-col rounded-3xl border p-6">
      <QuoteIcon className="text-accent size-6" aria-hidden />
      <blockquote className="mt-3 flex-1 font-serif text-xl leading-snug">“{q.text}”</blockquote>
      <figcaption className="text-muted-foreground mt-4 text-sm">
        <span className="text-foreground font-semibold">{q.author}</span>
        {q.source && <span>, {q.source}</span>}
      </figcaption>
    </figure>
  );
}

export function OfferPage({
  course,
  books,
  phases,
  samples,
  outline,
  testimonials,
  ratingSummary,
  windowDays,
  offer,
}: Props) {
  const accent = course.accent_color;
  const titleOf = new Map(outline.map((o) => [o.day_number, o.title]));
  const sampleDays = new Set(samples.map((s) => s.day_number));
  const firstSample = samples[0];
  const graceText =
    course.grace_days > 0
      ? `You can miss up to ${plural(course.grace_days, "day")} and still qualify.`
      : "Respond on every day to qualify.";
  const phaseOf = (d: number) => phases.find((p) => d >= p.start_day && d <= p.end_day);
  const phaseColors = ["#2F7D57", "#C8892B", "#2F5FB3"];
  const phaseText = ["#276b4a", "#8a5a12", "#2f5fb3"];

  return (
    <div className="pb-24 md:pb-0">
      {/* ------------------------------------------------------------ HERO */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background: `radial-gradient(1200px 500px at 85% -10%, ${accent}55, transparent 60%), radial-gradient(800px 400px at -10% 110%, #c8892b33, transparent 60%), ${INK}`,
        }}
      >
        <div className="container-page grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr] md:gap-x-10 md:gap-y-0 md:py-20">
          <div className="md:col-start-1 md:row-start-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white/85">
              <span aria-hidden>{course.emoji}</span> {offer.eyebrow}
            </p>
            <h1 className="mt-5 text-[2.35rem] leading-[1.06] font-semibold sm:text-6xl">
              {offer.headline.map((line, i) => (
                <span
                  key={line}
                  className={
                    i === offer.headline.length - 1 ? "mt-1 block text-[#f3c77a]" : "block"
                  }
                >
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{offer.subhead}</p>
          </div>

          <div className="md:col-start-2 md:row-span-2 md:row-start-1 md:self-center">
            <div className="text-foreground">
              <Suspense fallback={<Skeleton className="h-44 w-full" />}>
                <EnrollPanel
                  product={{ kind: "course", id: course.id, slug: course.slug, name: course.name }}
                  priceCents={course.price_cents}
                  note="Day 1 opens tomorrow morning. No account needed to pay."
                />
              </Suspense>
            </div>
            <a
              href="#guarantee"
              className="mt-4 flex items-start gap-3 rounded-2xl border border-[#f3c77a]/40 bg-[#f3c77a]/10 p-4 text-sm text-white/90 hover:bg-[#f3c77a]/15"
            >
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#f3c77a]" aria-hidden />
              <span>
                <strong className="text-white">
                  Do the work. Not happy? Full refund in one click.
                </strong>{" "}
                No forms, no questions.{" "}
                <span className="underline underline-offset-2">How it works</span>
              </span>
            </a>
            {ratingSummary && (
              <p className="mt-3 text-center text-sm text-white/75">
                ★ {ratingSummary.average.toFixed(1)} from {ratingSummary.count} people who finished
              </p>
            )}
          </div>
          <div className="md:col-start-1 md:row-start-2">
            <ul className="grid gap-2.5 sm:grid-cols-2 md:mt-6">
              {offer.heroPoints.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[15px] text-white/90">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f3c77a] text-[#0f2a1f]">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-center">
              {[
                { k: "days", v: String(course.days) },
                { k: "minutes a day", v: "~10" },
                { k: "one-time", v: formatUsd(course.price_cents) },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3">
                  <dd className="font-serif text-2xl font-semibold">{s.v}</dd>
                  <dt className="text-xs text-white/65">{s.k}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ GUARANTEE (moved up) */}
      <section
        id="guarantee"
        aria-labelledby="guarantee-title"
        className="container-page -mt-6 scroll-mt-24 md:-mt-10"
      >
        <div className="border-success/30 shadow-lift relative rounded-3xl border-2 bg-white p-6 sm:p-10">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <span className="bg-success inline-flex size-12 items-center justify-center rounded-2xl text-white">
                <ShieldCheck className="size-6" aria-hidden />
              </span>
              <h2
                id="guarantee-title"
                className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl"
              >
                Do all {course.days} days. Not happy?{" "}
                <span className="text-success">Your money back.</span>
              </h2>
              <p className="text-muted-foreground mt-3 text-lg">
                We only win if this changes your money. So the risk is ours, not yours.
              </p>
            </div>
            <ol className="grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
              {[
                {
                  n: "1",
                  t: "Do the daily task",
                  b: `Respond each day before midnight. ${graceText}`,
                },
                {
                  n: "2",
                  t: `Finish Day ${course.days}`,
                  b: "Your course page shows you're on track the whole way.",
                },
                {
                  n: "3",
                  t: "Tap “Claim refund”",
                  b: `Within ${windowDays} days of the last day. Refunded automatically.`,
                },
              ].map((s) => (
                <li key={s.n} className="bg-success-soft rounded-2xl p-4">
                  <span className="bg-success inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold text-white">
                    {s.n}
                  </span>
                  <p className="mt-2 font-semibold">{s.t}</p>
                  <p className="text-foreground/75 mt-1 text-sm leading-relaxed">{s.b}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ PAINS */}
      <section aria-labelledby="pains-title" className="container-page py-16 sm:py-24">
        <SectionTitle
          id="pains-title"
          eyebrow="Sound familiar?"
          title="Good salary. Hard-working. Still no idea where the money went."
        />
        <p className="text-muted-foreground mt-2 text-sm sm:hidden" aria-hidden>
          Swipe →
        </p>
        <div
          className="-mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4"
          tabIndex={0}
          role="group"
          aria-label="Common money problems"
        >
          {offer.pains.map((p) => (
            <div
              key={p.title}
              className="border-border bg-surface w-[78%] shrink-0 snap-start rounded-3xl border p-5 sm:w-auto"
            >
              <p className="font-serif text-lg font-semibold">{p.title}</p>
              <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-3xl font-serif text-2xl leading-snug sm:text-3xl">
          {offer.painsVerdict.split(". ").map((sentence, i, all) => (
            <span key={i} className={i === 1 ? "text-accent-strong" : undefined}>
              {sentence}
              {i < all.length - 1 ? ". " : ""}
            </span>
          ))}
        </p>
      </section>

      {/* ------------------------------------------------------------ FEATURED QUOTE */}
      <section aria-label="Quote" className="bg-surface-muted">
        <figure className="container-narrow py-14 text-center sm:py-20">
          <blockquote className="font-serif text-3xl leading-snug font-semibold sm:text-4xl">
            “{offer.featuredQuote.text}”
          </blockquote>
          <figcaption className="text-muted-foreground mt-5">
            — <span className="text-foreground font-semibold">{offer.featuredQuote.author}</span>
            {offer.featuredQuote.source && `, ${offer.featuredQuote.source}`}
          </figcaption>
        </figure>
      </section>

      {/* ------------------------------------------------------------ CALCULATOR */}
      <section aria-labelledby="calc-title" className="text-white" style={{ background: INK }}>
        <div className="container-page py-16 sm:py-24">
          <SectionTitle
            id="calc-title"
            light
            eyebrow="The maths of small habits"
            title={offer.calculator.title}
            intro={offer.calculator.intro}
          />
          <div className="mt-10">
            <CompoundCalculator accent={GOLD} />
          </div>
          <p className="mt-6 max-w-2xl text-white/75">
            You can&apos;t compound money you never keep. Days 3, 17 and 22 of this course set up
            exactly that: paying yourself first, automatically, and understanding where long-term
            money should go.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ TRANSFORMATION */}
      <section aria-labelledby="change-title" className="container-page py-16 sm:py-24">
        <SectionTitle
          id="change-title"
          eyebrow={`Day 1 → Day ${course.days}`}
          title="What changes in one month"
        />
        <div className="border-border bg-surface shadow-soft mt-10 overflow-hidden rounded-3xl border">
          <div className="text-muted-foreground hidden grid-cols-2 border-b px-6 py-3 text-xs font-semibold tracking-wider uppercase sm:grid">
            <span>Today</span>
            <span>After {course.days} days</span>
          </div>
          <ul className="divide-border divide-y">
            {offer.transformation.map((t) => (
              <li key={t.after} className="grid gap-2 px-5 py-4 sm:grid-cols-2 sm:gap-6 sm:px-6">
                <span className="text-muted-foreground flex items-start gap-2.5">
                  <X className="text-danger mt-0.5 size-4 shrink-0" aria-hidden />
                  <span className="line-through decoration-1">{t.before}</span>
                </span>
                <span className="flex items-start gap-2.5 font-medium">
                  <Check className="text-success mt-0.5 size-4 shrink-0" aria-hidden />
                  {t.after}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ JOURNEY */}
      <section aria-labelledby="journey-title" className="bg-surface-muted">
        <div className="container-page py-16 sm:py-24">
          <SectionTitle
            id="journey-title"
            eyebrow="The path"
            title={`${course.days} days, three phases, one small action a day`}
            intro={
              course.number_reason ? `Why ${course.days}? ${course.number_reason}.` : undefined
            }
          />
          <div className="mt-8 flex gap-1" aria-hidden>
            {Array.from({ length: course.days }, (_, i) => {
              const idx = Math.max(
                0,
                phases.findIndex((p) => p === phaseOf(i + 1)),
              );
              return (
                <span
                  key={i}
                  className="h-2.5 flex-1 rounded-full"
                  style={{
                    background: phaseColors[idx % 3],
                    opacity: sampleDays.has(i + 1) ? 1 : 0.55,
                  }}
                />
              );
            })}
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {phases.map((ph, idx) => (
              <div key={ph.id} className="border-border bg-surface rounded-3xl border p-6">
                <p
                  className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: phaseText[idx % 3] }}
                >
                  Phase {idx + 1} · Days {ph.start_day}–{ph.end_day}
                </p>
                <p className="mt-1 font-serif text-2xl font-semibold">{ph.name}</p>
                <ul className="mt-4 space-y-2.5">
                  {offer.journeyHighlights
                    .filter((d) => d >= ph.start_day && d <= ph.end_day && titleOf.has(d))
                    .map((d) => (
                      <li key={d} className="flex items-start gap-3 text-[15px]">
                        <span className="bg-surface-muted text-muted-foreground mt-0.5 w-12 shrink-0 rounded-md py-0.5 text-center text-xs font-semibold">
                          Day {d}
                        </span>
                        <span>
                          {titleOf.get(d)}
                          {sampleDays.has(d) && (
                            <span className="text-success ml-1.5 text-xs font-semibold whitespace-nowrap">
                              Free preview
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                </ul>
                <p className="text-muted-foreground mt-4 flex items-center gap-1.5 text-sm">
                  <Lock className="size-3.5" aria-hidden /> +{" "}
                  {Math.max(
                    0,
                    ph.end_day -
                      ph.start_day +
                      1 -
                      offer.journeyHighlights.filter((d) => d >= ph.start_day && d <= ph.end_day)
                        .length,
                  )}{" "}
                  more days unlock as you go
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ SAMPLE DAY */}
      {firstSample && (
        <section
          id="sample"
          aria-labelledby="sample-title"
          className="container-page scroll-mt-24 py-16 sm:py-24"
        >
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <SectionTitle
              id="sample-title"
              eyebrow="Try it now, free"
              title="This is a whole day. That's it."
              intro="One idea from a great book, a few concrete steps, one question to answer. About ten minutes — and it's done."
            />
            <article className="border-border bg-surface shadow-lift rounded-3xl border p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: accent }}
                >
                  Day {firstSample.day_number} · {phaseOf(firstSample.day_number)?.name}
                </p>
                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                  <Clock className="size-3.5" aria-hidden /> ~10 min
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-semibold">{firstSample.title}</h3>
              <div className="bg-surface-muted mt-4 rounded-2xl p-4">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                  The idea
                </p>
                <p className="mt-1.5 font-serif text-[17px] leading-relaxed">
                  {firstSample.book_insight}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  Inspired by {firstSample.book_reference}
                </p>
              </div>
              <ol className="mt-5 space-y-2.5">
                {firstSample.instructions.map((line, i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px]">
                    <span
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: accent }}
                    >
                      {i + 1}
                    </span>
                    {line}
                  </li>
                ))}
              </ol>
              <p className="border-border mt-5 border-t pt-4 text-[15px]">
                <span className="font-semibold">You answer: </span>
                {firstSample.response_prompt}
              </p>
            </article>
          </div>
          {samples.length > 1 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {samples.slice(1).map((s) => (
                <details key={s.id} className="group border-border bg-surface rounded-2xl border">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-medium [&::-webkit-details-marker]:hidden">
                    <span>
                      <span className="text-muted-foreground mr-2 text-sm">Day {s.day_number}</span>
                      {s.title}
                    </span>
                    <ArrowDown
                      className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div className="space-y-3 px-4 pb-4 text-[15px]">
                    <p className="text-foreground/85 leading-relaxed">{s.book_insight}</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {s.instructions.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------ QUOTES */}
      <section aria-labelledby="quotes-title" className="bg-surface-muted">
        <div className="container-page py-16 sm:py-24">
          <SectionTitle
            id="quotes-title"
            eyebrow="Borrowed wisdom"
            title="The people who figured money out all say the same thing"
          />
          <div
            className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0"
            tabIndex={0}
            role="group"
            aria-label="Quotes"
          >
            {offer.quotes.map((q) => (
              <div key={q.text} className="w-[82%] shrink-0 snap-start md:w-auto">
                <QuoteCard q={q} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ BOOKS */}
      {books.length > 0 && (
        <section aria-labelledby="books-title" className="container-page py-16 sm:py-24">
          <SectionTitle
            id="books-title"
            eyebrow={`${books.length} books, one month`}
            title="The best of the money classics — turned into daily action"
            intro="You don't need to read them first. Each day gives you the one idea you need, in plain language."
          />
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {books.map((b) => (
              <li
                key={b.id}
                className="border-border bg-surface inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[15px]"
              >
                <BookOpen className="size-4" style={{ color: accent }} aria-hidden />
                <span className="font-medium">{b.title}</span>
                <span className="text-muted-foreground">· {b.author}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground mt-4 text-sm">
            Ideas are explained in our own words. Not affiliated with or endorsed by the authors or
            publishers.
          </p>
        </section>
      )}

      {/* ------------------------------------------------------------ VALUE + FIT */}
      <section aria-labelledby="fit-title" className="container-page pb-16 sm:pb-24">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="bg-accent-soft rounded-3xl p-6 sm:p-8">
            <Sparkles className="text-accent-strong size-6" aria-hidden />
            <p className="mt-3 font-serif text-2xl font-semibold">{offer.valueLine.title}</p>
            <p className="text-foreground/80 mt-2 leading-relaxed">{offer.valueLine.body}</p>
            <p className="mt-5 font-serif text-4xl font-semibold">
              {formatUsd(course.price_cents)}{" "}
              <span className="text-muted-foreground font-sans text-base font-normal">once</span>
            </p>
            <p className="text-muted-foreground text-sm">
              No subscription. Keep your journal forever.
            </p>
          </div>
          <div className="border-border bg-surface rounded-3xl border p-6 sm:p-8">
            <h2 id="fit-title" className="font-serif text-2xl font-semibold">
              This is for you if…
            </h2>
            <ul className="mt-4 space-y-3">
              {offer.forYou.map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="text-success mt-0.5 size-5 shrink-0" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border bg-surface rounded-3xl border p-6 sm:p-8">
            <p className="font-serif text-2xl font-semibold">It&apos;s not for you if…</p>
            <ul className="mt-4 space-y-3">
              {offer.notForYou.map((t) => (
                <li key={t} className="text-muted-foreground flex items-start gap-2.5">
                  <X className="mt-0.5 size-5 shrink-0" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ TESTIMONIALS (real only) */}
      {(testimonials.length > 0 || ratingSummary) && (
        <section className="container-page pb-16 sm:pb-24">
          <div className="mx-auto max-w-3xl">
            <CourseTestimonials items={testimonials} summary={ratingSummary} />
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ FAQ */}
      <section aria-labelledby="faq-title" className="container-page pb-16 sm:pb-24">
        <SectionTitle id="faq-title" eyebrow="Questions" title="Before you start" />
        <div className="mt-8">
          <Faq items={[...offer.extraFaq, ...course.faq]} />
        </div>
      </section>

      {/* ------------------------------------------------------------ FINAL CTA */}
      <section
        aria-labelledby="final-title"
        className="text-white"
        style={{
          background: `radial-gradient(900px 400px at 50% 0%, ${accent}66, transparent 70%), ${INK}`,
        }}
      >
        <div className="container-narrow py-16 text-center sm:py-24">
          <h2 id="final-title" className="text-3xl leading-tight font-semibold sm:text-4xl">
            {offer.finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">{offer.finalCta.body}</p>
          <Button asChild size="lg" variant="accent" className="mt-8">
            <Link href="#enroll">
              Start Day 1 tomorrow · {formatUsd(course.price_cents)} <ArrowRight aria-hidden />
            </Link>
          </Button>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-white/70">
            <ShieldCheck className="size-4" aria-hidden /> Do the work and still not happy?
            One-click refund.
          </p>
        </div>
      </section>
    </div>
  );
}
