/**
 * Pure refund-guarantee rules. Mirrors the SQL function enrollment_progress()
 * (supabase/migrations/…_functions.sql). The refund API always re-checks in
 * SQL; this version drives what the UI shows and is unit-tested.
 */
import {
  addDays,
  currentDayNumber,
  daysBetween,
  isPastFinalDay,
  lastDayDate,
  type DateStr,
} from "./course-days";
import type { EnrollmentSource, EnrollmentStatus } from "./types";

export interface ProgressInput {
  status: EnrollmentStatus;
  source: EnrollmentSource;
  amountPaidCents: number;
  startDate: DateStr | null;
  /** Missed days allowed, fixed when the course was bought. */
  graceDays: number;
  totalDays: number;
  respondedDays: Iterable<number>;
  today: DateStr;
  refundWindowDays: number;
  /** Self-paced workshops count ticked lessons; there are no days to miss. */
  format?: "daily" | "self_paced";
  /** False for courses sold without the refund guarantee. */
  hasGuarantee?: boolean;
}

export interface Progress {
  currentDay: number;
  totalDays: number;
  respondedCount: number;
  missedDays: number[];
  remainingDays: number;
  graceDays: number;
  graceLeft: number;
  /** The course is over for this learner (final day passed or answered). */
  isComplete: boolean;
  /** Still able to earn the refund guarantee (paid, and misses within grace). */
  onTrackForRefund: boolean;
  refundEligible: boolean;
  refundIneligibleReason: string | null;
  refundDeadline: DateStr | null;
  isPaid: boolean;
}

export function isPaidSource(source: EnrollmentSource, amountPaidCents: number): boolean {
  return (source === "stripe" || source === "bundle") && amountPaidCents > 0;
}

export function computeProgress(input: ProgressInput): Progress {
  if (input.format === "self_paced") return computeWorkshopProgress(input);
  const { startDate, today, totalDays, graceDays } = input;
  const responded = new Set([...input.respondedDays].filter((d) => d >= 1 && d <= totalDays));
  const currentDay = currentDayNumber(startDate, today, totalDays);

  const missedDays: number[] = [];
  let isComplete = false;
  let refundDeadline: DateStr | null = null;

  if (startDate) {
    const raw = daysBetween(startDate, today) + 1;
    const lastElapsed = Math.min(raw - 1, totalDays); // days strictly before today
    for (let d = 1; d <= lastElapsed; d += 1) {
      if (!responded.has(d)) missedDays.push(d);
    }
    isComplete = isPastFinalDay(startDate, today, totalDays) || responded.has(totalDays);
    refundDeadline = addDays(lastDayDate(startDate, totalDays), input.refundWindowDays);
  }

  const isPaid = isPaidSource(input.source, input.amountPaidCents);
  const missed = missedDays.length;
  let reason: string | null = null;
  let eligible = false;

  if (input.status === "refunded") {
    reason = "Already refunded";
  } else if (input.status === "revoked") {
    reason = "Access revoked";
  } else if (input.hasGuarantee === false) {
    reason = "No refund guarantee on this course";
  } else if (!isPaid) {
    reason = "Free access";
  } else if (!startDate) {
    reason = "Course not started yet";
  } else if (missed > graceDays) {
    reason =
      `Missed ${missed} ${missed === 1 ? "day" : "days"} (${missedDays.map((d) => `Day ${d}`).join(", ")})` +
      (graceDays > 0 ? ` — up to ${graceDays} allowed` : "");
  } else if (!isComplete) {
    reason = `Available once you finish Day ${totalDays}`;
  } else if (refundDeadline && daysBetween(refundDeadline, today) > 0) {
    reason = `Refund window closed on ${refundDeadline}`;
  } else {
    eligible = true;
  }

  const upcoming = startDate ? Math.max(0, totalDays - Math.max(currentDay, 0)) : totalDays;
  const todayOpen = currentDay >= 1 && !isComplete && !responded.has(currentDay) ? 1 : 0;

  return {
    currentDay,
    totalDays,
    respondedCount: responded.size,
    missedDays,
    remainingDays: isComplete ? 0 : upcoming + todayOpen,
    graceDays,
    graceLeft: Math.max(0, graceDays - missed),
    isComplete,
    onTrackForRefund:
      isPaid &&
      input.hasGuarantee !== false &&
      input.status !== "refunded" &&
      input.status !== "revoked" &&
      missed <= graceDays,
    refundEligible: eligible,
    refundIneligibleReason: reason,
    refundDeadline,
    isPaid,
  };
}

/** Self-paced workshop: progress is lessons ticked; no missed days, no guarantee. */
function computeWorkshopProgress(input: ProgressInput): Progress {
  const done = new Set([...input.respondedDays].filter((d) => d >= 1 && d <= input.totalDays));
  const isPaid = isPaidSource(input.source, input.amountPaidCents);
  return {
    currentDay: done.size,
    totalDays: input.totalDays,
    respondedCount: done.size,
    missedDays: [],
    remainingDays: input.totalDays - done.size,
    graceDays: 0,
    graceLeft: 0,
    isComplete: done.size >= input.totalDays,
    onTrackForRefund: false,
    refundEligible: false,
    refundIneligibleReason:
      input.status === "refunded"
        ? "Already refunded"
        : input.status === "revoked"
          ? "Access revoked"
          : "No refund guarantee on this course",
    refundDeadline: null,
    isPaid,
  };
}
