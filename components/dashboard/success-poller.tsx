"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/track";

interface Status {
  ready: boolean;
  kind?: "course" | "bundle";
  name?: string;
  url?: string;
  amountCents?: number;
}

/** Waits for the Stripe webhook to create the enrollment (usually 1–3 seconds). */
export function SuccessPoller({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      attempts += 1;
      try {
        const res = await fetch(
          `/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as Status;
        if (cancelled) return;
        if (res.ok && data.ready) {
          setStatus(data);
          if (!tracked.current) {
            tracked.current = true;
            track("purchase_completed", {
              product: data.name ?? "",
              value: (data.amountCents ?? 0) / 100,
            });
          }
          return;
        }
      } catch {
        // keep trying
      }
      if (cancelled) return;
      if (attempts >= 20) {
        setGaveUp(true);
        return;
      }
      timer = setTimeout(poll, attempts < 5 ? 1500 : 3000);
    }

    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId]);

  if (status?.ready) {
    const isBundle = status.kind === "bundle";
    return (
      <>
        <div className="text-5xl" aria-hidden>
          🎉
        </div>
        <h1 className="mt-4 text-4xl font-semibold">You&apos;re in!</h1>
        <p className="text-muted-foreground mt-3 max-w-md text-lg">
          {isBundle
            ? "All Access is yours. Pick a course and tap Start — Day 1 opens the next morning."
            : `${status.name} starts tomorrow. Day 1 opens at midnight your time, so you get the full day.`}
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link href={status.url ?? "/dashboard"}>
            {isBundle ? "Choose my first course" : "Go to my course"}
          </Link>
        </Button>
        <p className="text-muted-foreground mt-4 text-sm">A confirmation email is on its way.</p>
      </>
    );
  }

  if (gaveUp) {
    return (
      <>
        <h1 className="text-3xl font-semibold">Payment received — still setting up</h1>
        <p className="text-muted-foreground mt-3 max-w-md">
          Your payment went through, but your course is taking longer than usual to appear. It will
          show up on your dashboard shortly. If it doesn&apos;t within a few minutes, reply to your
          receipt email and we&apos;ll sort it out.
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link href="/dashboard">Go to my dashboard</Link>
        </Button>
      </>
    );
  }

  return (
    <div role="status" className="flex flex-col items-center">
      <Loader2 className="text-accent-strong size-8 animate-spin" aria-hidden />
      <h1 className="mt-5 text-3xl font-semibold">Confirming your payment…</h1>
      <p className="text-muted-foreground mt-2">
        This takes a few seconds. Don&apos;t close this page.
      </p>
    </div>
  );
}
