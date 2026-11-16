"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label } from "@/components/ui/input";
import { track } from "@/lib/track";

type AccountStep = "signed_in" | "set_password" | "login";

interface Status {
  ready: boolean;
  kind?: "course" | "bundle";
  name?: string;
  url?: string;
  amountCents?: number;
  account?: AccountStep;
  alreadyOwned?: boolean;
  email?: string;
  buyerName?: string;
}

/** Last step of a guest checkout: choose a password and get logged in. */
function SetPasswordForm({ sessionId, status }: { sessionId: string; status: Status }) {
  const [name, setName] = useState(status.buyerName ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, name, password }),
      });
      const data = (await res.json()) as { url?: string; signedIn?: boolean; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "We couldn't save your password. Please try again.");
        setSaving(false);
        return;
      }
      track("signup_completed", { method: "checkout" });
      // Full navigation so the new login cookies are used straight away.
      window.location.assign(
        data.signedIn
          ? data.url
          : `/login?next=${encodeURIComponent(data.url)}&email=${encodeURIComponent(status.email ?? "")}`,
      );
    } catch {
      setError("We couldn't save your password. Check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="border-border bg-surface shadow-soft mt-7 w-full max-w-sm space-y-4 rounded-3xl border p-6 text-left"
    >
      <div>
        <h2 className="text-xl font-semibold">Last step: choose a password</h2>
        <p className="text-muted-foreground mt-1 text-sm">So you can log in on any device.</p>
      </div>
      <div>
        <Label htmlFor="buyer-email">Email</Label>
        <Input id="buyer-email" value={status.email ?? ""} readOnly disabled />
        <FieldHint>The email you used to pay.</FieldHint>
      </div>
      <div>
        <Label htmlFor="buyer-name">First name</Label>
        <Input
          id="buyer-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="given-name"
          required
          maxLength={80}
        />
      </div>
      <div>
        <Label htmlFor="buyer-password">Password</Label>
        <Input
          id="buyer-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <FieldHint>At least 8 characters.</FieldHint>
      </div>
      {error && (
        <p role="alert" className="bg-danger-soft text-danger rounded-xl px-3.5 py-2.5 text-sm">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        {saving && <Loader2 className="animate-spin" aria-hidden />}
        {saving ? "Saving…" : "Save and go to my course"}
      </Button>
      <p className="text-muted-foreground text-center text-xs">
        We also emailed you a link to set it later.
      </p>
    </form>
  );
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
          {
            cache: "no-store",
          },
        );
        const data = (await res.json()) as Status;
        if (cancelled) return;
        if (res.ok && data.ready) {
          setStatus(data);
          if (!tracked.current && !data.alreadyOwned) {
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
    const loginHref = `/login?next=${encodeURIComponent(status.url ?? "/dashboard")}${status.email ? `&email=${encodeURIComponent(status.email)}` : ""}`;

    if (status.alreadyOwned) {
      return (
        <>
          <div className="text-5xl" aria-hidden>
            👍
          </div>
          <h1 className="mt-4 text-3xl font-semibold">You already have this</h1>
          <p className="text-muted-foreground mt-3 max-w-md text-lg">
            {status.name} is already on your account, so we refunded this payment automatically. It
            can take 5–10 business days to appear.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href={status.account === "signed_in" ? (status.url ?? "/dashboard") : loginHref}>
              {status.account === "signed_in" ? "Go to my course" : "Log in"}
            </Link>
          </Button>
        </>
      );
    }

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

        {status.account === "set_password" && (
          <SetPasswordForm sessionId={sessionId} status={status} />
        )}

        {status.account === "signed_in" && (
          <Button asChild size="lg" className="mt-7">
            <Link href={status.url ?? "/dashboard"}>
              {isBundle ? "Choose my first course" : "Go to my course"}
            </Link>
          </Button>
        )}

        {status.account === "login" && (
          <div className="mt-7 flex flex-col items-center gap-3">
            <p className="text-muted-foreground max-w-sm">
              It&apos;s on your account{status.email ? ` (${status.email})` : ""}. Log in to start.
            </p>
            <Button asChild size="lg">
              <Link href={loginHref}>Log in to start</Link>
            </Button>
            <Link
              href="/forgot-password"
              className="text-accent-strong text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        )}

        <p className="text-muted-foreground mt-4 text-sm">A confirmation email is on its way.</p>
      </>
    );
  }

  if (gaveUp) {
    return (
      <>
        <h1 className="text-3xl font-semibold">Payment received — still setting up</h1>
        <p className="text-muted-foreground mt-3 max-w-md">
          Your payment went through, but your course is taking longer than usual to appear.
          We&apos;ll email you a link to log in as soon as it&apos;s ready. If nothing arrives
          within a few minutes,{" "}
          <Link href="/contact?topic=payment" className="underline">
            contact us
          </Link>{" "}
          and we&apos;ll sort it out.
        </p>
        <Button className="mt-7" onClick={() => window.location.reload()}>
          Check again
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
