import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { applySignupAttribution } from "@/lib/attribution.server";
import { safeNextPath } from "@/lib/utils";

/**
 * Lands here from: Google OAuth and email confirmation (?code=…), and from our
 * own invite / recovery links (?token_hash=…&type=…).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  }

  if (!ok) {
    return NextResponse.redirect(`${origin}/login?error=link`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let destination = next;
  if (user) {
    // First sign-in within the last 10 minutes = a new account (e.g. Google).
    const isNew = Date.now() - new Date(user.created_at).getTime() < 10 * 60_000;
    if (isNew) {
      await applySignupAttribution(user.id);
      const provider = user.app_metadata.provider === "google" ? "google" : "email";
      destination = `${next}${next.includes("?") ? "&" : "?"}welcome=${provider}`;
    }
  }
  return NextResponse.redirect(`${origin}${destination}`);
}
