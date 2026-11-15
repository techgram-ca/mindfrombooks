import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardMock } from "@/components/marketing/dashboard-mock";
import { GuaranteeBanner } from "@/components/marketing/guarantee";
import { getSettings } from "@/lib/queries/catalog";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Enroll, do one small task a day, write a short response. Here's what each day looks like.",
  alternates: { canonical: "/how-it-works" },
};

const days = [
  "done",
  "done",
  "done",
  "missed",
  "done",
  "done",
  "today",
  "locked",
  "locked",
  "locked",
  "locked",
  "locked",
  "locked",
  "locked",
] as const;
const dayStyle: Record<(typeof days)[number], string> = {
  done: "bg-success-soft text-success",
  missed: "bg-danger-soft text-danger",
  today: "bg-info text-white",
  locked: "bg-surface-muted text-muted-foreground",
};
const dayIcon: Record<(typeof days)[number], string> = {
  done: "✓",
  missed: "○",
  today: "●",
  locked: "🔒",
};

function CalendarMock() {
  return (
    <div
      className="border-border bg-background shadow-lift mx-auto w-full max-w-[20rem] rounded-[2rem] border p-4"
      role="img"
      aria-label="Preview of the course calendar: completed days, one missed day, today and locked future days"
    >
      <p className="text-sm font-semibold">🔥 Build Discipline · Day 7 of 66</p>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => (
          <div
            key={i}
            className={`flex aspect-square items-center justify-center rounded-lg text-xs font-semibold ${dayStyle[d]}`}
          >
            {dayIcon[d]}
          </div>
        ))}
      </div>
      <p className="text-muted-foreground mt-3 text-xs">✓ done · ○ missed · ● today · 🔒 locked</p>
    </div>
  );
}

function TaskMock() {
  return (
    <div
      className="border-border bg-background shadow-lift mx-auto w-full max-w-[20rem] rounded-[2rem] border p-4"
      role="img"
      aria-label="Preview of a daily task: a title, a short book insight, instructions and a box to write your response"
    >
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        Day 3 · Awareness
      </p>
      <p className="mt-1 font-serif text-lg font-semibold">Pay yourself first — even $5</p>
      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
        Keep a part of everything you earn before you spend the rest. The order matters more than
        the amount.
      </p>
      <div className="border-border bg-surface text-muted-foreground mt-3 rounded-xl border p-3 text-xs">
        How much did you move, and what will you set as your automatic amount?
        <div className="bg-surface-muted mt-2 h-12 rounded-lg" />
      </div>
      <div className="bg-primary text-primary-foreground mt-3 rounded-full py-2 text-center text-sm font-medium">
        Submit
      </div>
    </div>
  );
}

const sections = [
  {
    step: "Step 1",
    title: "Enroll — your course starts tomorrow",
    body: "Pick a course and check out. Day 1 opens at midnight in your timezone, so your first day is a full day. Until then, your dashboard shows a countdown.",
    visual: <DashboardMock />,
  },
  {
    step: "Step 2",
    title: "One small task, every day",
    body: "Each day has one idea from a book, explained in a few sentences, and one action to take. Then one question to answer. Most days take 5–15 minutes. We'll email you a reminder at the time you choose.",
    visual: <TaskMock />,
  },
  {
    step: "Step 3",
    title: "Respond before midnight",
    body: "Your written response is the proof you did the work. Each day closes at 11:59 pm your time. A missed day stays missed — that's what makes the streak mean something. Your calendar shows every day at a glance.",
    visual: <CalendarMock />,
  },
];

export default async function HowItWorksPage() {
  const settings = await getSettings();
  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">How it works</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
        No videos to binge, no 300 pages to get through. Just one small thing to do today.
      </p>
      <div className="mt-10 space-y-14">
        {sections.map((s, i) => (
          <section key={s.title} className="grid items-center gap-8 md:grid-cols-2">
            <div className={i % 2 === 1 ? "md:order-2" : undefined}>
              <p className="text-accent-strong text-sm font-semibold tracking-wide uppercase">
                {s.step}
              </p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{s.title}</h2>
              <p className="text-muted-foreground mt-3 text-lg leading-relaxed">{s.body}</p>
            </div>
            <div>{s.visual}</div>
          </section>
        ))}
      </div>
      <div className="mt-14">
        <GuaranteeBanner windowDays={settings.refund_window_days} />
      </div>
      <div className="mt-10 text-center">
        <Button asChild size="lg">
          <Link href="/courses">Choose your course</Link>
        </Button>
      </div>
    </div>
  );
}
