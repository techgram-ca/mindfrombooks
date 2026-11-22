import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Check, Clapperboard, Info, PlayCircle, Sparkles, X } from "lucide-react";
import { EnrollPanel } from "@/components/marketing/enroll-panel";
import { Faq } from "@/components/marketing/faq";
import { CourseTestimonials } from "@/components/marketing/testimonials";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkshopOfferContent } from "@/lib/offers";
import type { OutlineItem, RatingSummary, Testimonial } from "@/lib/queries/catalog";
import { formatUsd } from "@/lib/pricing";
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

  return (
    <div className="pb-24 md:pb-0">
      {/* ------------------------------------------------------------ HERO */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background: `radial-gradient(1000px 480px at 90% -10%, ${accent}66, transparent 60%), radial-gradient(700px 380px at -10% 110%, #4b2a8a55, transparent 60%), ${INK}`,
        }}
      >
        <div className="container-page grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr] md:gap-x-10 md:gap-y-0 md:py-20">
          <div className="md:col-start-1 md:row-start-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white/85">
              <Clapperboard className="size-4" aria-hidden /> {offer.eyebrow}
            </p>
            <h1 className="mt-5 text-[2.3rem] leading-[1.06] font-semibold sm:text-6xl">
              {offer.headline.map((line, i) => (
                <span
                  key={line}
                  className={
                    i === offer.headline.length - 1 ? "mt-1 block text-[#f2a7c9]" : "block"
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
                  note="Every lesson unlocks the moment you pay. No account needed to pay."
                  guarantee={course.has_guarantee}
                />
              </Suspense>
            </div>
            {course.notice && (
              <p className="mt-4 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/85">
                <Info className="mt-0.5 size-5 shrink-0 text-[#f2a7c9]" aria-hidden />
                <span>
                  <strong className="text-white">Also needed:</strong> {course.notice}{" "}
                  <a href="#costs" className="underline underline-offset-2">
                    See all costs
                  </a>
                </span>
              </p>
            )}
            {!course.has_guarantee && (
              <p className="mt-3 text-center text-xs text-white/60">
                One-time purchase · no refund guarantee on this workshop
              </p>
            )}
          </div>

          <div className="md:col-start-1 md:row-start-2">
            <ul className="grid gap-2.5 sm:grid-cols-2 md:mt-6">
              {offer.heroPoints.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[15px] text-white/90">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f2a7c9] text-[#1b1026]">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-center">
              {[
                { k: "lessons", v: String(course.days) },
                { k: "modules", v: String(phases.length || 3) },
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

      {/* ------------------------------------------------------------ STORY */}
      <section aria-labelledby="story-title" className="container-page -mt-6 md:-mt-10">
        <div className="shadow-lift rounded-3xl border border-[#e9c6d7] bg-white p-6 sm:p-10">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold tracking-[0.12em] text-[#8f2659] uppercase">
                The story
              </p>
              <h2
                id="story-title"
                className="mt-2 text-3xl leading-tight font-semibold sm:text-4xl"
              >
                {offer.story.title}
              </h2>
            </div>
            <div className="text-foreground/85 space-y-4 text-[17px] leading-relaxed">
              {offer.story.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className="text-foreground font-serif text-lg font-semibold">
                {offer.story.signoff}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ PAINS */}
      <section aria-labelledby="pains-title" className="container-page py-16 sm:py-24">
        <Title
          id="pains-title"
          eyebrow="Sound familiar?"
          title="You know Reels grow accounts. Making them is the problem."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offer.pains.map((p) => (
            <div key={p.title} className="border-border bg-surface rounded-3xl border p-5">
              <p className="font-serif text-lg font-semibold">{p.title}</p>
              <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ OUTCOMES */}
      <section aria-labelledby="outcomes-title" className="text-white" style={{ background: INK }}>
        <div className="container-page py-16 sm:py-24">
          <Title
            id="outcomes-title"
            light
            eyebrow="What you walk away with"
            title="A studio that makes videos when you describe them"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offer.outcomes.map((o) => (
              <div key={o.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <Sparkles className="size-5 text-[#f2a7c9]" aria-hidden />
                <p className="mt-3 font-serif text-xl font-semibold">{o.title}</p>
                <p className="mt-2 leading-relaxed text-white/75">{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ CURRICULUM */}
      <section aria-labelledby="curriculum-title" className="container-page py-16 sm:py-24">
        <Title
          id="curriculum-title"
          eyebrow="Everything inside"
          title={`${course.days} lessons. All open the moment you join.`}
          intro="Each lesson has a short explainer video, numbered steps and copy-paste prompts and commands for Windows, Mac and Linux."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {phases.map((ph, idx) => (
            <div key={ph.id} className="border-border bg-surface rounded-3xl border p-6">
              <p className="text-xs font-semibold tracking-wider text-[#8f2659] uppercase">
                Module {idx + 1} · Lessons {ph.start_day}–{ph.end_day}
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold">{ph.name}</p>
              <ol className="mt-4 space-y-2.5">
                {Array.from({ length: ph.end_day - ph.start_day + 1 }, (_, i) => ph.start_day + i)
                  .filter((n) => titleOf.has(n))
                  .map((n) => (
                    <li key={n} className="flex items-start gap-3 text-[15px]">
                      <PlayCircle
                        className="mt-0.5 size-4 shrink-0"
                        style={{ color: accent }}
                        aria-hidden
                      />
                      <span>
                        <span className="text-muted-foreground mr-1.5 text-xs font-semibold">
                          {n}.
                        </span>
                        {titleOf.get(n)}
                      </span>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ PEEK */}
      <section aria-labelledby="peek-title" className="bg-surface-muted">
        <div className="container-page grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Title
            id="peek-title"
            eyebrow="A real prompt from the course"
            title="You describe it. Claude makes it."
            intro="This is the whole “editing” step for your first video. You read the script it proposes, say go, and get a finished file."
          />
          <div className="shadow-lift overflow-hidden rounded-3xl border border-[#2a1f38] bg-[#14101c]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
              <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden />
              <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden />
              <span className="ml-2 text-xs text-white/60">{offer.peek.label}</span>
            </div>
            <pre className="overflow-x-auto px-5 py-4 text-[13px] leading-relaxed whitespace-pre-wrap text-[#e9e4f2]">
              {offer.peek.prompt}
            </pre>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ SYSTEM */}
      <section aria-labelledby="system-title" className="container-page py-16 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <Title
            id="system-title"
            eyebrow="Module 3"
            title={offer.system.title}
            intro="The part most courses skip: what to do after the video is made."
          />
          <ul className="border-border bg-surface divide-y rounded-3xl border">
            {offer.system.points.map((p) => (
              <li key={p} className="flex items-start gap-3 px-5 py-4">
                <Check className="mt-0.5 size-5 shrink-0" style={{ color: accent }} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ COSTS */}
      <section
        id="costs"
        aria-labelledby="costs-title"
        className="container-page scroll-mt-24 pb-16 sm:pb-24"
      >
        <Title id="costs-title" eyebrow="No surprises" title="Everything it costs" />
        <div className="border-border bg-surface shadow-soft mt-8 overflow-hidden rounded-3xl border">
          <ul className="divide-border divide-y">
            {offer.costs.map((c) => (
              <li
                key={c.item}
                className="grid gap-1 px-5 py-4 sm:grid-cols-[1fr_auto] sm:gap-6 sm:px-6"
              >
                <div>
                  <p className="font-semibold">
                    {c.item}{" "}
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${c.required ? "bg-[#f8e1ec] text-[#8f2659]" : "bg-surface-muted text-muted-foreground"}`}
                    >
                      {c.required ? "Required" : "Optional"}
                    </span>
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">{c.note}</p>
                </div>
                <p className="font-serif text-lg font-semibold sm:text-right">{c.cost}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          Third-party prices are set by those companies and may change; check their sites before you
          sign up.
        </p>
      </section>

      {/* ------------------------------------------------------------ FIT */}
      <section aria-labelledby="fit-title" className="container-page pb-16 sm:pb-24">
        <div className="grid gap-4 md:grid-cols-2">
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
          <h2 id="final-title" className="text-3xl leading-tight font-semibold sm:text-4xl">
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
            One-time payment · Claude Pro required separately
            {course.has_guarantee ? "" : " · no refund guarantee"}
          </p>
        </div>
      </section>
    </div>
  );
}
