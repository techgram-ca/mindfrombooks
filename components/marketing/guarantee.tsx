import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { plural } from "@/lib/utils";

export function guaranteeRule(graceDays: number): string {
  return graceDays > 0
    ? `Respond on every day of the course — you can miss up to ${plural(graceDays, "day")}.`
    : "Respond on every single day of the course.";
}

export function GuaranteeBanner({
  graceDays = 0,
  windowDays = 14,
  compact = false,
}: {
  graceDays?: number;
  windowDays?: number;
  compact?: boolean;
}) {
  return (
    <section
      aria-labelledby="guarantee-title"
      className="rounded-card border-success/25 bg-success-soft border p-5 sm:p-7"
    >
      <div className="flex items-start gap-4">
        <span className="bg-success flex size-11 shrink-0 items-center justify-center rounded-full text-white">
          <ShieldCheck className="size-5" aria-hidden />
        </span>
        <div>
          <h2 id="guarantee-title" className="text-xl font-semibold sm:text-2xl">
            Do the work. If you&apos;re not happy, get your money back.
          </h2>
          <p className="text-foreground/80 mt-2 text-[15px] leading-relaxed">
            {guaranteeRule(graceDays)} If you finish and still aren&apos;t happy, tap one button
            within {windowDays} days and you&apos;re refunded automatically. No forms, no emails, no
            questions.
          </p>
          {!compact && (
            <Link
              href="/guarantee"
              className="text-success mt-3 inline-block text-sm font-medium underline underline-offset-4"
            >
              Read the full guarantee
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
