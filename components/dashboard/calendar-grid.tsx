import Link from "next/link";
import { Check, Circle, Lock } from "lucide-react";
import { dayStatus, type DayStatus } from "@/lib/course-days";
import type { EnrollmentView } from "@/lib/queries/learning";
import { cn } from "@/lib/utils";

const styles: Record<DayStatus, string> = {
  done: "bg-success-soft text-success border-success/20",
  missed: "bg-danger-soft text-danger border-danger/20",
  today: "bg-info text-white border-info shadow-soft",
  locked: "bg-surface-muted text-muted-foreground border-transparent",
};
const labels: Record<DayStatus, string> = {
  done: "done",
  missed: "missed",
  today: "today",
  locked: "locked",
};

function Icon({ status }: { status: DayStatus }) {
  if (status === "done") return <Check className="size-3.5" aria-hidden />;
  if (status === "missed") return <Circle className="size-3" aria-hidden />;
  if (status === "today") return <span className="size-2 rounded-full bg-white" aria-hidden />;
  return <Lock className="size-3" aria-hidden />;
}

export function CalendarGrid({
  view,
  titles,
}: {
  view: EnrollmentView;
  titles: Map<number, string>;
}) {
  const { course, enrollment, responded, today } = view;
  const days = Array.from({ length: course.days }, (_, i) => i + 1);
  return (
    <div>
      <ol className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((n) => {
          const status = dayStatus(n, enrollment.start_date, today, course.days, responded);
          const cell = (
            <span
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border text-xs font-semibold",
                styles[status],
              )}
            >
              <Icon status={status} />
              {n}
            </span>
          );
          const label = `Day ${n}, ${labels[status]}${titles.get(n) ? `: ${titles.get(n)}` : ""}`;
          return (
            <li key={n}>
              {status === "locked" ? (
                <span aria-label={label} title={titles.get(n)}>
                  {cell}
                </span>
              ) : (
                <Link
                  href={`/dashboard/courses/${course.slug}/day/${n}`}
                  aria-label={label}
                  className="block rounded-xl"
                >
                  {cell}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <ul className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-hidden>
        <li>✅ Done</li>
        <li>⭕ Missed</li>
        <li>🔵 Today</li>
        <li>🔒 Locked</li>
      </ul>
    </div>
  );
}
