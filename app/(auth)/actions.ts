"use server";
import { redirect, unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { applySignupAttribution } from "@/lib/attribution.server";
import { loginSchema, signupSchema, emailSchema, passwordSchema } from "@/lib/validators/auth";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import { safeNextPath, siteUrl } from "@/lib/utils";

export interface AuthState {
  error?: string;
  message?: string;
  signedUp?: boolean;
}

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Please check the form.";
}

const NOT_CONFIGURED =
  "Sign-in isn't set up on this site yet. (Admin: the Supabase URL or publishable key is missing for this deployment — add them in Vercel for this environment and redeploy.)";

/**
 * Run an auth action so that a configuration or network problem comes back as
 * a readable message on the form instead of a blank 500 page. The real cause
 * is logged for the server logs (Vercel → Logs).
 */
async function guarded(name: string, run: () => Promise<AuthState>): Promise<AuthState> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error(
      `[auth:${name}] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY missing`,
    );
    return { error: NOT_CONFIGURED };
  }
  try {
    return await run();
  } catch (err) {
    unstable_rethrow(err); // let redirect() through
    console.error(`[auth:${name}] failed`, err);
    return { error: "We couldn't reach the sign-in service. Please try again in a moment." };
  }
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  return guarded("login", async () => {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error)
      return { error: "That email and password don't match. Try again or reset your password." };
    redirect(safeNextPath(formData.get("next") as string | null));
  });
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  return guarded("signup", async () => {
    const parsed = signupSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const next = safeNextPath(formData.get("next") as string | null);
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { name: parsed.data.name, timezone: parsed.data.timezone },
        emailRedirectTo: siteUrl(`/auth/callback?next=${encodeURIComponent(next)}`),
      },
    });
    if (error) {
      console.error(`[auth:signup] ${error.status ?? ""} ${error.message}`);
      if (/registered|exists/i.test(error.message)) {
        return { error: "An account with this email already exists. Try logging in." };
      }
      if (/database error/i.test(error.message)) {
        // The profile trigger failed — usually the migrations haven't all been run.
        return {
          error:
            "We couldn't create your account because the database isn't fully set up. (Admin: run every file in supabase/migrations, in order.)",
        };
      }
      return { error: error.message };
    }
    // Supabase returns a user with no identities when the email is already taken.
    if (data.user && data.user.identities?.length === 0) {
      return { error: "An account with this email already exists. Try logging in." };
    }
    if (data.user) await applySignupAttribution(data.user.id);
    if (data.session) {
      redirect(`${next}${next.includes("?") ? "&" : "?"}welcome=email`);
    }
    return {
      signedUp: true,
      message:
        "Almost there — we sent a confirmation link to your email. Open it to finish signing up.",
    };
  });
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  return guarded("forgotPassword", async () => {
    const parsed = emailSchema.safeParse(formData.get("email"));
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: siteUrl("/auth/callback?next=/reset-password"),
    });
    // Same message whether or not the account exists.
    return { message: "If that email has an account, a reset link is on its way." };
  });
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  return guarded("resetPassword", async () => {
    const parsed = passwordSchema.safeParse(formData.get("password"));
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "This link has expired. Request a new one." };
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    if (error) return { error: error.message };
    redirect("/dashboard");
  });
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
