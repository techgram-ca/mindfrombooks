import "server-only";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCourseCompleteEmail } from "@/lib/emails";
import type { Progress } from "@/lib/refunds";
import type { Certificate, Course, Enrollment, Profile } from "@/lib/types";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no look-alikes

export function newCertificateId(): string {
  const bytes = randomBytes(10);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Issue (or return) the certificate for a finished enrollment. */
export async function ensureCertificate(
  enrollment: Enrollment,
  name: string,
  daysCompleted: number,
): Promise<Certificate | null> {
  const db = createAdminClient();
  const { data: existing } = await db
    .from("certificates")
    .select("*")
    .eq("enrollment_id", enrollment.id)
    .maybeSingle();
  if (existing) return existing as Certificate;
  if (daysCompleted < 1) return null; // nothing to certify
  const { data, error } = await db
    .from("certificates")
    .upsert(
      {
        id: newCertificateId(),
        enrollment_id: enrollment.id,
        user_id: enrollment.user_id,
        name_on_certificate: name.trim() || "A mindfrombooks learner",
        days_completed: daysCompleted,
      },
      { onConflict: "enrollment_id", ignoreDuplicates: true },
    )
    .select("*")
    .maybeSingle();
  if (error) {
    console.error("[completion] certificate failed", error.message);
    return null;
  }
  if (data) return data as Certificate;
  const { data: raced } = await db
    .from("certificates")
    .select("*")
    .eq("enrollment_id", enrollment.id)
    .maybeSingle();
  return (raced as Certificate | null) ?? null;
}

/**
 * Mark an enrollment whose final day has passed as completed, issue its
 * certificate and send the completion email. Runs from the cron job and also
 * lazily when the learner opens their dashboard; the status flip is atomic so
 * the email goes out exactly once.
 */
export async function completeEnrollment(input: {
  enrollment: Enrollment;
  course: Course;
  profile: Pick<Profile, "id" | "email" | "name">;
  progress: Progress;
  nextCourseName?: string | null;
}): Promise<boolean> {
  const { enrollment, course, profile, progress } = input;
  const db = createAdminClient();
  const { data: flipped, error } = await db
    .from("enrollments")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", enrollment.id)
    .eq("status", "active")
    .select("id");
  if (error) {
    console.error("[completion] status update failed", error.message);
    return false;
  }
  if (!flipped || flipped.length === 0) return false; // someone else got there first

  await ensureCertificate(enrollment, profile.name, progress.respondedCount);
  await sendCourseCompleteEmail({
    user: profile,
    enrollmentId: enrollment.id,
    courseName: course.name,
    courseSlug: course.slug,
    days: course.days,
    responded: progress.respondedCount,
    refundEligible: progress.refundEligible,
    refundDeadline: progress.refundDeadline,
    nextCourseName: input.nextCourseName ?? null,
  });
  return true;
}
