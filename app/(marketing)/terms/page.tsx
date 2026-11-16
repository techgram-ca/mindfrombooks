import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/marketing/prose";
import { getSettings } from "@/lib/queries/catalog";
import { LEGAL_UPDATED, SUPPORT_EMAIL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const { refund_window_days: windowDays } = await getSettings();
  const mail = <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;
  return (
    <Prose title="Terms of Service" intro={`Last updated: ${LEGAL_UPDATED}`}>
      <p>
        These terms are an agreement between you and mindfrombooks (“mindfrombooks”, “we”, “us”)
        about your use of this website and the courses sold on it. By creating an account, buying a
        course or using the site, you agree to them. If you don&apos;t agree, please don&apos;t use
        the site.
      </p>

      <h2>1. Who we are and how to reach us</h2>
      <p>
        mindfrombooks is an online education brand based in Canada that publishes daily-action
        courses inspired by books. You can contact us about anything in these terms at {mail}.
      </p>

      <h2>2. Who can use mindfrombooks</h2>
      <p>
        You must be at least the age of majority where you live (18 in most places), or have the
        permission of a parent or guardian who agrees to these terms on your behalf. The courses are
        not intended for children under 13, and we do not knowingly create accounts for them.
      </p>

      <h2>3. Your account</h2>
      <ul>
        <li>
          You can create an account yourself, or one is created for you when you pay for a course
          without being logged in, using the email address you gave at checkout.
        </li>
        <li>
          Give us accurate information, including an email address you can access. Course emails,
          receipts and password resets go to that address.
        </li>
        <li>
          Keep your password private. You are responsible for activity on your account. Tell us
          straight away at {mail} if you think someone else has accessed it.
        </li>
        <li>One account is for one person. Don&apos;t share course access or resell it.</li>
      </ul>

      <h2>4. How the courses work</h2>
      <ul>
        <li>Each course is a set number of days with one task per day.</li>
        <li>
          A course you buy on its own starts the day after you enrol. Courses in the All Access
          bundle start the day after you press “Start this course”.
        </li>
        <li>
          Each day&apos;s task opens at midnight and closes at 11:59 pm in the timezone saved on
          your enrolment. A missed day can&apos;t be reopened, but you can continue the course.
        </li>
        <li>
          You can edit a day&apos;s response until that day closes. After that it is read-only.
        </li>
        <li>
          Your access to a course, and to your own responses for it, has no expiry date while the
          course is offered. If we ever stop offering a course, we will tell you in advance by email
          so you can save your journal.
        </li>
        <li>We may improve or correct course content over time.</li>
      </ul>

      <h2>5. Prices and payment</h2>
      <ul>
        <li>
          All prices are in US dollars and are charged once, when you buy. There is no subscription
          and no automatic renewal.
        </li>
        <li>Payments are processed by Stripe. We never see or store your full card number.</li>
        <li>Your bank may convert the charge into your own currency and may add its own fees.</li>
        <li>
          Where we are required to charge sales tax, it will be shown at checkout before you pay.
        </li>
        <li>
          Discount codes have their own conditions (for example, which courses they cover, an expiry
          date, or one use per person) and can&apos;t be exchanged for cash.
        </li>
        <li>
          We can change prices at any time. A price change never affects a course you have already
          bought.
        </li>
      </ul>

      <h2>6. Refunds</h2>
      <p>
        Our refund guarantee is set out in the <Link href="/refund-policy">Refund Policy</Link>. In
        short: if you paid for a course, responded on every day apart from the grace days that
        course allows, and are still not happy, you can get a full refund with one click within{" "}
        {windowDays} days after your final day. The Refund Policy forms part of these terms.
      </p>

      <h2>7. Your responses and ratings</h2>
      <ul>
        <li>
          What you write in a course stays yours. You give us permission to store and display it to
          you, and to process it so the service works.
        </li>
        <li>
          We will only show your words publicly if you agree. For a daily response, we ask you
          first. For a course rating, you choose whether your comment may be shown and under which
          name; we review every comment before it appears. You can ask us to remove a published
          comment at any time.
        </li>
        <li>
          Don&apos;t post anything unlawful, hateful, harassing, or that infringes someone
          else&apos;s rights, and don&apos;t share other people&apos;s private information in your
          responses. We may remove content that breaks these rules.
        </li>
      </ul>

      <h2>8. Our content</h2>
      <p>
        The course text, design and software belong to mindfrombooks and are protected by copyright
        and other laws. You may use them for your own personal learning. You may not copy,
        republish, sell or share the course content, or use it to train an AI model, without our
        written permission. Sharing your own certificate link is welcome.
      </p>

      <h2>9. Books, authors and trademarks</h2>
      <p>
        Our courses are inspired by ideas from the books we name, explained in our own words.
        mindfrombooks is not affiliated with, authorised by, sponsored by or endorsed by any of
        those authors or publishers. Book titles and author names belong to their owners and are
        used only to describe where an idea comes from. If you are a rights holder with a concern,
        please write to {mail}.
      </p>

      <h2>10. Not professional advice</h2>
      <p>
        Courses are general education and daily practice. They are not financial, investment, tax,
        legal, medical, nutritional, psychological or other professional advice, and they don&apos;t
        create a professional relationship. Think about your own situation and speak to a qualified
        professional before making important decisions. For the health course in particular, check
        with a doctor before starting new exercise, and stop any activity that causes pain or
        discomfort. Using AI tools, as taught in the AI course, is subject to those tools&apos; own
        terms; don&apos;t share confidential or sensitive information with them.
      </p>

      <h2>11. Acceptable use</h2>
      <p>
        Don&apos;t misuse the site. That includes trying to access other people&apos;s accounts or
        data, interfering with the site&apos;s security or operation, scraping or copying content in
        bulk, using automated tools to create accounts or submit responses, abusing discount codes,
        or using the site for anything unlawful.
      </p>

      <h2>12. Suspending or closing accounts</h2>
      <p>
        You can delete your account at any time in Settings. We may suspend or close an account, or
        remove access to a course, if it is used to break these terms, for fraud, or to abuse the
        refund guarantee or discount codes. If we close your account without a good reason under
        these terms, we will refund the courses you paid for and haven&apos;t finished.
      </p>

      <h2>13. Availability</h2>
      <p>
        We work to keep the site running and your progress safe, but we can&apos;t promise it will
        always be available or free of errors. If a problem on our side stops you from responding on
        a day, contact us at {mail} and we will review it fairly when looking at your refund
        guarantee.
      </p>

      <h2>14. Limitation of liability</h2>
      <p>
        To the extent the law allows: the site and courses are provided “as is”; we aren&apos;t
        liable for indirect, incidental, special or consequential losses, or for loss of profits,
        data or opportunity; and our total liability to you for any claim relating to the site or a
        course is limited to the amount you paid us for that course. Nothing in these terms limits
        any right you have as a consumer that the law says can&apos;t be limited, or our liability
        for fraud or for anything else that can&apos;t legally be excluded.
      </p>

      <h2>15. Indemnity</h2>
      <p>
        If you break these terms or the law while using the site, and that leads to a claim against
        us by someone else, you agree to cover our reasonable costs of dealing with that claim, to
        the extent the law allows.
      </p>

      <h2>16. Changes to these terms</h2>
      <p>
        We may update these terms as the service changes. We will change the “Last updated” date
        above, and for significant changes we will tell you by email or on the site before they take
        effect. Changes never reduce the refund guarantee for a course you have already bought.
      </p>

      <h2>17. Governing law and disputes</h2>
      <p>
        These terms are governed by the laws of the Province of Ontario and the federal laws of
        Canada that apply there. Please contact us first at {mail} so we can try to resolve any
        problem quickly and informally. If we can&apos;t, the courts of Ontario will have
        jurisdiction, but if you are a consumer you may also bring a claim in the courts where you
        live, and you keep any rights your local consumer protection laws give you.
      </p>

      <h2>18. General</h2>
      <p>
        If any part of these terms is found to be unenforceable, the rest still applies. If we
        don&apos;t enforce a part of these terms right away, we can still enforce it later. These
        terms, the Privacy Policy and the Refund Policy are the whole agreement between you and us
        about the site.
      </p>
    </Prose>
  );
}
