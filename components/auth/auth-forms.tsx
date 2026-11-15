"use client";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
  loginAction,
  signupAction,
  forgotPasswordAction,
  resetPasswordAction,
  type AuthState,
} from "@/app/(auth)/actions";
import { Input, Label, Select, FieldHint } from "@/components/ui/input";
import { SubmitButton } from "@/components/shared/submit-button";
import { GoogleButton } from "@/components/auth/google-button";
import { track } from "@/lib/track";

const initial: AuthState = {};

function Notice({ state }: { state: AuthState }) {
  if (state.error) {
    return (
      <p role="alert" className="bg-danger-soft text-danger rounded-xl px-3.5 py-2.5 text-sm">
        {state.error}
      </p>
    );
  }
  if (state.message) {
    return (
      <p role="status" className="bg-success-soft text-success rounded-xl px-3.5 py-2.5 text-sm">
        {state.message}
      </p>
    );
  }
  return null;
}

function Divider() {
  return (
    <div className="text-muted-foreground flex items-center gap-3 text-xs tracking-wide uppercase">
      <span className="bg-border h-px flex-1" />
      or
      <span className="bg-border h-px flex-1" />
    </div>
  );
}

export function LoginForm({ next, linkError }: { next: string; linkError?: boolean }) {
  const [state, action] = useActionState(loginAction, initial);
  return (
    <div className="space-y-5">
      {linkError && !state.error && (
        <Notice
          state={{
            error: "That link has expired or was already used. Please log in or request a new one.",
          }}
        />
      )}
      <GoogleButton next={next} label="Continue with Google" />
      <Divider />
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-accent-strong text-sm underline-offset-4 hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Notice state={state} />
        <SubmitButton className="w-full" pendingText="Logging in…">
          Log in
        </SubmitButton>
      </form>
    </div>
  );
}

export function useTimezones(): { detected: string; all: string[] } {
  const [detected, setDetected] = useState("America/Toronto");
  const all = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [
        "America/Toronto",
        "America/Vancouver",
        "America/New_York",
        "Europe/London",
        "Asia/Kolkata",
      ];
    }
  }, []);
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only value, read once after mount
    if (tz) setDetected(tz);
  }, []);
  return { detected, all };
}

export function SignupForm({ next }: { next: string }) {
  const [state, action] = useActionState(signupAction, initial);
  const { detected, all } = useTimezones();
  const [timezone, setTimezone] = useState<string | null>(null);

  useEffect(() => {
    if (state.signedUp) track("signup_completed", { method: "email" });
  }, [state.signedUp]);

  if (state.signedUp) {
    return (
      <div className="space-y-3 text-center">
        <div className="text-4xl" aria-hidden>
          📬
        </div>
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <GoogleButton next={next} label="Sign up with Google" />
      <Divider />
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <Label htmlFor="name">First name</Label>
          <Input id="name" name="name" autoComplete="given-name" required maxLength={80} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <FieldHint>At least 8 characters.</FieldHint>
        </div>
        <div>
          <Label htmlFor="timezone">Your timezone</Label>
          <Select
            id="timezone"
            name="timezone"
            value={timezone ?? detected}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {all.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
          <FieldHint>
            Each day&apos;s task opens at midnight and closes at 11:59 pm in this timezone.
          </FieldHint>
        </div>
        <Notice state={state} />
        <SubmitButton className="w-full" pendingText="Creating your account…">
          Create account
        </SubmitButton>
        <p className="text-muted-foreground text-center text-xs">
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, initial);
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <Notice state={state} />
      <SubmitButton className="w-full" pendingText="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPasswordAction, initial);
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <FieldHint>At least 8 characters.</FieldHint>
      </div>
      <Notice state={state} />
      <SubmitButton className="w-full" pendingText="Saving…">
        Save password
      </SubmitButton>
    </form>
  );
}
