import { ShieldCheck, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RefundButton } from "@/components/dashboard/refund-button";
import { formatDateLong } from "@/lib/course-days";
import type { EnrollmentView } from "@/lib/queries/learning";
import { plural } from "@/lib/utils";

/** One honest line about where this enrollment stands with the guarantee. */
export function RefundStatus({
  view,
  showButton = true,
}: {
  view: EnrollmentView;
  showButton?: boolean;
}) {
  const { progress, enrollment, course } = view;
  const deadline = progress.refundDeadline ? formatDateLong(progress.refundDeadline) : null;

  if (enrollment.status === "refunded") return <Badge variant="neutral">Refunded</Badge>;
  if (enrollment.status === "revoked") return <Badge variant="danger">Access revoked</Badge>;
  if (!course.has_guarantee) return <Badge variant="neutral">No refund guarantee</Badge>;
  if (!progress.isPaid) return <Badge variant="info">Free access</Badge>;

  if (progress.refundEligible) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-success inline-flex items-center gap-1.5 text-sm font-medium">
          <ShieldCheck className="size-4" aria-hidden />
          Refund available{deadline ? ` until ${deadline}` : ""}
        </span>
        {showButton && (
          <RefundButton
            enrollmentId={enrollment.id}
            courseName={course.name}
            amountCents={enrollment.amount_paid_cents}
            deadline={deadline}
          />
        )}
      </div>
    );
  }

  if (progress.onTrackForRefund && !progress.isComplete) {
    return (
      <span className="text-success inline-flex items-start gap-1.5 text-sm">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          On track for the refund guarantee
          {enrollment.grace_days > 0
            ? ` — ${plural(progress.graceLeft, "grace day")} left of ${enrollment.grace_days}`
            : " — respond every day to keep it"}
        </span>
      </span>
    );
  }

  return (
    <span className="text-muted-foreground inline-flex items-start gap-1.5 text-sm">
      <ShieldX className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>Refund not available: {progress.refundIneligibleReason}</span>
    </span>
  );
}
