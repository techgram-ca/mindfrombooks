import type { Metadata } from "next";
import Link from "next/link";
import { DraftNotice, Prose } from "@/components/marketing/prose";
import { getSettings } from "@/lib/queries/catalog";

export const metadata: Metadata = {
  title: "Refund Policy",
  alternates: { canonical: "/refund-policy" },
};

export default async function RefundPolicyPage() {
  const { refund_window_days: windowDays } = await getSettings();
  return (
    <Prose title="Refund Policy" intro="Last updated: [date]">
      <DraftNotice />
      <p>
        This is the formal version of our <Link href="/guarantee">refund guarantee</Link>.
      </p>
      <h2>When you can get a refund</h2>
      <p>
        You are entitled to a full refund of the amount you paid for a course when all of the
        following are true:
      </p>
      <ul>
        <li>you paid for the course (alone or as part of All Access);</li>
        <li>
          you submitted a response on every day of the course, apart from any grace days that
          applied to the course when you bought it;
        </li>
        <li>the course has ended, or you have submitted the final day&apos;s response;</li>
        <li>you request the refund within {windowDays} days after the final day; and</li>
        <li>the course has not already been refunded.</li>
      </ul>
      <h2>How to request it</h2>
      <p>
        Press the Refund button on your Purchases page or on the course completion screen. The
        refund is issued automatically to your original payment method. No reason is required.
      </p>
      <h2>All Access</h2>
      <p>
        Each course in the bundle can be refunded separately for an equal share of the amount paid
        for the bundle.
      </p>
      <h2>What is not refundable</h2>
      <p>Courses received for free, including through a 100% discount code or a gift from us.</p>
      <h2>Timing</h2>
      <p>
        Refunds are sent immediately and usually appear within 5–10 business days, depending on your
        bank.
      </p>
      <h2>Your legal rights</h2>
      <p>
        Nothing in this policy limits rights you have under consumer protection law where you live.
      </p>
    </Prose>
  );
}
