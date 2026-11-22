import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Prose } from "@/components/marketing/prose";
import { getSettings } from "@/lib/queries/catalog";

export const metadata: Metadata = {
  title: "The one-click refund guarantee",
  description:
    "Respond on every day of your course. If you finish and aren't happy, get an automatic refund with one click. No questions asked.",
  alternates: { canonical: "/guarantee" },
};

export default async function GuaranteePage() {
  const { refund_window_days: windowDays } = await getSettings();
  return (
    <Prose
      title="Do the work. Not happy? One-click refund."
      intro="We only win if the course changes something for you. So the deal is simple."
    >
      <h2>The rule</h2>
      <p>
        <strong>Respond on every day of your course.</strong> If you reach the end and you&apos;re
        not happy for any reason, you get your money back. You press one button. The refund is
        automatic. Nobody asks why.
      </p>

      <h2>How it works</h2>
      <ol>
        <li>Enroll in a course. Day 1 opens the next morning in your timezone.</li>
        <li>Each day, do the task and submit your written response before 11:59 pm.</li>
        <li>
          When you&apos;ve finished the final day, a <strong>Refund</strong> button appears on your
          Purchases page and on the course completion screen.
        </li>
        <li>
          Tap it within <strong>{windowDays} days</strong> of the final day. We refund the full
          amount you paid for that course to your original payment method.
        </li>
      </ol>

      <h2>The fine print, in plain words</h2>
      <ul>
        <li>
          <strong>Daily-action courses only.</strong> Self-paced workshops, which open in full the
          moment you buy, are not covered. Their course page and checkout say so clearly.
        </li>
        <li>
          <strong>Every day counts.</strong> A day&apos;s task is only open on that day. If you miss
          it, it can&apos;t be redone, and the guarantee no longer applies to that course — unless
          the course allows some missed days.
        </li>
        <li>
          <strong>Grace days.</strong> Some courses let you miss a small number of days and still
          keep the guarantee. If a course has grace days, its page says how many. The number that
          applies to you is the one shown when you bought the course — it won&apos;t change later.
        </li>
        <li>
          <strong>You always know where you stand.</strong> Your course page shows whether
          you&apos;re still on track for the guarantee, and exactly which days were missed if not.
        </li>
        <li>
          <strong>All Access.</strong> Each course in the bundle is covered on its own. Complete a
          course and you can refund that course for an equal share of what you paid for the bundle.
        </li>
        <li>
          <strong>Free access isn&apos;t refundable.</strong> If you got a course for free (a gift,
          a giveaway or a 100% code), there&apos;s nothing to refund.
        </li>
        <li>
          <strong>You keep your journal.</strong> After a refund you can still read everything you
          wrote.
        </li>
        <li>Refunds usually reach your account in 5–10 business days, depending on your bank.</li>
      </ul>

      <div className="pt-4">
        <Button asChild size="lg">
          <Link href="/courses">Choose your course</Link>
        </Button>
      </div>
    </Prose>
  );
}
