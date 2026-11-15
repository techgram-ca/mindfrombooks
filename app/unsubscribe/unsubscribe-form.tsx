"use client";
import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/shared/submit-button";
import { unsubscribeAction, type UnsubscribeState } from "./actions";

const initial: UnsubscribeState = {};

export function UnsubscribeForm({ u, t }: { u: string; t: string }) {
  const [state, action] = useActionState(unsubscribeAction, initial);
  if (state.done) {
    return (
      <div role="status">
        <h1 className="text-3xl font-semibold">You&apos;re unsubscribed</h1>
        <p className="text-muted-foreground mt-2">
          No more daily reminders. Your courses are still there whenever you open the dashboard —
          and you can switch reminders back on in{" "}
          <Link href="/dashboard/settings" className="text-accent-strong underline">
            Settings
          </Link>
          .
        </p>
      </div>
    );
  }
  return (
    <form action={action}>
      <input type="hidden" name="u" value={u} />
      <input type="hidden" name="t" value={t} />
      <h1 className="text-3xl font-semibold">Stop daily reminders?</h1>
      <p className="text-muted-foreground mt-2 mb-6">
        You&apos;ll still get emails about purchases and refunds. Each day&apos;s task still closes
        at 11:59 pm, so you may want another way to remember.
      </p>
      {state.error && (
        <p
          role="alert"
          className="bg-danger-soft text-danger mb-4 rounded-xl px-3.5 py-2.5 text-sm"
        >
          {state.error}
        </p>
      )}
      <SubmitButton size="lg" pendingText="Unsubscribing…">
        Unsubscribe from reminders
      </SubmitButton>
    </form>
  );
}
