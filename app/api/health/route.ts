import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseSecretKey } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/**
 * Setup diagnostics for staging / local. Shows which settings are present
 * (never their values) and whether the database answers. Switched off on the
 * production deployment.
 */
export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Not available in production." }, { status: 404 });
  }

  const env = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    NEXT_PUBLIC_SUPABASE_URL: Boolean(SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(SUPABASE_PUBLISHABLE_KEY),
    SUPABASE_SECRET_KEY: Boolean(supabaseSecretKey()),
    STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    stripe_mode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
      ? "live"
      : process.env.STRIPE_SECRET_KEY
        ? "test"
        : null,
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
    EMAIL_FROM: Boolean(process.env.EMAIL_FROM),
    CRON_SECRET: Boolean(process.env.CRON_SECRET),
    UNSUBSCRIBE_TOKEN_SECRET: Boolean(process.env.UNSUBSCRIBE_TOKEN_SECRET),
  };

  const problems: string[] = [];
  for (const [key, value] of Object.entries(env))
    if (value === false) problems.push(`${key} is not set`);
  if (env.NEXT_PUBLIC_SITE_URL && !/^https?:\/\//.test(env.NEXT_PUBLIC_SITE_URL)) {
    problems.push("NEXT_PUBLIC_SITE_URL must start with https://");
  }
  if (SUPABASE_URL && !/^https:\/\/.+/.test(SUPABASE_URL)) {
    problems.push("NEXT_PUBLIC_SUPABASE_URL must look like https://xxxx.supabase.co");
  }

  async function probe(key: string, table: string): Promise<string> {
    if (!SUPABASE_URL || !key) return "skipped (not configured)";
    try {
      const { error, count } = await createClient(SUPABASE_URL, key, {
        auth: { persistSession: false },
      })
        .from(table)
        .select("*", { count: "exact", head: true });
      return error ? `error: ${error.message}` : `ok (${count ?? 0} rows)`;
    } catch (err) {
      return `error: ${err instanceof Error ? err.message : "request failed"}`;
    }
  }

  const database = {
    publishable_key_reads_courses: await probe(SUPABASE_PUBLISHABLE_KEY, "courses"),
    secret_key_reads_profiles: await probe(supabaseSecretKey(), "profiles"),
    secret_key_reads_tasks: await probe(supabaseSecretKey(), "tasks"),
  };
  for (const [check, result] of Object.entries(database)) {
    if (result.startsWith("error")) problems.push(`${check}: ${result}`);
  }
  if (database.secret_key_reads_tasks === "ok (0 rows)")
    problems.push("No tasks found — run the seed.");

  return NextResponse.json({ ok: problems.length === 0, problems, env, database });
}
