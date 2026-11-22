import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/marketing/prose";
import { getSettings } from "@/lib/queries/catalog";
import { LEGAL_UPDATED, SUPPORT_EMAIL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Refund Policy",
  alternates: { canonical: "/refund-policy" },
};

export default async function RefundPolicyPage() {
  const { refund_window_days: windowDays } = await getSettings();
  const mail = <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;
  return (
    <Prose title="Refund Policy" intro={`Last updated: ${LEGAL_UPDATED}`}>
      <p>
        This is the formal version of our <Link href="/guarantee">refund guarantee</Link>. It forms
        part of our <Link href="/terms">Terms of Service</Link>.
      </p>

      <h2>The guarantee</h2>
      <p>
        You can get a full refund of what you paid for a course, with no questions asked, when all
        of the following are true:
      </p>
      <ul>
        <li>you paid for the course, on its own or as part of All Access;</li>
        <li>
          you submitted a response on every day of the course, apart from the number of grace days
          the course allowed when you bought it (shown on the course page and on your course
          progress page);
        </li>
        <li>
          the course is finished: its final day has passed, or you have submitted the final
          day&apos;s response;
        </li>
        <li>you ask within {windowDays} days after the course&apos;s final day; and</li>
        <li>that course hasn&apos;t already been refunded.</li>
      </ul>

      <h2>Grace days</h2>
      <p>
        Each course allows a small number of missed days (for example 2 for a 21-day course). The
        number that applies to you is the one shown when you bought the course; later changes to a
        course don&apos;t affect it. Your course page always shows how many grace days you have
        left.
      </p>

      <h2>How to ask for it</h2>
      <p>
        Press <strong>Claim refund</strong> on the course page, on your Purchases page or on the
        course completion screen. The button becomes active once the course is finished and you are
        eligible. The refund is sent to your original payment method straight away — no form, no
        reason needed.
      </p>

      <h2>All Access</h2>
      <p>
        Each course in the bundle is covered on its own. When you complete a course and are
        eligible, you can refund that course for an equal share of what you paid for the bundle (for
        example, one sixth of the price for a six-course bundle). Other courses in the bundle are
        not affected.
      </p>

      <h2>Accidental duplicate purchases</h2>
      <p>
        If you buy a course that is already on your account, we refund that payment automatically.
      </p>

      <h2>What isn&apos;t refundable</h2>
      <ul>
        <li>
          Self-paced workshops marked “No refund guarantee” on their course page (for example the AI
          animation workshop). Every lesson opens the moment you buy, so the guarantee doesn&apos;t
          apply to them.
        </li>
        <li>
          Courses you received for free, including through a 100% discount code or as a gift from us
          — nothing was paid.
        </li>
        <li>Requests made after the refund window has closed.</li>
        <li>
          Courses where more days were missed than the grace days allow. You can still finish them.
        </li>
      </ul>

      <h2>Timing</h2>
      <p>
        We send refunds immediately. Most banks show them within 5–10 business days. The amount
        refunded is the amount you paid in US dollars; if your bank converted the original charge,
        the amount you see may differ slightly because of exchange rates or bank fees, which we
        don&apos;t control.
      </p>

      <h2>After a refund</h2>
      <p>
        The course is closed to new responses, but you keep read-only access to your journal for it.
      </p>

      <h2>Problems and other requests</h2>
      <p>
        If something on our side stopped you from responding on a day, or you think a refund was
        refused by mistake, write to {mail} and we will look into it.
      </p>

      <h2>Your legal rights</h2>
      <p>
        This guarantee is in addition to your rights under consumer protection law where you live,
        and nothing in this policy limits them.
      </p>
    </Prose>
  );
}
