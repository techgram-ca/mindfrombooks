import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidTimezone } from "@/lib/course-days";
import { siteUrl } from "@/lib/utils";

export interface BuyerAttribution {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  landing?: string | null;
  referrer?: string | null;
}

/**
 * The account for someone who paid without logging in. Uses the account that
 * already owns this email if there is one; otherwise creates it, already
 * confirmed (the email came from a completed Stripe payment). The buyer sets a
 * password on the success page, or later from the welcome email.
 */
export async function findOrCreateBuyer(input: {
  email: string;
  name: string | null;
  timezone: string | null;
  attribution: BuyerAttribution;
}): Promise<{ userId: string; created: boolean }> {
  const db = createAdminClient();
  const email = input.email.trim().toLowerCase();

  const lookup = async () => {
    const { data } = await db.from("profiles").select("id").eq("email", email).maybeSingle();
    return (data?.id as string | undefined) ?? null;
  };

  const existing = await lookup();
  if (existing) return { userId: existing, created: false };

  const timezone = input.timezone && isValidTimezone(input.timezone) ? input.timezone : undefined;
  const { data, error } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name: input.name?.trim() || undefined, timezone },
  });
  if (error || !data.user) {
    // Created a moment ago by a parallel request (webhook and success page).
    const raced = await lookup();
    if (raced) return { userId: raced, created: false };
    throw new Error(`could not create buyer account: ${error?.message ?? "unknown error"}`);
  }

  const a = input.attribution;
  if (a.source || a.medium || a.campaign || a.landing || a.referrer) {
    await db
      .from("profiles")
      .update({
        signup_source: a.source ?? null,
        signup_medium: a.medium ?? null,
        signup_campaign: a.campaign ?? null,
        landing_page: a.landing ?? null,
        referrer: a.referrer ?? null,
      })
      .eq("id", data.user.id);
  }
  return { userId: data.user.id, created: true };
}

/** One-time "choose your password" link for the welcome email. */
export async function setPasswordLink(email: string): Promise<string | null> {
  const { data, error } = await createAdminClient().auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (error || !data.properties?.hashed_token) {
    console.error("[guest] could not create a set-password link", error?.message);
    return null;
  }
  return siteUrl(
    `/auth/callback?token_hash=${data.properties.hashed_token}&type=recovery&next=${encodeURIComponent("/reset-password")}`,
  );
}

/** How long the success page may offer "choose your password". */
export const CLAIM_WINDOW_MS = 24 * 60 * 60 * 1000;
