import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CertificateCard } from "@/components/shared/certificate-card";
import { Logo } from "@/components/shared/logo";
import { getCertificate } from "@/lib/queries/certificates";

type Params = Promise<{ certificateId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { certificateId } = await params;
  const cert = await getCertificate(certificateId);
  if (!cert) return { title: "Certificate not found", robots: { index: false } };
  const title = `${cert.certificate.name_on_certificate} completed ${cert.courseName}`;
  const description = `${cert.certificate.days_completed} of ${cert.totalDays} days of daily action on mindfrombooks.`;
  const image = `/api/og/certificate/${certificateId}`;
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function CertificatePage({ params }: { params: Params }) {
  const { certificateId } = await params;
  const cert = await getCertificate(certificateId);
  if (!cert) notFound();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="container-page py-5">
        <Logo />
      </header>
      <main className="container-narrow flex-1 py-8">
        <CertificateCard cert={cert} />
        <section className="mt-10 text-center">
          <h1 className="text-2xl font-semibold">
            One small task a day. That&apos;s how this happened.
          </h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md">
            {cert.courseName} is a {cert.totalDays}-day course: one action a day, one written
            response. Do the work and still not happy? One-click refund.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link
                href={`/courses/${cert.courseSlug}?utm_source=certificate&utm_medium=share&utm_campaign=certificate`}
              >
                Start your own
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/courses">See all courses</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
