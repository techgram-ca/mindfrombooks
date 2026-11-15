import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, supabaseSecretKey } from "@/lib/supabase/env";

let cached: SupabaseClient | null = null;

/**
 * Secret-key client (Postgres role `service_role`). Bypasses RLS — server code only, and every caller must
 * scope queries to a user it has already authenticated.
 */
export function createAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = SUPABASE_URL;
  const key = supabaseSecretKey();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY",
    );
  }
  cached = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return cached;
}
