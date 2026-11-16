import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, jsonError, parseBody } from "@/lib/api";
import { CLAIM_WINDOW_MS } from "@/lib/guest-accounts";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { passwordSchema } from "@/lib/validators/auth";

const claimSchema = z.object({
  sessionId: z
    .string()
    .regex(/^cs_[A-Za-z0-9_]+$/)
    .max(200),
  name: z.string().trim().min(1, "Tell us your name.").max(80),
  password: passwordSchema,
});

/**
 * After a guest checkout: the buyer chooses a password for the account their
 * payment created, and is logged in. Allowed once per order, within 24 hours,
 * and only for an account this payment created — never for an existing one.
 */
export const POST = handle(async (request: Request) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!rateLimit(`claim:${ip}`, 8, 60_000)) {
    return jsonError(429, "Too many tries. Wait a minute and try again.");
  }
  const body = await parseBody(request, claimSchema);
  const db = createAdminClient();

  const { data: order } = await db
    .from("orders")
    .select("id, user_id, created_account, account_claimed_at, created_at, courses(slug)")
    .eq("stripe_checkout_session_id", body.sessionId)
    .maybeSingle();
  if (!order?.user_id || !order.created_account) {
    return jsonError(403, "This purchase is linked to an existing account. Please log in instead.");
  }
  if (Date.now() - new Date(order.created_at as string).getTime() > CLAIM_WINDOW_MS) {
    return jsonError(410, "This link has expired. Use “Forgot password” on the login page.");
  }

  // Claim it atomically so the password can only be set once from here.
  const { data: claimed } = await db
    .from("orders")
    .update({ account_claimed_at: new Date().toISOString() })
    .eq("id", order.id)
    .is("account_claimed_at", null)
    .select("id");
  if (!claimed?.length) {
    return jsonError(409, "Your password is already set. Please log in.");
  }

  const userId = order.user_id as string;
  const { data: updated, error } = await db.auth.admin.updateUserById(userId, {
    password: body.password,
    user_metadata: { name: body.name },
  });
  if (error || !updated.user?.email) {
    await db.from("orders").update({ account_claimed_at: null }).eq("id", order.id);
    console.error("[claim] could not set password", error?.message);
    return jsonError(400, error?.message ?? "We couldn't set your password. Please try again.");
  }
  await db.from("profiles").update({ name: body.name }).eq("id", userId);

  // Log them in on this device.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: updated.user.email,
    password: body.password,
  });
  if (signInError)
    console.error("[claim] sign-in after setting password failed", signInError.message);

  const course = order.courses as unknown as { slug: string } | null;
  return NextResponse.json({
    ok: true,
    signedIn: !signInError,
    url: course ? `/dashboard/courses/${course.slug}?enrolled=1` : "/dashboard?enrolled=1",
  });
});
