import "server-only";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Is "Continue with Google" switched on in this Supabase project?
 * Supabase publishes its enabled sign-in providers, so we only show the Google
 * button when it will actually work — otherwise people land on a raw
 * "provider is not enabled" error. Checked at most every five minutes.
 */
export async function isGoogleSignInEnabled(): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
      next: { revalidate: 300 },
    });
    if (!res.ok) return false;
    const settings = (await res.json()) as { external?: Record<string, boolean> };
    return settings.external?.google === true;
  } catch {
    return false;
  }
}
