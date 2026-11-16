import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/marketing/prose";
import { LEGAL_UPDATED, SUPPORT_EMAIL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const mail = <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;
  return (
    <Prose title="Privacy Policy" intro={`Last updated: ${LEGAL_UPDATED}`}>
      <p>
        This policy explains what personal information mindfrombooks (“we”, “us”) collects, why we
        collect it, who we share it with and the choices you have. We follow Canada&apos;s Personal
        Information Protection and Electronic Documents Act (PIPEDA) and Quebec&apos;s Act
        respecting the protection of personal information in the private sector (Law 25), and we
        respect the rights given by other privacy laws where you live.
      </p>

      <h2>Who is responsible</h2>
      <p>
        mindfrombooks is responsible for the personal information described here. Our person in
        charge of the protection of personal information (privacy officer) can be reached at {mail}.
        Write to that address with any question, request or complaint about your information.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address, password (stored only in
          scrambled form by our sign-in provider), timezone, reminder time and reminder choice. If
          you use “Continue with Google”, we receive your name and email address from Google.
        </li>
        <li>
          <strong>Course activity:</strong> the courses you are enrolled in, the dates they start,
          the responses you write, your streaks, certificates, and any course rating and comment you
          submit.
        </li>
        <li>
          <strong>Purchases:</strong> what you bought, the amount, any discount code, refunds, and
          Stripe reference numbers. If you pay without being logged in, we use the email address you
          give Stripe to create your account. Card details are handled by Stripe and never reach us.
        </li>
        <li>
          <strong>How you found us:</strong> see “Attribution cookie” below.
        </li>
        <li>
          <strong>Messages:</strong> anything you send us by email.
        </li>
        <li>
          <strong>Technical information:</strong> basic information your browser sends, such as IP
          address and device type, which our hosting provider uses to deliver the site and keep it
          secure.
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>
          To run your account and courses: unlock each day, save your responses, track progress,
          issue certificates and apply the refund guarantee.
        </li>
        <li>To take payments, give refunds and keep the accounting records the law requires.</li>
        <li>
          To send emails you expect: purchase confirmations, refunds, password links, and daily
          reminders if you leave them on.
        </li>
        <li>
          To understand which posts and links bring people to us, and which pages work, so we can
          improve the courses and the site.
        </li>
        <li>To keep the service secure and prevent fraud and abuse.</li>
        <li>To show your comment on a course page, only if you have agreed to it.</li>
      </ul>
      <p>
        We don&apos;t sell your personal information, we don&apos;t use it for targeted advertising,
        and we don&apos;t make decisions about you based only on automated processing.
      </p>

      <h2>Your consent</h2>
      <p>
        By creating an account or buying a course, you consent to the uses described above. You can
        withdraw consent for optional uses at any time — for example, by turning off reminders or
        asking us to remove a published comment. If you withdraw consent for something the service
        needs (such as storing your responses), we may not be able to keep providing the course.
      </p>

      <h2>Analytics</h2>
      <p>
        We use Vercel Web Analytics to count page visits and a few product events, such as “course
        viewed” or “task submitted”. It does not use cookies, does not track you across other
        websites and does not build an advertising profile.
      </p>

      <h2>Cookies</h2>
      <ul>
        <li>
          <strong>Sign-in cookies</strong> keep you logged in. The site can&apos;t work without
          them.
        </li>
        <li>
          <strong>
            Attribution cookie (<code>mfb_attr</code>):
          </strong>{" "}
          if you arrive through a link that contains campaign information (for example from an
          Instagram post), we store the campaign source, medium and name, the first page you landed
          on, the referring address and the time. It lasts 30 days. If you create an account or buy
          a course, this is saved with your account so we know which posts bring people here. It is
          not shared with advertisers.
        </li>
      </ul>
      <p>
        You can block or delete cookies in your browser settings; you will then need to log in
        again.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We share personal information only with service providers that help us run the site, and
        only what each one needs:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — database and sign-in
        </li>
        <li>
          <strong>Stripe</strong> — payments and refunds
        </li>
        <li>
          <strong>Resend</strong> — sending email
        </li>
        <li>
          <strong>Vercel</strong> — hosting and analytics
        </li>
        <li>
          <strong>Google</strong> — only if you choose “Continue with Google”
        </li>
      </ul>
      <p>
        These providers are bound by contract to protect your information and use it only to provide
        their service to us. We may also disclose information if the law requires it, to protect
        people&apos;s safety, or as part of a sale or merger of the business, in which case the
        buyer must protect it in the same way.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Our providers may store and process information outside your province and outside Canada,
        including in the United States. Information stored in another country may be accessible to
        that country&apos;s courts and authorities under its laws.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Your account, responses and progress: for as long as you keep your account.</li>
        <li>
          Purchase and refund records: as long as tax and accounting laws require, typically seven
          years, even after you delete your account.
        </li>

        <li>The attribution cookie: 30 days in your browser.</li>
      </ul>
      <p>
        When you delete your account, we delete your profile, enrolments, responses, ratings and
        certificates. Purchase records are kept without a link to your account.
      </p>

      <h2>How we protect it</h2>
      <p>
        Data is encrypted in transit, each person can only access their own records, payment details
        stay with Stripe, and staff access is limited to what is needed to run and support the
        service. No system is perfectly secure; if a breach involving your information creates a
        real risk of significant harm, we will notify you and the relevant privacy authorities as
        the law requires.
      </p>

      <h2>Your rights</h2>
      <ul>
        <li>
          <strong>Access and correction:</strong> see and correct your details in{" "}
          <Link href="/dashboard/settings">Settings</Link>, or ask us for a copy of the personal
          information we hold about you.
        </li>
        <li>
          <strong>Portability:</strong> ask for your information, including your responses, in a
          commonly used format.
        </li>
        <li>
          <strong>Deletion:</strong> delete your account at any time in Settings, or ask us to do
          it.
        </li>
        <li>
          <strong>Emails:</strong> turn off daily reminders in Settings or with the unsubscribe link
          in any reminder. You will still get messages about purchases, refunds and your account.
        </li>
        <li>
          <strong>Withdraw consent</strong> to optional uses, as described above.
        </li>
      </ul>
      <p>
        Send requests to {mail}. We will reply within 30 days and may ask you to confirm your
        identity first. If you are not satisfied with our answer, you can complain to the Office of
        the Privacy Commissioner of Canada, or, if you live in Quebec, the Commission d&apos;accès à
        l&apos;information du Québec, or the privacy authority where you live.
      </p>

      <h2>Children</h2>
      <p>
        mindfrombooks is not intended for children under 13 and we do not knowingly collect their
        information. If you believe a child has given us personal information, contact us and we
        will delete it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy as the service changes. We will change the “Last updated” date
        above, and for significant changes we will tell you by email or on the site.
      </p>
    </Prose>
  );
}
