import { ShieldCheck, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefundButton } from "@/components/dashboard/refund-button";
import { formatDateLong } from "@/lib/course-days";
import { formatUsd } from "@/lib/pricing";
import type { EnrollmentView } from "@/lib/queries/learning";
import { plural } from "@/lib/utils";

/**
 * The guarantee, spelled out on the course page: a Claim refund button that
 * stays disabled until the course is complete, with where the learner stands
 * (eligible or not, grace days left, when the button unlocks).
 */
export function RefundPanel({ view }: { view: EnrollmentView }) {
  const { progress, enrollment, course } = view;
  const missed = progress.missedDays.length;
  const deadline = progress.refundDeadline ? formatDateLong(progress.refundDeadline) : null;

  if (enrollment.status === "refunded") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="neutral">Refunded</Badge>
        <span className="text-muted-foreground">Your journal stays available to read.</span>
      </div>
    );
  }
  if (!progress.isPaid) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="info">Free access</Badge>
        <span className="text-muted-foreground">
          Nothing was paid, so there is nothing to refund.
        </span>
      </div>
    );
  }

  const eligible = progress.refundEligible;
  const onTrack = progress.onTrackForRefund;
  const windowClosed = onTrack && progress.isComplete && !eligible;

  const rows: { label: string; value: string }[] = [
    {
      label: "Status",
      value: eligible
        ? "Eligible now"
        : windowClosed
          ? "Refund window has closed"
          : onTrack
            ? "On track — not claimable yet"
            : "Not eligible",
    },
    {
      label: "Grace days",
      value:
        enrollment.grace_days > 0
          ? `${progress.graceLeft} left of ${enrollment.grace_days}${missed > 0 ? ` (${plural(missed, "day")} missed)` : ""}`
          : missed > 0
            ? `None on this course (${plural(missed, "day")} missed)`
            : "None on this course — respond every day",
    },
    { label: "Refund amount", value: formatUsd(enrollment.amount_paid_cents) },
  ];

  let note: string;
  if (eligible) {
    note = `You did the work. If you're not happy, claim your refund${deadline ? ` any time until ${deadline}` : ""} — no questions asked.`;
  } else if (windowClosed) {
    note = progress.refundIneligibleReason ?? "The refund window has closed.";
  } else if (onTrack) {
    note = `The button becomes active once you complete Day ${course.days}${deadline ? `, and stays open until ${deadline}` : ""}.`;
  } else {
    note = `${progress.refundIneligibleReason ?? "Too many days were missed"}. You can still finish the course.`;
  }

  return (
    <section
      aria-labelledby="refund-title"
      className="border-border bg-surface-muted/50 rounded-xl border p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h2
          id="refund-title"
          className="flex items-center gap-2 font-sans text-sm font-semibold tracking-normal"
        >
          {onTrack ? (
            <ShieldCheck className="text-success size-4" aria-hidden />
          ) : (
            <ShieldX className="text-muted-foreground size-4" aria-hidden />
          )}
          Refund guarantee
        </h2>
        {eligible ? (
          <RefundButton
            enrollmentId={enrollment.id}
            courseName={course.name}
            amountCents={enrollment.amount_paid_cents}
            deadline={deadline}
          />
        ) : (
          <Button variant="outline" size="sm" disabled aria-describedby="refund-note">
            Claim refund
          </Button>
        )}
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="text-right font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p id="refund-note" className="text-muted-foreground mt-3 text-sm">
        {note}
      </p>
    </section>
  );
}
