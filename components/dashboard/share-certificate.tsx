"use client";
import { Download, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/track";

export function ShareCertificate({
  certificateId,
  courseSlug,
}: {
  certificateId: string;
  courseSlug: string;
}) {
  const publicPath = `/c/${certificateId}`;

  async function copyLink() {
    const url = `${window.location.origin}${publicPath}`;
    track("certificate_shared", { course: courseSlug, method: "link" });
    try {
      if (navigator.share) {
        await navigator.share({ title: "My mindfrombooks certificate", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch {
      // share sheet dismissed — nothing to do
    }
  }

  return (
    <div className="flex flex-col justify-center gap-2 sm:flex-row">
      <Button asChild>
        <a
          href={`/api/og/certificate/${certificateId}?format=story`}
          download={`mindfrombooks-${courseSlug}.png`}
          onClick={() => track("certificate_shared", { course: courseSlug, method: "story" })}
        >
          <Download aria-hidden /> Share to story
        </a>
      </Button>
      <Button variant="outline" onClick={copyLink}>
        <Link2 aria-hidden /> Share link
      </Button>
    </div>
  );
}
