"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin, HttpError } from "@/lib/auth";
import { addDays, startDateForEnrollment, todayInTz } from "@/lib/course-days";
import { renderTemplate } from "@/lib/email";
import { sendAdminInviteEmail } from "@/lib/emails";
import { processRefund } from "@/lib/refund-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseTaskImport } from "@/lib/task-import";
import { siteUrl } from "@/lib/utils";
import {
  couponSchema,
  courseSchema,
  emailTemplateSchema,
  grantSchema,
  manualTestimonialSchema,
  settingsSchema,
  taskSchema,
  testimonialSchema,
} from "@/lib/validators/admin";
import { z } from "zod";
import type { Course, Enrollment, Profile } from "@/lib/types";

export interface AdminResult {
  error?: string;
  message?: string;
  id?: string;
  html?: string;
}

const uuid = z.string().uuid();

function issue(error: z.ZodError): AdminResult {
  return { error: error.issues[0]?.message ?? "Please check the form." };
}

/** Public pages are cached; refresh them after any catalog or settings change. */
function refreshSite() {
  revalidatePath("/", "layout");
}

// ------------------------------------------------------------------ courses
export async function saveCourseAction(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const { id, books, phases, price_dollars, ...fields } = parsed.data;
  const db = createAdminClient();
  const row = { ...fields, price_cents: Math.round(price_dollars * 100), currency: "usd" };

  const { data: saved, error } = id
    ? await db.from("courses").update(row).eq("id", id).select("id").single()
    : await db.from("courses").insert(row).select("id").single();
  if (error) {
    return {
      error: error.code === "23505" ? "Another course already uses that slug." : error.message,
    };
  }
  const courseId = saved.id as string;

  await db.from("course_books").delete().eq("course_id", courseId);
  if (books.length > 0) {
    const { error: e } = await db
      .from("course_books")
      .insert(books.map((b, i) => ({ ...b, course_id: courseId, sort_order: i })));
    if (e) return { error: `Saved the course, but not its books: ${e.message}` };
  }
  await db.from("course_phases").delete().eq("course_id", courseId);
  if (phases.length > 0) {
    const { error: e } = await db
      .from("course_phases")
      .insert(phases.map((p) => ({ ...p, course_id: courseId })));
    if (e) return { error: `Saved the course, but not its phases: ${e.message}` };
  }

  // Make sure every day has a task. Tasks beyond the course length are kept
  // (hidden), so shortening a course for a test never destroys content.
  const placeholders = Array.from({ length: fields.days }, (_, i) => ({
    course_id: courseId,
    day_number: i + 1,
    title: `Day ${i + 1} — coming soon`,
    response_prompt: "What did you do today, and what did you notice?",
  }));
  const { error: taskError } = await db
    .from("tasks")
    .upsert(placeholders, { onConflict: "course_id,day_number", ignoreDuplicates: true });
  if (taskError)
    return { error: `Saved the course, but could not create its tasks: ${taskError.message}` };

  refreshSite();
  return { message: "Course saved.", id: courseId };
}

// ------------------------------------------------------------------ tasks
export async function saveTaskAction(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const { id, ...fields } = parsed.data;
  const { error } = await createAdminClient().from("tasks").update(fields).eq("id", id);
  if (error) return { error: error.message };
  refreshSite();
  return { message: "Task saved." };
}

export async function reorderTasksAction(
  courseId: string,
  taskIds: string[],
): Promise<AdminResult> {
  await requireAdmin();
  const parsed = z
    .object({ courseId: uuid, taskIds: z.array(uuid).min(1).max(400) })
    .safeParse({ courseId, taskIds });
  if (!parsed.success) return issue(parsed.error);
  const { error } = await createAdminClient().rpc("reorder_tasks", {
    p_course_id: parsed.data.courseId,
    p_task_ids: parsed.data.taskIds,
  });
  if (error) return { error: error.message };
  refreshSite();
  return { message: "Order saved." };
}

export async function importTasksAction(courseId: string, raw: string): Promise<AdminResult> {
  await requireAdmin();
  if (!uuid.safeParse(courseId).success) return { error: "Unknown course." };
  if (raw.length > 2_000_000) return { error: "That file is too large." };
  const db = createAdminClient();
  const { data: course } = await db.from("courses").select("days").eq("id", courseId).maybeSingle();
  if (!course) return { error: "Unknown course." };
  // Validated again here — the browser preview is only a convenience.
  const { tasks, errors } = parseTaskImport(raw, course.days as number);
  if (errors.length > 0) return { error: `Fix ${errors.length} problem(s) first. ${errors[0]}` };
  const { error } = await db.from("tasks").upsert(
    tasks.map((t) => ({ ...t, course_id: courseId })),
    { onConflict: "course_id,day_number" },
  );
  if (error) return { error: error.message };
  refreshSite();
  return { message: `Imported ${tasks.length} task${tasks.length === 1 ? "" : "s"}.` };
}

// ------------------------------------------------------------------ coupons
export async function saveCouponAction(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const c = parsed.data;
  const row = {
    code: c.code,
    percent_off: c.discount_type === "percent" ? c.discount_value : null,
    amount_off_cents: c.discount_type === "amount" ? Math.round(c.discount_value * 100) : null,
    course_ids: c.course_ids.length > 0 ? c.course_ids : null,
    max_redemptions: c.max_redemptions,
    one_per_user: c.one_per_user,
    expires_at: c.expires_at ? c.expires_at.toISOString() : null,
    source_label: c.source_label,
    active: c.active,
  };
  const db = createAdminClient();
  const { error } = c.id
    ? await db.from("coupons").update(row).eq("id", c.id)
    : await db.from("coupons").insert(row);
  if (error) return { error: error.code === "23505" ? "That code already exists." : error.message };
  revalidatePath("/admin/coupons");
  return { message: "Coupon saved." };
}

export async function setCouponActiveAction(id: string, active: boolean): Promise<AdminResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { error: "Unknown coupon." };
  const { error } = await createAdminClient().from("coupons").update({ active }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
  return { message: active ? "Coupon activated." : "Coupon deactivated." };
}

// ------------------------------------------------------------------ settings + emails
export async function saveSettingsAction(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const { error } = await createAdminClient()
    .from("app_settings")
    .update(parsed.data)
    .eq("id", true);
  if (error) return { error: error.message };
  refreshSite();
  return { message: "Settings saved." };
}

const SAMPLE_VARS: Record<string, string | number> = {
  name: "Aman",
  course_name: "Fix Your Money",
  courses: "Fix Your Money, Build Discipline",
  day: 12,
  days: 31,
  responded: 31,
  task_title: "Find your 3 money leaks",
  amount: "US$9.99",
  start_line: "Day 1 opens tomorrow morning, at midnight your time.",
  guarantee_line:
    "Remember the guarantee: respond on every single day, and if you're not happy at the end you get a one-click refund.",
  more_line: "\n\nYou also have 1 more task waiting today.",
  grace_line: "\n\nYou're still covered by the refund guarantee — 1 grace day left.",
  refund_line:
    "You did the work, so the guarantee is yours: if you're not happy, [get a one-click refund](https://example.com). No questions asked.",
  next_course_line:
    "**Build Discipline** is a good next step — [browse the courses](https://example.com).",
};

export async function previewEmailAction(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = emailTemplateSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const email = await renderTemplate(parsed.data, SAMPLE_VARS, {
    buttonUrl: siteUrl("/dashboard"),
    unsubscribeUrl: siteUrl("/unsubscribe"),
  });
  return { html: email.html, message: email.subject };
}

export async function saveEmailTemplateAction(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = emailTemplateSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const { error } = await createAdminClient()
    .from("email_templates")
    .upsert(parsed.data, { onConflict: "key" });
  if (error) return { error: error.message };
  revalidatePath("/admin/emails");
  return { message: "Email saved." };
}

// ------------------------------------------------------------------ users + access
async function grantCourses(admin: Profile, user: Profile, courses: Course[]): Promise<number> {
  const db = createAdminClient();
  const rows = courses.map((course) => ({
    user_id: user.id,
    course_id: course.id,
    source: "admin_grant",
    amount_paid_cents: 0,
    granted_by: admin.id,
    // Known timezone → starts tomorrow. Brand-new invitee → they tap Start
    // once they've logged in, so Day 1 lands in their real timezone.
    start_date: user.timezone_confirmed ? startDateForEnrollment(user.timezone) : null,
    timezone: user.timezone,
    grace_days: course.grace_days,
  }));
  const { data, error } = await db
    .from("enrollments")
    .upsert(rows, { onConflict: "user_id,course_id", ignoreDuplicates: true })
    .select("id");
  if (error) throw new HttpError(500, error.message);
  return data?.length ?? 0;
}

/** Create (or find) a user, give them free access, and email a set-password link. */
export async function createUserAndGrantAction(input: unknown): Promise<AdminResult> {
  const admin = await requireAdmin();
  const parsed = grantSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const { email, name, course_ids } = parsed.data;
  const db = createAdminClient();

  const { data: courses } = await db.from("courses").select("*").in("id", course_ids);
  if (!courses || courses.length === 0) return { error: "Pick at least one course." };

  try {
    const { data: existing } = await db
      .from("profiles")
      .select("*")
      .ilike("email", email)
      .maybeSingle();
    let user = existing as Profile | null;
    let actionUrl = siteUrl("/login");

    if (!user) {
      // Creates the auth user and gives us a one-time token for our own email.
      const { data: link, error } = await db.auth.admin.generateLink({
        type: "invite",
        email,
        options: { data: { name } },
      });
      if (error || !link.user) return { error: error?.message ?? "Could not create that user." };
      actionUrl = siteUrl(
        `/auth/callback?token_hash=${link.properties.hashed_token}&type=invite&next=${encodeURIComponent("/reset-password")}`,
      );
      const { data: created } = await db
        .from("profiles")
        .select("*")
        .eq("id", link.user.id)
        .single();
      user = created as Profile;
    }

    const granted = await grantCourses(admin, user, courses as Course[]);
    const mail = await sendAdminInviteEmail({
      user,
      courseNames: (courses as Course[]).map((c) => c.name),
      actionUrl,
    });
    revalidatePath("/admin/users");
    return {
      id: user.id,
      message:
        `${existing ? "Existing user" : "User created"} · ${granted} course${granted === 1 ? "" : "s"} granted` +
        (mail.status === "sent"
          ? " · invite email sent."
          : ` · but the email was not sent (${mail.status}). Share this link by hand: ${actionUrl}`),
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function grantCourseAction(userId: string, courseId: string): Promise<AdminResult> {
  const admin = await requireAdmin();
  if (!uuid.safeParse(userId).success || !uuid.safeParse(courseId).success)
    return { error: "Invalid request." };
  const db = createAdminClient();
  const [{ data: user }, { data: course }] = await Promise.all([
    db.from("profiles").select("*").eq("id", userId).maybeSingle(),
    db.from("courses").select("*").eq("id", courseId).maybeSingle(),
  ]);
  if (!user || !course) return { error: "User or course not found." };
  try {
    const granted = await grantCourses(admin, user as Profile, [course as Course]);
    revalidatePath(`/admin/users/${userId}`);
    return granted > 0
      ? { message: `Granted ${(course as Course).name}.` }
      : { error: "They already have that course." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function revokeEnrollmentAction(enrollmentId: string): Promise<AdminResult> {
  await requireAdmin();
  if (!uuid.safeParse(enrollmentId).success) return { error: "Invalid request." };
  const { data, error } = await createAdminClient()
    .from("enrollments")
    .update({ status: "revoked" })
    .eq("id", enrollmentId)
    .in("status", ["active", "completed"])
    .select("user_id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "That enrollment can't be revoked." };
  revalidatePath(`/admin/users/${data[0].user_id as string}`);
  return { message: "Access revoked." };
}

export async function restoreEnrollmentAction(enrollmentId: string): Promise<AdminResult> {
  await requireAdmin();
  if (!uuid.safeParse(enrollmentId).success) return { error: "Invalid request." };
  const { data, error } = await createAdminClient()
    .from("enrollments")
    .update({ status: "active" })
    .eq("id", enrollmentId)
    .eq("status", "revoked")
    .select("user_id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "That enrollment isn't revoked." };
  revalidatePath(`/admin/users/${data[0].user_id as string}`);
  return { message: "Access restored." };
}

const setDaySchema = z.object({
  enrollmentId: uuid,
  // -1 = not started (the learner has to tap Start), 0 = starts tomorrow
  day: z.coerce.number().int().min(-1).max(367),
  responses: z.enum(["keep", "fill", "clear"]),
});

/**
 * Testing tool: move a learner to any day of a course by shifting the
 * enrollment's start date. -1 = "not started"; day 0 = "starts tomorrow"; a day past the end =
 * "finished yesterday". Optionally mark the earlier days as answered (to see
 * the on-track / refund-eligible states) or clear every response.
 */
export async function setEnrollmentDayAction(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = setDaySchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const { enrollmentId, responses } = parsed.data;
  const db = createAdminClient();
  const { data } = await db
    .from("enrollments")
    .select("*, courses(*)")
    .eq("id", enrollmentId)
    .maybeSingle();
  const row = data as (Enrollment & { courses: Course }) | null;
  if (!row) return { error: "Enrollment not found." };
  if (row.status === "refunded" || row.status === "revoked") {
    return { error: `This enrollment is ${row.status}, so its day can't be changed.` };
  }
  const total = row.courses.days;
  const day = Math.min(parsed.data.day, total + 1);
  const today = todayInTz(row.timezone);
  // -1 → no start date, day 0 → tomorrow, day 1 → today
  const startDate = day < 0 ? null : addDays(today, 1 - day);

  const { error } = await db
    .from("enrollments")
    // Re-open it; if the course is now over, the usual completion step closes it again.
    .update({ start_date: startDate, status: "active", completed_at: null })
    .eq("id", row.id);
  if (error) return { error: error.message };

  if (responses === "clear") {
    await db.from("responses").delete().eq("enrollment_id", row.id);
    await db.from("certificates").delete().eq("enrollment_id", row.id);
  } else if (responses === "fill" && day > 1) {
    const upTo = Math.min(day - 1, total);
    const { data: tasks } = await db
      .from("tasks")
      .select("id, day_number")
      .eq("course_id", row.course_id)
      .lte("day_number", upTo);
    const taskOf = new Map((tasks ?? []).map((t) => [t.day_number as number, t.id as string]));
    const rows = Array.from({ length: upTo }, (_, i) => ({
      enrollment_id: row.id,
      user_id: row.user_id,
      task_id: taskOf.get(i + 1) ?? null,
      day_number: i + 1,
      body: "(Test response added from the admin portal.)",
    }));
    const { error: fillError } = await db
      .from("responses")
      .upsert(rows, { onConflict: "enrollment_id,day_number", ignoreDuplicates: true });
    if (fillError)
      return { error: `Day changed, but the test responses failed: ${fillError.message}` };
  }

  revalidatePath(`/admin/users/${row.user_id}`);
  return {
    message:
      day < 0
        ? `${row.courses.name} is back to not started — the learner taps Start to begin.`
        : day === 0
          ? `${row.courses.name} now starts tomorrow.`
          : day > total
            ? `${row.courses.name} now finished yesterday.`
            : `${row.courses.name} is now on Day ${day} of ${total}.`,
  };
}

/** Refund a paid enrollment regardless of the guarantee rules. */
export async function manualRefundAction(enrollmentId: string): Promise<AdminResult> {
  const admin = await requireAdmin();
  if (!uuid.safeParse(enrollmentId).success) return { error: "Invalid request." };
  try {
    const result = await processRefund({ enrollmentId, type: "admin_manual", actor: admin });
    revalidatePath("/admin", "layout");
    return {
      message: `Refunded ${(result.amountCents / 100).toFixed(2)} USD for ${result.courseName}.`,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "The refund failed." };
  }
}

export async function setRoleAction(userId: string, role: "user" | "admin"): Promise<AdminResult> {
  const admin = await requireAdmin();
  if (!uuid.safeParse(userId).success) return { error: "Invalid request." };
  if (userId === admin.id && role !== "admin")
    return { error: "You can't remove your own admin access." };
  const { error } = await createAdminClient().from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/users/${userId}`);
  return { message: role === "admin" ? "Made admin." : "Admin access removed." };
}

// ------------------------------------------------------------------ testimonials
export async function saveTestimonialAction(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const { id, ...fields } = parsed.data;
  const { error } = await createAdminClient().from("responses").update(fields).eq("id", id);
  if (error) return { error: error.message };
  refreshSite();
  return { message: fields.is_starred ? "Shown as a testimonial." : "Removed from testimonials." };
}

// ------------------------------------------------------------------ ratings + testimonials
export async function setRatingPublishedAction(
  id: string,
  published: boolean,
): Promise<AdminResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { error: "Invalid request." };
  const db = createAdminClient();
  const { data } = await db
    .from("course_ratings")
    .select("share_ok, comment")
    .eq("id", id)
    .maybeSingle();
  if (!data) return { error: "Rating not found." };
  if (published && (!data.share_ok || !data.comment)) {
    return { error: "The learner didn't agree to share this comment, so it can't be published." };
  }
  const { error } = await db
    .from("course_ratings")
    .update({ is_published: published })
    .eq("id", id);
  if (error) return { error: error.message };
  refreshSite();
  revalidatePath("/admin/testimonials");
  return { message: published ? "Published on the course page." : "Hidden from the course page." };
}

/** A real quote received outside the app, recorded with where it came from. */
export async function saveManualTestimonialAction(input: unknown): Promise<AdminResult> {
  const admin = await requireAdmin();
  const parsed = manualTestimonialSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const { id, ...row } = parsed.data;
  const db = createAdminClient();
  const { error } = id
    ? await db.from("testimonials").update(row).eq("id", id)
    : await db.from("testimonials").insert({ ...row, created_by: admin.id });
  if (error) return { error: error.message };
  refreshSite();
  revalidatePath("/admin/testimonials");
  return { message: id ? "Testimonial saved." : "Testimonial added." };
}

export async function setManualTestimonialPublishedAction(
  id: string,
  published: boolean,
): Promise<AdminResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { error: "Invalid request." };
  const { error } = await createAdminClient()
    .from("testimonials")
    .update({ is_published: published })
    .eq("id", id);
  if (error) return { error: error.message };
  refreshSite();
  revalidatePath("/admin/testimonials");
  return { message: published ? "Published." : "Hidden." };
}

export async function deleteManualTestimonialAction(id: string): Promise<AdminResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { error: "Invalid request." };
  const { error } = await createAdminClient().from("testimonials").delete().eq("id", id);
  if (error) return { error: error.message };
  refreshSite();
  revalidatePath("/admin/testimonials");
  return { message: "Deleted." };
}
