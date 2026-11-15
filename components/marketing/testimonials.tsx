import type { Testimonial } from "@/lib/queries/catalog";

export function Testimonials({ items, title }: { items: Testimonial[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="testimonials-title">
      <h2 id="testimonials-title" className="text-2xl font-semibold sm:text-3xl">
        {title ?? "What people wrote after doing the work"}
      </h2>
      <p className="text-muted-foreground mt-2">
        Real responses from learners, shared with permission.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <figure
            key={t.id}
            className="rounded-card border-border bg-surface shadow-soft flex flex-col border p-5"
          >
            <blockquote className="text-foreground/90 text-[15px] leading-relaxed">
              “{t.body.length > 320 ? `${t.body.slice(0, 320).trimEnd()}…` : t.body}”
            </blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-semibold">{t.name}</span>
              <span className="text-muted-foreground block">
                {t.courseEmoji} {t.courseName} · Day {t.dayNumber}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
