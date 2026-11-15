"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { applySignupAttribution } from "@/lib/attribution.server";
import { loginSchema, signupSchema, emailSchema, passwordSchema } from "@/lib/validators/auth";
import { safeNextPath, siteUrl } from "@/lib/utils";

export interface AuthState {
  error?: string;
  message?: string;
  signedUp?: boolean;
}

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Please check the form.";
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error)
    return { error: "That email and password don't match. Try again or reset your password." };
  redirect(safeNextPath(formData.get("next") as string | null));
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
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
    return {
      error: /registered|exists/i.test(error.message)
        ? "An account with this email already exists. Try logging in."
        : error.message,
    };
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
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: siteUrl("/auth/callback?next=/reset-password"),
  });
  // Same message whether or not the account exists.
  return { message: "If that email has an account, a reset link is on its way." };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
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
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
