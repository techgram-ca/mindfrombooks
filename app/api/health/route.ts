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
    // Which deployment and which Supabase project this is (not secret).
    vercel_env: process.env.VERCEL_ENV ?? "local",
    supabase_project: SUPABASE_URL ? new URL(SUPABASE_URL).hostname.split(".")[0] : null,
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
      // Not a count-only (HEAD) request: those come back without the error body,
      // which hides "table not found".
      const { error, count } = await createClient(SUPABASE_URL, key, {
        auth: { persistSession: false },
      })
        .from(table)
        .select("*", { count: "exact" })
        .limit(1);
      return error ? `error: ${error.message}` : `ok (${count ?? 0} rows)`;
    } catch (err) {
      return `error: ${err instanceof Error ? err.message : "request failed"}`;
    }
  }

  const database = {
    publishable_key_reads_courses: await probe(SUPABASE_PUBLISHABLE_KEY, "courses"),
    secret_key_reads_profiles: await probe(supabaseSecretKey(), "profiles"),
    secret_key_reads_tasks: await probe(supabaseSecretKey(), "tasks"),
    ratings_table: await probe(supabaseSecretKey(), "course_ratings"),
    testimonials_table: await probe(supabaseSecretKey(), "testimonials"),
  };
  // Each migration file leaves a fingerprint; a missing function means that file wasn't run.
  const functions: Record<string, string> = {};
  if (SUPABASE_URL && supabaseSecretKey()) {
    const db = createClient(SUPABASE_URL, supabaseSecretKey(), { auth: { persistSession: false } });
    const calls: [string, Record<string, string> | undefined, string][] = [
      [
        "enrollment_progress",
        { p_enrollment_id: "00000000-0000-0000-0000-000000000000" },
        "…000002_functions.sql",
      ],
      ["admin_course_stats", undefined, "…000005_admin_stats.sql"],
      ["admin_overview", undefined, "…000005_admin_stats.sql"],
    ];
    for (const [name, args, file] of calls) {
      const { error } = await db.rpc(name, args);
      functions[name] = error ? `error: ${error.message}` : "ok";
      if (error)
        problems.push(
          `Database function ${name} failed (${error.message}) — run migration ${file}`,
        );
    }
  }

  for (const [check, result] of Object.entries(database)) {
    if (result.startsWith("error") && check.endsWith("_table")) {
      problems.push(`${check}: missing — run migration …20261117000001_ratings_testimonials.sql`);
      continue;
    }
    if (result.startsWith("error")) problems.push(`${check}: ${result}`);
  }
  if (database.secret_key_reads_tasks === "ok (0 rows)")
    problems.push("No tasks found — run the seed.");

  // Informational: sign-in methods switched on in Supabase (the Google button is hidden when off).
  let signIn: Record<string, boolean> | string = "unknown";
  if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
        cache: "no-store",
      });
      const settings = (await res.json()) as { external?: Record<string, boolean> };
      signIn = {
        email: settings.external?.email === true,
        google: settings.external?.google === true,
      };
    } catch {
      signIn = "could not be checked";
    }
  }

  return NextResponse.json({
    ok: problems.length === 0,
    problems,
    env,
    database,
    functions,
    signIn,
  });
}
