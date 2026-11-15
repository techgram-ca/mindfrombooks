/**
 * Supabase connection settings in one place.
 *
 * Supabase renamed its API keys: the "anon" key is now the publishable key
 * (sb_publishable_…) and the "service_role" key is now the secret key
 * (sb_secret_…). The new names are preferred; the old variable names still
 * work so an existing project keeps running.
 *
 * NEXT_PUBLIC_ values must be read as literal `process.env.X` expressions so
 * Next.js can inline them into browser code.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** Server only — full access, bypasses Row Level Security. Never import into client code. */
export function supabaseSecretKey(): string {
  return process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}
