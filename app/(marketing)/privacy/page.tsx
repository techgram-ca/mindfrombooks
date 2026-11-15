import type { Metadata } from "next";
import { DraftNotice, Prose } from "@/components/marketing/prose";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <Prose title="Privacy Policy" intro="Last updated: [date]">
      <DraftNotice />
      <p>
        This policy explains what personal information mindfrombooks collects, why, and your rights
        under Canadian privacy law, including PIPEDA and Quebec&apos;s Law 25.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address, timezone and reminder
          settings.
        </li>
        <li>
          <strong>Your course activity:</strong> the courses you enroll in and the responses you
          write.
        </li>
        <li>
          <strong>Payment records:</strong> what you bought, the amount, and Stripe reference IDs.
          Card details are handled by Stripe and never reach our servers.
        </li>
        <li>
          <strong>How you found us:</strong> see “Attribution cookie” below.
        </li>
      </ul>
      <h2>Analytics</h2>
      <p>
        We use Vercel Web Analytics to count page visits and a few product events (for example,
        “course viewed” or “task submitted”). It is cookieless and does not track you across other
        websites or build an advertising profile.
      </p>
      <h2>Attribution cookie</h2>
      <p>
        If you arrive through a link that contains campaign information (for example from an
        Instagram post), we set one first-party cookie named <code>mfb_attr</code>. It stores the
        campaign source, medium and name, the first page you landed on, the referring address and
        the time. It lasts 30 days. When you create an account, this is saved with your profile so
        we can tell which posts bring people here. It is not shared with advertisers.
      </p>
      <h2>Essential cookies</h2>
      <p>We use cookies that keep you signed in. The site can&apos;t work without them.</p>
      <h2>Who we share it with</h2>
      <ul>
        <li>Supabase — database and sign-in</li>
        <li>Stripe — payments and refunds</li>
        <li>Resend — sending email</li>
        <li>Vercel — hosting and analytics</li>
        <li>Google — only if you choose “Continue with Google”</li>
      </ul>
      <p>
        These providers may process data outside your province or outside Canada. We do not sell
        personal information.
      </p>
      <h2>Emails</h2>
      <p>
        We send account and purchase emails, and daily reminders if you leave them on. Every
        reminder has an unsubscribe link, and you can turn reminders off in Settings.
      </p>
      <h2>Your rights</h2>
      <p>
        You can see and correct your information in Settings, and delete your account there at any
        time, which removes your profile and responses. We keep payment records as required for
        accounting. You may also ask for a copy of your data or withdraw consent by contacting us.
      </p>
      <h2>Contact</h2>
      <p>
        The person responsible for the protection of personal information is [name], reachable at
        [email].
      </p>
    </Prose>
  );
}
