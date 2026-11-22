import "server-only";
import { sendEmail } from "@/lib/email";
import { formatUsd } from "@/lib/pricing";
import { plural, siteUrl } from "@/lib/utils";

interface Recipient {
  id: string;
  email: string;
  name: string;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}

export function sendWelcomeEmail(input: {
  user: Recipient;
  productName: string;
  days: number;
  isBundle: boolean;
  paid: boolean;
  graceDays: number;
  path: string;
  /** Self-paced workshop: everything is open now. */
  selfPaced?: boolean;
  hasGuarantee?: boolean;
  /** Set for an account created by this purchase: a link to choose a password. */
  setPasswordUrl?: string | null;
}) {
  const rule =
    input.graceDays > 0
      ? `respond on every day (you can miss up to ${plural(input.graceDays, "day")})`
      : "respond on every single day";
  return sendEmail({
    to: input.user.email,
    userId: input.user.id,
    templateKey: "welcome",
    vars: {
      name: firstName(input.user.name),
      course_name: input.productName,
      days: input.days,
      course_line: input.selfPaced
        ? `${input.days} lessons, at your own pace.`
        : `${input.days} days, one small action a day.`,
      start_line: input.selfPaced
        ? "**Everything is unlocked.** Start with Lesson 1 whenever you're ready."
        : `**${
            input.isBundle
              ? "You choose when each course starts — tap Start on your dashboard and Day 1 opens the next morning."
              : "Day 1 opens tomorrow morning, at midnight your time."
          }** Each day you get one task and answer one question. A day's task closes at 11:59 pm your time, so try to do it early.`,
      guarantee_line:
        input.hasGuarantee === false
          ? "If you get stuck on a step, message @mindfrombooks on Instagram."
          : input.paid
            ? `Remember the guarantee: ${rule}, and if you're not happy at the end you get a one-click refund.`
            : "Show up every day — it's the only rule.",
      account_line: input.setPasswordUrl
        ? `We created your account with this email. [Choose your password](${input.setPasswordUrl}) so you can log in on any device.`
        : "",
    },
    buttonUrl: siteUrl(input.path),
  });
}

export function sendRefundEmail(input: {
  user: Recipient;
  courseName: string;
  amountCents: number;
}) {
  return sendEmail({
    to: input.user.email,
    userId: input.user.id,
    templateKey: "refund_confirmation",
    vars: {
      name: firstName(input.user.name),
      course_name: input.courseName,
      amount: formatUsd(input.amountCents),
    },
    buttonUrl: siteUrl("/dashboard/purchases"),
  });
}

export function sendCourseCompleteEmail(input: {
  user: Recipient;
  enrollmentId: string;
  courseName: string;
  courseSlug: string;
  days: number;
  responded: number;
  refundEligible: boolean;
  refundDeadline: string | null;
  nextCourseName: string | null;
}) {
  return sendEmail({
    to: input.user.email,
    userId: input.user.id,
    templateKey: "course_complete",
    enrollmentId: input.enrollmentId,
    vars: {
      name: firstName(input.user.name),
      course_name: input.courseName,
      days: input.days,
      responded: input.responded,
      refund_line: input.refundEligible
        ? `You did the work, so the guarantee is yours: if you're not happy, [get a one-click refund](${siteUrl("/dashboard/purchases")})${input.refundDeadline ? ` any time before ${input.refundDeadline}` : ""}. No questions asked.`
        : "Thank you for showing up.",
      next_course_line: input.nextCourseName
        ? `**${input.nextCourseName}** is a good next step — [browse the courses](${siteUrl("/courses")}).`
        : `[Browse the courses](${siteUrl("/courses")}).`,
    },
    buttonUrl: siteUrl(`/dashboard/courses/${input.courseSlug}/complete`),
  });
}

export function sendAdminInviteEmail(input: {
  user: Recipient;
  courseNames: string[];
  actionUrl: string;
}) {
  return sendEmail({
    to: input.user.email,
    userId: input.user.id,
    templateKey: "admin_invite",
    vars: {
      name: firstName(input.user.name),
      courses: input.courseNames.join(", ") || "mindfrombooks",
    },
    buttonUrl: input.actionUrl,
  });
}
