import Link from "next/link";
import { ArrowRight, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/marketing/course-card";
import { DashboardMock } from "@/components/marketing/dashboard-mock";
import { Faq } from "@/components/marketing/faq";
import { GuaranteeBanner } from "@/components/marketing/guarantee";
import { Steps } from "@/components/marketing/steps";
import { Testimonials } from "@/components/marketing/testimonials";
import {
  getBundle,
  getPublishedCourses,
  getSettings,
  getTestimonials,
} from "@/lib/queries/catalog";
import { formatUsd } from "@/lib/pricing";
import { INSTAGRAM_URL } from "@/lib/utils";

const faq = [
  {
    q: "How is this different from reading the book?",
    a: "Reading gives you ideas. These courses turn each idea into one small action you do today, and a short written response that proves you did it. That's where change comes from.",
  },
  {
    q: "When does my course start?",
    a: "The morning after you enroll. Day 1 opens at midnight in your timezone, so you always get a full day for every task.",
  },
  {
    q: "How long does each day take?",
    a: "Most tasks take 5–15 minutes. One action, one response.",
  },
  {
    q: "What happens if I miss a day?",
    a: "Each task is only open on its own day. You can't go back and redo it, but you can keep going. The refund guarantee needs a response on every day, unless the course page says some missed days are allowed.",
  },
  {
    q: "How does the refund work?",
    a: "Respond on every day of the course. If you finish and aren't happy, tap the refund button on your Purchases page within the refund window. It's automatic — no forms and no questions.",
  },
  {
    q: "Which currency are the prices in?",
    a: "All prices are in US dollars (US$). Your bank converts it if your card uses another currency.",
  },
  {
    q: "Are you connected to the authors?",
    a: "No. The courses are inspired by ideas from well-known books and written in our own words. They aren't affiliated with or endorsed by the authors or publishers.",
  },
];

function formatFollowers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
}

export default async function HomePage() {
  const [courses, bundleDetail, settings, testimonials] = await Promise.all([
    getPublishedCourses(),
    getBundle(),
    getSettings(),
    getTestimonials(undefined, 6),
  ]);
  const totalDays = courses.reduce((sum, c) => sum + c.days, 0);
  const separate = bundleDetail?.courses.reduce((sum, c) => sum + c.price_cents, 0) ?? 0;

  return (
    <>
      <section className="container-page grid items-center gap-10 pt-10 pb-14 md:grid-cols-[1.1fr_0.9fr] md:pt-20">
        <div>
          <p className="bg-accent-soft text-accent-strong inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
            Daily-action courses from @mindfrombooks
          </p>
          <h1 className="mt-4 text-[2.5rem] leading-[1.05] font-semibold sm:text-6xl">
            Books teach.
            <br />
            <span className="text-accent-strong">Daily action</span> changes you.
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-lg">
            One small task a day, drawn from the best ideas in great books. Do it, write a short
            response, and watch the days add up. Do the work and still not happy? One-click refund.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/courses">
                Choose your course <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            From{" "}
            {courses.length > 0
              ? formatUsd(Math.min(...courses.map((c) => c.price_cents)))
              : "US$7.99"}{" "}
            · one-time payment · no subscription
          </p>
        </div>
        <DashboardMock />
      </section>

      <section className="container-page py-10" aria-labelledby="how-title">
        <h2 id="how-title" className="text-2xl font-semibold sm:text-3xl">
          How it works
        </h2>
        <p className="text-muted-foreground mt-2 mb-6">
          Three steps. The third one is where it happens.
        </p>
        <Steps />
      </section>

      <div className="container-page py-6">
        <GuaranteeBanner windowDays={settings.refund_window_days} />
      </div>

      <section className="container-page py-10" aria-labelledby="courses-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="courses-title" className="text-2xl font-semibold sm:text-3xl">
              Pick what you want to change
            </h2>
            <p className="text-muted-foreground mt-2">
              {courses.length} courses · {totalDays} days of action
            </p>
          </div>
          <Link
            href="/courses"
            className="text-accent-strong hidden text-sm font-medium underline-offset-4 hover:underline sm:block"
          >
            View all
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {bundleDetail && bundleDetail.courses.length > 0 && (
        <section className="container-page py-6" aria-labelledby="bundle-title">
          <div className="rounded-card bg-primary text-primary-foreground overflow-hidden p-6 sm:p-10">
            <p className="text-accent text-sm font-medium tracking-wide uppercase">All Access</p>
            <h2 id="bundle-title" className="mt-2 text-3xl font-semibold sm:text-4xl">
              All {bundleDetail.courses.length} courses for{" "}
              {formatUsd(bundleDetail.bundle.price_cents)}
            </h2>
            <p className="text-primary-foreground/80 mt-3 max-w-xl">
              {totalDays} days of daily action. Start each course when you&apos;re ready — one at a
              time or a few together.
              {separate > bundleDetail.bundle.price_cents &&
                ` Bought separately they'd cost ${formatUsd(separate)}.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2" aria-hidden>
              {bundleDetail.courses.map((c) => (
                <span key={c.id} className="rounded-full bg-white/10 px-3 py-1 text-sm">
                  {c.emoji} {c.name}
                </span>
              ))}
            </div>
            <Button asChild size="lg" variant="accent" className="mt-6">
              <Link href="/all-access">
                Get All Access <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <div className="container-page py-10">
          <Testimonials items={testimonials} />
        </div>
      )}

      <section className="container-page py-10" aria-labelledby="ig-title">
        <div className="rounded-card border-border bg-surface shadow-soft flex flex-col items-start gap-5 border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              As seen on Instagram
            </p>
            <h2 id="ig-title" className="mt-1 text-2xl font-semibold sm:text-3xl">
              {formatFollowers(settings.instagram_followers)}+ readers follow @mindfrombooks
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Daily book wisdom on Instagram. These courses are where the ideas turn into action.
            </p>
          </div>
          <Button asChild variant="outline" size="lg">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <AtSign aria-hidden /> mindfrombooks
            </a>
          </Button>
        </div>
      </section>

      <section className="container-page py-10" aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-6 text-2xl font-semibold sm:text-3xl">
          Questions
        </h2>
        <Faq items={faq} />
      </section>
    </>
  );
}
