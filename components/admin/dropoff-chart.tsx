"use client";
import { useState } from "react";

export interface DropoffPoint {
  day: number;
  title: string | null;
  reached: number;
  responded: number;
}

/**
 * Response rate per day: of the learners whose Day N has closed, the share who
 * responded. One series, one hue; hover or focus a bar for the exact numbers.
 * The table underneath is the accessible view of the same data.
 */
export function DropoffChart({ points, color }: { points: DropoffPoint[]; color: string }) {
  const [active, setActive] = useState<number | null>(null);
  const rate = (p: DropoffPoint) => (p.reached > 0 ? p.responded / p.reached : null);
  const current = active != null ? points.find((p) => p.day === active) : null;
  const ticks = [100, 75, 50, 25, 0];
  const labelEvery = points.length > 45 ? 10 : points.length > 20 ? 5 : points.length > 10 ? 2 : 1;

  return (
    <figure>
      <div className="flex h-6 items-center text-sm" aria-live="polite">
        {current ? (
          <span>
            <span className="font-semibold">Day {current.day}</span>
            {current.title ? ` · ${current.title}` : ""} —{" "}
            {rate(current) == null
              ? "no learners have reached this day yet"
              : `${Math.round((rate(current) as number) * 100)}% responded (${current.responded} of ${current.reached})`}
          </span>
        ) : (
          <span className="text-muted-foreground">Hover or tap a bar for details.</span>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <div
          className="text-muted-foreground flex h-56 flex-col justify-between text-right text-xs"
          aria-hidden
        >
          {ticks.map((t) => (
            <span key={t} className="leading-none">
              {t}%
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="relative h-56" style={{ minWidth: `${points.length * 10}px` }}>
            <div className="absolute inset-0 flex flex-col justify-between" aria-hidden>
              {ticks.map((t) => (
                <span key={t} className="border-border/70 border-t" />
              ))}
            </div>
            <div className="absolute inset-0 flex items-end gap-[2px]" role="list">
              {points.map((p) => {
                const r = rate(p);
                return (
                  <button
                    key={p.day}
                    type="button"
                    role="listitem"
                    aria-label={`Day ${p.day}: ${r == null ? "no data" : `${Math.round(r * 100)}% responded, ${p.responded} of ${p.reached}`}`}
                    className="group flex h-full min-w-0 flex-1 items-end focus-visible:outline-offset-0"
                    onMouseEnter={() => setActive(p.day)}
                    onFocus={() => setActive(p.day)}
                    onMouseLeave={() => setActive(null)}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive(p.day)}
                  >
                    <span
                      className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-100"
                      style={{
                        height: r == null ? "2px" : `${Math.max(r * 100, 1)}%`,
                        background: r == null ? "var(--border)" : color,
                        opacity: active == null || active === p.day ? 1 : 0.45,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div
            className="text-muted-foreground mt-1 flex gap-[2px] text-[10px]"
            style={{ minWidth: `${points.length * 10}px` }}
            aria-hidden
          >
            {points.map((p) => (
              <span key={p.day} className="min-w-0 flex-1 text-center">
                {p.day === 1 || p.day % labelEvery === 0 ? p.day : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="text-muted-foreground mt-2 text-xs">
        Day of course → share of learners who responded, among those whose day has closed.
      </figcaption>
    </figure>
  );
}
