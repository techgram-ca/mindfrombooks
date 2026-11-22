import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Check, Clapperboard, Info, PlayCircle, X } from "lucide-react";
import { EnrollPanel } from "@/components/marketing/enroll-panel";
import { Faq } from "@/components/marketing/faq";
import { CourseTestimonials } from "@/components/marketing/testimonials";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkshopOfferContent } from "@/lib/offers";
import type { OutlineItem, RatingSummary, Testimonial } from "@/lib/queries/catalog";
import { formatUsd, percentOff } from "@/lib/pricing";
import type { Course, CoursePhase } from "@/lib/types";

interface Props {
  course: Course;
  phases: CoursePhase[];
  outline: OutlineItem[];
  testimonials: Testimonial[];
  ratingSummary: RatingSummary | null;
  offer: WorkshopOfferContent;
}

const INK = "#1b1026";

function Title({
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
          className={`text-sm font-semibold tracking-[0.12em] uppercase ${light ? "text-[#f2a7c9]" : "text-[#8f2659]"}`}
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

export function WorkshopOfferPage({
  course,
  phases,
  outline,
  testimonials,
  ratingSummary,
  offer,
}: Props) {
  const accent = course.accent_color;
  const titleOf = new Map(outline.map((o) => [o.day_number, o.title]));
  const { comparison } = offer;

  return (
    <div className="pb-24 md:pb-0">
      {/* ------------------------------------------------------------ HERO */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background: `radial-gradient(1000px 480px at 90% -10%, ${accent}66, transparent 60%), radial-gradient(700px 380px at -10% 110%, #4b2a8a55, transparent 60%), ${INK}`,
        }}
      >
        <div className="container-page grid gap-10 py-10 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white/85">
              <Clapperboard className="size-4" aria-hidden /> {offer.eyebrow}
            </p>
            <h1 className="mt-5 text-[2.3rem] leading-[1.06] font-semibold sm:text-5xl lg:text-[3.5rem]">
              {offer.headline.map((line, i) => (
                <span
                  key={line}
                  className={
                    i === offer.headline.length - 1 ? "mt-1 block text-[#f2a7c9]" : "inline"
                  }
                >
                  {line}{" "}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{offer.subhead}</p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {offer.heroPoints.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[15px] text-white/90">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f2a7c9] text-[#1b1026]">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-foreground">
              <Suspense fallback={<Skeleton className="h-44 w-full" />}>
                <EnrollPanel
                  product={{ kind: "course", id: course.id, slug: course.slug, name: course.name }}
                  priceCents={course.price_cents}
                  listPriceCents={course.list_price_cents}
                  note="Every lesson unlocks the moment you pay. No account needed to pay."
                  guarantee={course.has_guarantee}
                />
              </Suspense>
            </div>
            <p className="mt-4 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/85">
              <Info className="mt-0.5 size-5 shrink-0 text-[#f2a7c9]" aria-hidden />
              <span>
                <strong className="text-white">Also needed:</strong> Claude Pro (≈ US$20/month).
                ElevenLabs is optional.{" "}
                <a href="#costs" className="underline underline-offset-2">
                  See all costs
                </a>
                {!course.has_guarantee && " · no refund guarantee on this workshop."}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ EDITOR VS CLAUDE */}
      <section aria-labelledby="compare-title" className="container-page py-16 sm:py-24">
        <Title
          id="compare-title"
          eyebrow="Why it works"
          title={comparison.title}
          intro={comparison.intro}
        />

        {/* Desktop: table */}
        <div className="border-border bg-surface shadow-soft mt-10 hidden overflow-hidden rounded-3xl border md:block">
          <table className="w-full text-left">
            <caption className="sr-only">{comparison.title}</caption>
            <thead>
              <tr className="border-border border-b">
                <th scope="col" className="w-[22%] px-6 py-4">
                  <span className="sr-only">Compare</span>
                </th>
                <th scope="col" className="text-muted-foreground px-6 py-4 text-sm font-semibold">
                  With a video editor
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-sm font-semibold text-[#8f2659]"
                  style={{ background: `${accent}10` }}
                >
                  With your Claude studio
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {comparison.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="px-6 py-4 align-top font-semibold">
                    {r.label}
                  </th>
                  <td className="text-muted-foreground px-6 py-4 align-top">
                    <span className="flex items-start gap-2">
                      <X className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {r.editor}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 align-top font-medium"
                    style={{ background: `${accent}10` }}
                  >
                    <span className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 size-4 shrink-0"
                        style={{ color: accent }}
                        aria-hidden
                      />
                      {r.claude}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: cards */}
        <ul className="mt-8 space-y-3 md:hidden">
          {comparison.rows.map((r) => (
            <li
              key={r.label}
              className="border-border bg-surface overflow-hidden rounded-2xl border"
            >
              <p className="px-4 pt-3 font-semibold">{r.label}</p>
              <p className="text-muted-foreground flex items-start gap-2 px-4 pt-2 text-[15px]">
                <X className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <span className="sr-only">With a video editor: </span>
                  {r.editor}
                </span>
              </p>
              <p
                className="mt-2 flex items-start gap-2 px-4 py-3 text-[15px] font-medium"
                style={{ background: `${accent}10` }}
              >
                <Check className="mt-0.5 size-4 shrink-0" style={{ color: accent }} aria-hidden />
                <span>
                  <span className="sr-only">With Claude: </span>
                  {r.claude}
                </span>
              </p>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-4 text-sm">{comparison.footnote}</p>
      </section>

      {/* ------------------------------------------------------------ INSIDE */}
      <section aria-labelledby="inside-title" className="text-white" style={{ background: INK }}>
        <div className="container-page py-16 sm:py-24">
          <Title
            id="inside-title"
            light
            eyebrow="What's inside"
            title={`${course.days} lessons. All open the moment you join.`}
            intro="Each lesson has a short video, simple steps and copy-paste prompts for Windows, Mac and Linux."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {phases.map((ph, idx) => (
              <div key={ph.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs font-semibold tracking-wider text-[#f2a7c9] uppercase">
                  Module {idx + 1}
                </p>
                <p className="mt-1 font-serif text-2xl font-semibold">{ph.name}</p>
                {offer.outcomes[idx] && (
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">
                    {offer.outcomes[idx].body}
                  </p>
                )}
                <ol className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {Array.from({ length: ph.end_day - ph.start_day + 1 }, (_, i) => ph.start_day + i)
                    .filter((n) => titleOf.has(n))
                    .map((n) => (
                      <li key={n} className="flex items-start gap-2.5 text-[15px] text-white/90">
                        <PlayCircle className="mt-0.5 size-4 shrink-0 text-[#f2a7c9]" aria-hidden />
                        {titleOf.get(n)}
                      </li>
                    ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ PEEK */}
      <section aria-labelledby="peek-title" className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Title
            id="peek-title"
            eyebrow="A real prompt from the course"
            title="You describe it. Claude makes it."
            intro="This is the whole “editing” step. Read the script it proposes, say go, get a finished video."
          />
          <div className="shadow-lift overflow-hidden rounded-3xl border border-[#2a1f38] bg-[#14101c]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
              <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden />
              <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden />
              <span className="ml-2 text-xs text-white/60">{offer.peek.label}</span>
            </div>
            <pre className="px-5 py-4 text-[13px] leading-relaxed whitespace-pre-wrap text-[#e9e4f2]">
              {offer.peek.prompt}
            </pre>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ COSTS */}
      <section
        id="costs"
        aria-labelledby="costs-title"
        className="container-page scroll-mt-24 pb-16 sm:pb-24"
      >
        <Title id="costs-title" eyebrow="No surprises" title="Everything it costs" />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {offer.costs.map((c) => (
            <li key={c.item} className="border-border bg-surface rounded-2xl border p-5">
              <p className="text-sm font-semibold">
                {c.item}
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${c.required ? "bg-[#f8e1ec] text-[#8f2659]" : "bg-surface-muted text-muted-foreground"}`}
                >
                  {c.required ? "Required" : "Optional"}
                </span>
              </p>
              <p className="mt-2 font-serif text-2xl font-semibold">{c.cost}</p>
              <p className="text-muted-foreground mt-1 text-sm">{c.note}</p>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-3 text-sm">
          Other companies set their own prices, which may change. Check their sites before you sign
          up.
        </p>
      </section>

      {(testimonials.length > 0 || ratingSummary) && (
        <section className="container-page pb-16 sm:pb-24">
          <div className="mx-auto max-w-3xl">
            <CourseTestimonials items={testimonials} summary={ratingSummary} />
          </div>
        </section>
      )}

      {course.faq.length > 0 && (
        <section aria-labelledby="faq-title" className="container-page pb-16 sm:pb-24">
          <Title id="faq-title" eyebrow="Questions" title="Before you join" />
          <div className="mt-8">
            <Faq items={course.faq} />
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ FINAL CTA */}
      <section
        aria-labelledby="final-title"
        className="text-white"
        style={{
          background: `radial-gradient(900px 400px at 50% 0%, ${accent}77, transparent 70%), ${INK}`,
        }}
      >
        <div className="container-narrow py-16 text-center sm:py-24">
          <h2 id="final-title" className="text-3xl leading-tight font-semibold sm:text-5xl">
            {offer.finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">{offer.finalCta.body}</p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-[#f2a7c9] text-[#1b1026] hover:bg-[#f2a7c9]/90"
          >
            <Link href="#enroll">
              Get the workshop · {formatUsd(course.price_cents)} <ArrowRight aria-hidden />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-white/65">
            {percentOff(course.list_price_cents, course.price_cents) > 0 &&
              `${percentOff(course.list_price_cents, course.price_cents)}% off the usual ${formatUsd(course.list_price_cents ?? 0)} · `}
            One-time payment · Claude Pro required separately
            {course.has_guarantee ? "" : " · no refund guarantee"}
          </p>
        </div>
      </section>
    </div>
  );
}
