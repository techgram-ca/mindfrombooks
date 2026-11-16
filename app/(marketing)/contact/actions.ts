"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { supportMessageSchema } from "@/lib/validators/support";

export interface ContactState {
  error?: string;
  sent?: boolean;
}

export async function sendSupportMessageAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = supportMessageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const m = parsed.data;

  // Bots fill the hidden field or submit instantly. Pretend it worked.
  if (m.website || (m.startedAt && Date.now() - m.startedAt < 3000)) return { sent: true };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60_000)) {
    return {
      error: "You've sent several messages already. Please wait a while before sending another.",
    };
  }

  const profile = await getSessionProfile();
  const { error } = await createAdminClient()
    .from("support_messages")
    .insert({
      user_id: profile?.id ?? null,
      name: m.name,
      email: m.email,
      topic: m.topic,
      message: m.message,
    });
  if (error) {
    console.error("[contact] could not save message", error.message);
    return { error: "We couldn't send your message just now. Please try again in a few minutes." };
  }
  revalidatePath("/admin", "layout");
  return { sent: true };
}
