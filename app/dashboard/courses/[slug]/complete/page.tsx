import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { RatingForm, type ExistingRating } from "@/components/dashboard/rating-form";
import { RefundStatus } from "@/components/dashboard/refund-status";
import { ShareCertificate } from "@/components/dashboard/share-certificate";
import { CourseCard } from "@/components/marketing/course-card";
import { CertificateCard } from "@/components/shared/certificate-card";
import { requireUser } from "@/lib/auth";
import { ensureCertificate } from "@/lib/completion";
import { getPublishedCourses } from "@/lib/queries/catalog";
import { getCertificate } from "@/lib/queries/certificates";
import { getLearnerState } from "@/lib/queries/learning";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Course complete" };

export default async function CompletePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await requireUser(`/dashboard/courses/${slug}/complete`);
  const { views } = await getLearnerState(profile);
  const view = views.find((v) => v.course.slug === slug);
  if (!view) notFound();
  if (view.enrollment.status === "revoked") redirect("/dashboard/courses");
  // Only once the course is over for this learner.
  if (!view.progress.isComplete) redirect(`/dashboard/courses/${slug}`);

  const issued = await ensureCertificate(
    view.enrollment,
    profile.name,
    view.progress.respondedCount,
  );
  const cert = issued ? await getCertificate(issued.id) : null;
  const owned = new Set(views.map((v) => v.course.id));
  const next = (await getPublishedCourses()).filter((c) => !owned.has(c.id)).slice(0, 2);
  const { progress, course } = view;
  const { data: ratingRow, error: ratingError } = await createAdminClient()
    .from("course_ratings")
    .select("stars, comment, share_ok, display_name, country, is_published")
    .eq("enrollment_id", view.enrollment.id)
    .maybeSingle();
  if (ratingError) console.error("[complete] rating lookup:", ratingError.message);
  const rating = (ratingRow as ExistingRating | null) ?? null;

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="text-5xl" aria-hidden>
          🏆
        </div>
        <h1 className="mt-3 text-3xl font-semibold">You finished {course.name}</h1>
        <p className="text-muted-foreground mt-2">
          {progress.respondedCount} of {course.days} days done
          {progress.missedDays.length === 0
            ? " — not a single day missed."
            : `, ${progress.missedDays.length} missed.`}
        </p>
      </header>

      {cert ? (
        <section aria-label="Your certificate" className="space-y-5">
          <CertificateCard cert={cert} />
          <ShareCertificate certificateId={cert.certificate.id} courseSlug={course.slug} />
        </section>
      ) : (
        <p className="text-muted-foreground text-center">
          A certificate needs at least one completed day, so there isn&apos;t one for this course.
        </p>
      )}

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-xl font-semibold">Rate {course.name}</h2>
          <RatingForm
            key={rating ? `${rating.stars}-${rating.is_published}` : "new"}
            enrollmentId={view.enrollment.id}
            courseSlug={course.slug}
            firstName={profile.name.trim().split(/\s+/)[0] ?? ""}
            existing={rating}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-xl font-semibold">The guarantee</h2>
          {progress.refundEligible && (
            <p className="text-muted-foreground text-[15px]">
              You did the work, so this is yours to use. If the course didn&apos;t change anything
              for you, take your money back — one click, no questions.
            </p>
          )}
          <RefundStatus view={view} />
        </CardBody>
      </Card>

      <section aria-labelledby="next-title">
        <h2 id="next-title" className="mb-3 text-xl font-semibold">
          Start your next course
        </h2>
        {next.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {next.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            You&apos;ve taken every course. That&apos;s remarkable.
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/dashboard/courses/${slug}/journal`}>Read my journal</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
