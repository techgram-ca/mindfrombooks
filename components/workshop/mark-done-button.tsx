"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MarkDoneButton({
  enrollmentId,
  lesson,
  done,
  nextHref,
}: {
  enrollmentId: string;
  lesson: number;
  done: boolean;
  nextHref: string | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    try {
      const res = await fetch("/api/lessons/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enrollmentId, lesson, done: !done }),
      });
      const data = (await res.json()) as { error?: string; done?: number; total?: number };
      if (!res.ok) {
        toast.error(data.error ?? "That didn't save. Please try again.");
        return;
      }
      if (!done) {
        toast.success(data.done === data.total ? "Workshop complete! 🎉" : `Lesson ${lesson} done`);
        if (nextHref) router.push(nextHref);
        else router.refresh();
      } else {
        router.refresh();
      }
    } catch {
      toast.error("That didn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button size="lg" variant={done ? "outline" : "primary"} onClick={toggle} disabled={saving}>
      {saving ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : done ? (
        <CheckCircle2 className="text-success" aria-hidden />
      ) : (
        <Circle aria-hidden />
      )}
      {done ? "Done — tap to undo" : nextHref ? "Mark as done & next" : "Mark as done"}
    </Button>
  );
}
