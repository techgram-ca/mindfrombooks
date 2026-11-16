"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatUsd } from "@/lib/pricing";
import { track } from "@/lib/track";

export function RefundButton({
  enrollmentId,
  courseName,
  amountCents,
  deadline,
}: {
  enrollmentId: string;
  courseName: string;
  amountCents: number;
  deadline?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function refund() {
    setLoading(true);
    track("refund_requested", { course: courseName });
    try {
      const res = await fetch(`/api/refunds/${enrollmentId}`, { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "The refund didn't go through. Please try again.");
        return;
      }
      toast.success(
        `Refunded ${formatUsd(amountCents)}. It can take 5–10 business days to appear.`,
      );
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("The refund didn't go through. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Claim refund
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Refund {courseName}?</DialogTitle>
        <DialogDescription>
          We&apos;ll send {formatUsd(amountCents)} back to your original payment method right away.
          No questions asked. You&apos;ll keep read-only access to your journal.
          {deadline ? ` You can also decide later — the guarantee is open until ${deadline}.` : ""}
        </DialogDescription>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button variant="ghost" disabled={loading}>
              Keep the course
            </Button>
          </DialogClose>
          <Button onClick={refund} disabled={loading}>
            {loading && <Loader2 className="animate-spin" aria-hidden />}
            {loading ? "Refunding…" : `Refund ${formatUsd(amountCents)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
