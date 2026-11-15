import type { CertificateView } from "@/lib/queries/certificates";

export function CertificateCard({ cert }: { cert: CertificateView }) {
  const all = cert.certificate.days_completed >= cert.totalDays;
  return (
    <div
      className="border-border bg-surface shadow-lift relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border p-7 text-center sm:p-9"
      style={{ borderTop: `8px solid ${cert.accentColor}` }}
    >
      <p className="font-serif text-lg font-semibold">
        mind<span className="text-accent-strong">from</span>books
      </p>
      <p className="text-muted-foreground mt-6 text-xs font-semibold tracking-[0.2em] uppercase">
        Certificate of completion
      </p>
      <p className="mt-4 font-serif text-3xl leading-tight font-semibold sm:text-4xl">
        {cert.certificate.name_on_certificate}
      </p>
      <p className="text-muted-foreground mt-4">showed up and did the work in</p>
      <p className="mt-2 font-serif text-2xl font-semibold" style={{ color: cert.accentColor }}>
        <span aria-hidden>{cert.courseEmoji} </span>
        {cert.courseName}
      </p>
      <p className="mt-4 text-[15px]">
        {all
          ? `All ${cert.totalDays} days completed`
          : `${cert.certificate.days_completed} of ${cert.totalDays} days completed`}
      </p>
      <p className="text-muted-foreground mt-6 text-sm">{cert.issuedLabel}</p>
      <p className="text-muted-foreground mt-1 text-xs">Books teach. Daily action changes you.</p>
    </div>
  );
}
