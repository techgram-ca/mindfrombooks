import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Certificate } from "@/lib/types";

export interface CertificateView {
  certificate: Certificate;
  courseName: string;
  courseSlug: string;
  courseEmoji: string;
  accentColor: string;
  totalDays: number;
  issuedLabel: string;
}

/** Certificates are public by their unguessable id; nothing else about the learner is exposed. */
export async function getCertificate(id: string): Promise<CertificateView | null> {
  if (!/^[a-z0-9]{6,20}$/.test(id) || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const { data } = await createAdminClient()
    .from("certificates")
    .select("*, enrollments!inner(courses!inner(name, slug, emoji, accent_color, days))")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const { enrollments, ...certificate } = data as Certificate & {
    enrollments: {
      courses: { name: string; slug: string; emoji: string; accent_color: string; days: number };
    };
  };
  const course = enrollments.courses;
  return {
    certificate,
    courseName: course.name,
    courseSlug: course.slug,
    courseEmoji: course.emoji,
    accentColor: course.accent_color,
    totalDays: course.days,
    issuedLabel: new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(
      new Date(certificate.issued_at),
    ),
  };
}
