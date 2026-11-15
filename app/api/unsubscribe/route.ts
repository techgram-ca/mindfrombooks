import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

/** One-click unsubscribe target for the List-Unsubscribe header (RFC 8058). POST only. */
export async function POST(request: Request) {
  const params = new URL(request.url).searchParams;
  const user = z.string().uuid().safeParse(params.get("u"));
  const token = params.get("t") ?? "";
  if (!user.success || !verifyUnsubscribeToken(user.data, token)) {
    return NextResponse.json({ error: "Invalid link." }, { status: 400 });
  }
  await createAdminClient().from("profiles").update({ email_reminders: false }).eq("id", user.data);
  return NextResponse.json({ unsubscribed: true });
}
