"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { getLearnerState } from "@/lib/queries/learning";
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

const ratingSchema = z
  .object({
    enrollmentId: z.string().uuid(),
    stars: z.coerce.number().int().min(1, "Choose a star rating.").max(5),
    comment: z
      .string()
      .trim()
      .max(600, "Keep your comment under 600 characters.")
      .transform((v) => v || null),
    shareOk: z.boolean(),
    displayName: z
      .string()
      .trim()
      .max(60)
      .transform((v) => v || null),
    country: z
      .string()
      .trim()
      .max(60)
      .transform((v) => v || null),
  })
  .superRefine((r, ctx) => {
    if (r.shareOk && !r.comment)
      ctx.addIssue({ code: "custom", message: "Add a comment to share it." });
    if (r.shareOk && !r.displayName)
      ctx.addIssue({ code: "custom", message: "Add the name to show with your comment." });
  });

/** Star rating asked for on the completion screen. Editable; only shared if the learner says so. */
export async function rateCourseAction(input: unknown): Promise<ActionState> {
  const profile = await getSessionProfile();
  if (!profile) return { error: "Please log in again." };
  const parsed = ratingSchema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const r = parsed.data;

  const { views } = await getLearnerState(profile);
  const view = views.find((v) => v.enrollment.id === r.enrollmentId);
  if (!view) return { error: "We couldn't find that course." };
  if (!view.progress.isComplete)
    return { error: "You can rate the course once you've finished it." };

  const db = createAdminClient();
  const { data: existing } = await db
    .from("course_ratings")
    .select("comment, share_ok, display_name, country, is_published")
    .eq("enrollment_id", r.enrollmentId)
    .maybeSingle();
  // A published comment goes back for review if its wording, name or consent changes.
  const unchanged =
    existing &&
    existing.comment === r.comment &&
    existing.share_ok === r.shareOk &&
    existing.display_name === r.displayName &&
    existing.country === r.country;

  const { error } = await db.from("course_ratings").upsert(
    {
      enrollment_id: r.enrollmentId,
      user_id: profile.id,
      course_id: view.course.id,
      stars: r.stars,
      comment: r.comment,
      share_ok: r.shareOk,
      display_name: r.shareOk ? r.displayName : null,
      country: r.shareOk ? r.country : null,
      is_published: Boolean(unchanged && existing?.is_published && r.shareOk),
    },
    { onConflict: "enrollment_id" },
  );
  if (error) {
    console.error("[rating] save failed", error.message);
    return { error: "We couldn't save your rating. Please try again." };
  }
  revalidatePath(`/dashboard/courses/${view.course.slug}/complete`);
  return { message: "Thank you for rating the course." };
}
