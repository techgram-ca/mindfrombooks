import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Course } from "@/lib/types";
import { formatUsd } from "@/lib/pricing";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group rounded-card border-border bg-surface shadow-soft hover:shadow-lift relative flex h-full flex-col overflow-hidden border p-5 transition-shadow"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: course.accent_color }}
      />
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-2xl text-2xl"
          style={{ background: `${course.accent_color}1f` }}
        >
          {course.emoji}
        </span>
        <span className="bg-surface-muted rounded-full px-3 py-1 text-sm font-semibold">
          {course.format === "self_paced" ? `${course.days} lessons` : `${course.days} days`}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold">{course.name}</h3>
      <p className="text-muted-foreground mt-1.5 text-[15px]">{course.short_description}</p>
      <p className="text-foreground/80 mt-3 text-sm">
        <span className="font-semibold" style={{ color: course.accent_color }}>
          {course.format === "self_paced" ? "Self-paced." : `Why ${course.days}?`}
        </span>{" "}
        {course.number_reason}
      </p>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-lg font-semibold">{formatUsd(course.price_cents)}</span>
        <span className="text-accent-strong inline-flex items-center gap-1 text-sm font-medium">
          View course
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
