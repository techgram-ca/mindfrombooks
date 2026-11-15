"use server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

export interface UnsubscribeState {
  done?: boolean;
  error?: string;
}

export async function unsubscribeAction(
  _prev: UnsubscribeState,
  formData: FormData,
): Promise<UnsubscribeState> {
  const user = z.string().uuid().safeParse(formData.get("u"));
  const token = String(formData.get("t") ?? "");
  if (!user.success || !verifyUnsubscribeToken(user.data, token)) {
    return { error: "This unsubscribe link isn't valid. You can turn reminders off in Settings." };
  }
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ email_reminders: false })
    .eq("id", user.data);
  if (error)
    return { error: "Something went wrong. Please try again, or turn reminders off in Settings." };
  return { done: true };
}
