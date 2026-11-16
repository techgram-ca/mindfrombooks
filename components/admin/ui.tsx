import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-card border-border bg-surface shadow-soft border p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold">{value}</p>
      {hint && <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>}
    </div>
  );
}

/** Scrolls sideways on phones instead of breaking the page. */
export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-card border-border bg-surface shadow-soft overflow-x-auto border",
        className,
      )}
    >
      <table className="[&_td]:border-border [&_th]:text-muted-foreground w-full min-w-[36rem] border-collapse text-left text-sm [&_td]:border-t [&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wide [&_th]:whitespace-nowrap [&_th]:uppercase">
        {children}
      </table>
    </div>
  );
}

export function Section({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function pct(part: number, whole: number): string {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeZone: "America/Toronto",
  }).format(new Date(iso));
}

/** Shown at the top of an admin page when a report query failed. */
export function ReportProblems({ problems }: { problems: string[] }) {
  if (problems.length === 0) return null;
  return (
    <div
      role="alert"
      className="rounded-card border-danger/30 bg-danger-soft mb-6 border p-4 text-sm"
    >
      <p className="text-danger font-semibold">Some numbers couldn&apos;t be loaded</p>
      <ul className="text-foreground/80 mt-2 list-disc space-y-1 pl-5 font-mono text-xs break-words">
        {problems.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <p className="text-foreground/80 mt-3">
        This usually means the last migration hasn&apos;t been run. In the Supabase SQL editor, run{" "}
        <code>supabase/migrations/20261115000005_admin_stats.sql</code>, then run{" "}
        <code>notify pgrst, &apos;reload schema&apos;;</code> and refresh this page.
      </p>
    </div>
  );
}
