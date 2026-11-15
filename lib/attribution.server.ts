import "server-only";
import { cookies } from "next/headers";
import { ATTR_COOKIE, parseAttribution, type Attribution } from "@/lib/attribution";
import { createAdminClient } from "@/lib/supabase/admin";

export async function readAttribution(): Promise<Attribution | null> {
  const store = await cookies();
  return parseAttribution(store.get(ATTR_COOKIE)?.value);
}

/** Copy the first-touch cookie onto a brand-new profile. Never overwrites. */
export async function applySignupAttribution(userId: string): Promise<void> {
  const attr = await readAttribution();
  if (!attr) return;
  try {
    await createAdminClient()
      .from("profiles")
      .update({
        signup_source: attr.source,
        signup_medium: attr.medium,
        signup_campaign: attr.campaign,
        landing_page: attr.landing,
        referrer: attr.referrer,
      })
      .eq("id", userId)
      .is("signup_source", null)
      .is("signup_campaign", null)
      .is("landing_page", null);
  } catch (err) {
    console.error("[attribution] could not save", err);
  }
}
