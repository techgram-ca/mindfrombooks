import type { ReactNode } from "react";

export function Prose({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <article className="container-narrow py-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
      {intro && <p className="text-muted-foreground mt-4 text-lg">{intro}</p>}
      <div className="text-foreground/90 [&_a]:text-accent-strong mt-8 space-y-5 leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_li]:mt-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}

export function DraftNotice() {
  return (
    <p
      role="note"
      className="border-accent/40 bg-accent-soft text-accent-strong rounded-2xl border px-4 py-3 text-sm"
    >
      Placeholder text — replace with your final, lawyer-reviewed wording before launch.
    </p>
  );
}
