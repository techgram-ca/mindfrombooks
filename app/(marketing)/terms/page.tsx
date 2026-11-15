import type { Metadata } from "next";
import Link from "next/link";
import { DraftNotice, Prose } from "@/components/marketing/prose";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <Prose title="Terms of Service" intro="Last updated: [date]">
      <DraftNotice />
      <h2>1. Who we are</h2>
      <p>
        mindfrombooks (“we”, “us”) operates this website and the courses sold on it. Contact:
        [email].
      </p>
      <h2>2. Your account</h2>
      <p>
        You need an account to enroll. Keep your login details private. You are responsible for
        activity on your account. You must be at least [16/18] years old.
      </p>
      <h2>3. Courses and access</h2>
      <p>
        A course is a set number of daily tasks. Your course starts the day after you enroll. Each
        day&apos;s task is available only on its day in the timezone set on your account at
        enrollment. Access is personal and may not be shared or resold.
      </p>
      <h2>4. Payments</h2>
      <p>
        Prices are in US dollars and are charged once, at purchase, through Stripe. We do not store
        your card details.
      </p>
      <h2>5. Refunds</h2>
      <p>
        Refunds are governed by our <Link href="/refund-policy">Refund Policy</Link>.
      </p>
      <h2>6. Not professional advice</h2>
      <p>
        Courses are general education. They are not financial, medical, legal or psychological
        advice. Check with a qualified professional before making decisions about your health or
        money.
      </p>
      <h2>7. Books and trademarks</h2>
      <p>
        Courses are inspired by ideas from the books named. We are not affiliated with, authorised
        or endorsed by their authors or publishers. Book titles belong to their owners.
      </p>
      <h2>8. Your responses</h2>
      <p>
        What you write stays yours. With your permission, we may feature a response as a testimonial
        under a display name.
      </p>
      <h2>9. Liability</h2>
      <p>[Limitation of liability wording.]</p>
      <h2>10. Governing law</h2>
      <p>These terms are governed by the laws of [Province], Canada.</p>
    </Prose>
  );
}
