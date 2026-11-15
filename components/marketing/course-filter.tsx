"use client";
import { useMemo, useState } from "react";
import type { Course } from "@/lib/types";
import { CourseCard } from "./course-card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export function CourseFilter({ courses }: { courses: Course[] }) {
  const categories = useMemo(() => ["All", ...new Set(courses.map((c) => c.category))], [courses]);
  const [active, setActive] = useState("All");
  const visible = active === "All" ? courses : courses.filter((c) => c.category === active);

  if (courses.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState emoji="📚" title="Courses are on their way">
          New courses are being prepared. Check back soon.
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <div
        className="-mx-5 mt-7 flex gap-2 overflow-x-auto px-5 pb-1"
        role="group"
        aria-label="Filter by category"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            aria-pressed={active === cat}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-foreground hover:bg-surface-muted",
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </>
  );
}
