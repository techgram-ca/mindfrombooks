import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/marketing/contact-form";
import { getSessionProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about a course, a payment or your account? Send us a message.",
  alternates: { canonical: "/contact" },
};

// Pre-fills the name and email for logged-in learners, so it renders per request.
export const dynamic = "force-dynamic";

const quick = [
  {
    q: "Refunds",
    a: "The Claim refund button on your course page works automatically once you're eligible.",
    href: "/refund-policy",
  },
  {
    q: "Forgot your password?",
    a: "Reset it from the login page in under a minute.",
    href: "/forgot-password",
  },
  {
    q: "How the days work",
    a: "Each task opens at midnight and closes at 11:59 pm your time.",
    href: "/how-it-works",
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const [profile, sp] = await Promise.all([getSessionProfile(), searchParams]);
  return (
    <div className="container-page py-10">
      <div className="grid gap-10 md:grid-cols-[1.25fr_0.75fr]">
        <div>
          <h1 className="text-4xl font-semibold sm:text-5xl">Contact us</h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-lg">
            A question about a course, a payment or your account? Send us a message and we&apos;ll
            reply by email, usually within 1–2 business days.
          </p>
          <div className="rounded-card border-border bg-surface shadow-soft mt-8 border p-5 sm:p-7">
            <ContactForm name={profile?.name} email={profile?.email} topic={sp.topic} />
          </div>
        </div>
        <aside aria-labelledby="quick-title" className="md:pt-24">
          <h2 id="quick-title" className="text-xl font-semibold">
            Quick answers
          </h2>
          <ul className="mt-4 space-y-3">
            {quick.map((item) => (
              <li key={item.q}>
                <Link
                  href={item.href}
                  className="rounded-card border-border bg-surface hover:bg-surface-muted/60 block border p-4"
                >
                  <span className="font-medium">{item.q}</span>
                  <span className="text-muted-foreground mt-1 block text-sm">{item.a}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
