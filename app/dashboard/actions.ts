"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { isValidTimezone, startDateForEnrollment } from "@/lib/course-days";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validators/auth";

export interface ActionState {
  error?: string;
  message?: string;
}

export async function confirmTimezoneAction(timezone: string): Promise<void> {
  const profile = await getSessionProfile();
  if (!profile || profile.timezone_confirmed || !isValidTimezone(timezone)) return;
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ timezone, timezone_confirmed: true })
    .eq("id", profile.id);
}

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await getSessionProfile();
  if (!profile) return { error: "Please log in again." };
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    timezone: formData.get("timezone"),
    reminder_hour: formData.get("reminder_hour"),
    email_reminders: formData.get("email_reminders") === "on",
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, timezone_confirmed: true })
    .eq("id", profile.id);
  if (error) return { error: "We couldn't save your settings. Please try again." };
  revalidatePath("/dashboard", "layout");
  return { message: "Settings saved." };
}

/** Bundle courses wait for this: Day 1 opens the morning after the learner starts. */
export async function startCourseAction(enrollmentId: string): Promise<ActionState> {
  const profile = await getSessionProfile();
  if (!profile) return { error: "Please log in again." };
  if (!z.string().uuid().safeParse(enrollmentId).success) return { error: "Invalid course." };
  const db = createAdminClient();
  const { data, error } = await db
    .from("enrollments")
    .update({ start_date: startDateForEnrollment(profile.timezone), timezone: profile.timezone })
    .eq("id", enrollmentId)
    .eq("user_id", profile.id)
    .eq("status", "active")
    .is("start_date", null)
    .select("id");
  if (error || !data || data.length === 0)
    return { error: "We couldn't start that course. Please try again." };
  revalidatePath("/dashboard", "layout");
  return { message: "You're set — Day 1 opens tomorrow morning." };
}

export async function deleteAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await getSessionProfile();
  if (!profile) return { error: "Please log in again." };
  if (
    String(formData.get("confirm") ?? "")
      .trim()
      .toUpperCase() !== "DELETE"
  ) {
    return { error: "Type DELETE to confirm." };
  }
  const db = createAdminClient();
  // Removing the auth user cascades to the profile, enrollments and responses.
  // Orders and refunds are kept (without the user link) for accounting.
  const { error } = await db.auth.admin.deleteUser(profile.id);
  if (error) return { error: "We couldn't delete your account. Please contact us." };
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
