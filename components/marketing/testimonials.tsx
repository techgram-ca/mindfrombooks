import type { RatingSummary, Testimonial } from "@/lib/queries/catalog";
import { Stars } from "@/components/shared/stars";
import { cn } from "@/lib/utils";

function Quote({ t, compact }: { t: Testimonial; compact?: boolean }) {
  const max = compact ? 260 : 320;
  return (
    <figure className="rounded-card border-border bg-surface shadow-soft flex flex-col border p-5">
      {(t.stars != null || t.isSample) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          {t.stars != null ? <Stars value={t.stars} /> : <span />}
          {t.isSample && (
            <span
              className="border-danger/50 text-danger rounded-full border border-dashed px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
              title="Placeholder for previewing the layout. Never shown on the live site."
            >
              Sample
            </span>
          )}
        </div>
      )}
      <blockquote className="text-foreground/90 text-[15px] leading-relaxed">
        “{t.body.length > max ? `${t.body.slice(0, max).trimEnd()}…` : t.body}”
      </blockquote>
      <figcaption className="mt-4 text-sm">
        <span className="font-semibold">{t.name}</span>
        {t.country && <span className="text-muted-foreground">, {t.country}</span>}
        {!compact && (
          <span className="text-muted-foreground block">
            {t.courseEmoji} {t.courseName}
            {t.dayNumber != null && ` · Day ${t.dayNumber}`}
          </span>
        )}
        {compact && t.dayNumber != null && (
          <span className="text-muted-foreground block">Day {t.dayNumber}</span>
        )}
      </figcaption>
    </figure>
  );
}

/** Grid of testimonials across courses (home page). */
export function Testimonials({ items, title }: { items: Testimonial[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="testimonials-title">
      <h2 id="testimonials-title" className="text-2xl font-semibold sm:text-3xl">
        {title ?? "What people wrote after doing the work"}
      </h2>
      <p className="text-muted-foreground mt-2">From learners, shared with their permission.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <Quote key={t.id} t={t} />
        ))}
      </div>
    </section>
  );
}

/** Vertical column for one course, shown under the enroll box. */
export function CourseTestimonials({
  items,
  summary,
  className,
}: {
  items: Testimonial[];
  summary: RatingSummary | null;
  className?: string;
}) {
  if (items.length === 0 && !summary) return null;
  return (
    <section aria-labelledby="course-testimonials-title" className={cn("space-y-4", className)}>
      <div>
        <h2 id="course-testimonials-title" className="text-xl font-semibold">
          What learners say
        </h2>
        {summary && (
          <p className="mt-1.5 flex items-center gap-2 text-sm">
            <Stars value={summary.average} />
            <span className="font-semibold">{summary.average.toFixed(1)}</span>
            <span className="text-muted-foreground">from {summary.count} people who finished</span>
          </p>
        )}
      </div>
      {items.map((t) => (
        <Quote key={t.id} t={t} compact />
      ))}
      {items.length > 0 && (
        <p className="text-muted-foreground text-xs">
          {items.some((t) => t.isSample)
            ? "Includes sample quotes for previewing the layout. They never appear on the live site."
            : "Shared with each learner's permission."}
        </p>
      )}
    </section>
  );
}
