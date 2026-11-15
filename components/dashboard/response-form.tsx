"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { MAX_RESPONSE_CHARS } from "@/lib/validators/responses";
import { track } from "@/lib/track";

interface Props {
  enrollmentId: string;
  courseSlug: string;
  courseName: string;
  dayNumber: number;
  totalDays: number;
  prompt: string;
  minChars: number;
  initialBody: string;
  accentColor: string;
}

interface Saved {
  streak: number;
  isFinalDay: boolean;
  edited: boolean;
}

async function celebrate(color: string) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const confetti = (await import("canvas-confetti")).default;
  void confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.7 },
    colors: [color, "#c8892b", "#172033", "#2f7d57"],
  });
}

export function ResponseForm(props: Props) {
  const router = useRouter();
  const [body, setBody] = useState(props.initialBody);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [error, setError] = useState<string | null>(null);
  const length = body.trim().length;
  const tooShort = length < Math.max(1, props.minChars);
  const isEdit = props.initialBody.length > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tooShort) {
      setError(
        props.minChars > 0
          ? `Write at least ${props.minChars} characters.`
          : "Write a few words about what you did today.",
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enrollmentId: props.enrollmentId, body }),
      });
      const data = (await res.json()) as Partial<Saved> & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "We couldn't save that. Please try again.");
        return;
      }
      setSaved({
        streak: data.streak ?? 0,
        isFinalDay: Boolean(data.isFinalDay),
        edited: Boolean(data.edited),
      });
      if (!data.edited) {
        void celebrate(props.accentColor);
        track("task_submitted", { course: props.courseSlug, day: props.dayNumber });
        if (data.isFinalDay) track("course_completed", { course: props.courseSlug });
      } else {
        toast.success("Response updated.");
      }
      router.refresh();
    } catch {
      setError("We couldn't save that. Check your connection — your text is still here.");
    } finally {
      setSaving(false);
    }
  }

  if (saved && !saved.edited) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="rounded-card border-success/25 bg-success-soft border p-6 text-center"
        role="status"
      >
        <div className="text-4xl" aria-hidden>
          {saved.isFinalDay ? "🏆" : "✅"}
        </div>
        <h2 className="mt-2 text-2xl font-semibold">
          {saved.isFinalDay ? `You finished ${props.courseName}!` : `Day ${props.dayNumber} done`}
        </h2>
        <p className="text-foreground/80 mt-2">
          {saved.isFinalDay
            ? `All ${props.totalDays} days are behind you. Your certificate is ready.`
            : `Day ${props.dayNumber + 1} unlocks tomorrow.`}
          {saved.streak > 1 && ` 🔥 ${saved.streak}-day streak.`}
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link
              href={
                saved.isFinalDay ? `/dashboard/courses/${props.courseSlug}/complete` : "/dashboard"
              }
            >
              {saved.isFinalDay ? "See my certificate" : "Back to today"}
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => setSaved(null)}>
            Edit my response
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="response" className="block font-serif text-lg font-semibold">
        {props.prompt || "What did you do today, and what did you notice?"}
      </label>
      <Textarea
        id="response"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={MAX_RESPONSE_CHARS}
        rows={7}
        placeholder="Write your response here…"
        aria-describedby="response-meta"
        aria-invalid={Boolean(error)}
      />
      <div
        id="response-meta"
        className="text-muted-foreground flex items-center justify-between text-sm"
      >
        <span>
          {props.minChars > 0 && length < props.minChars
            ? `${props.minChars - length} more characters to go`
            : "You can edit this until midnight."}
        </span>
        <span aria-live="polite">
          {length}/{MAX_RESPONSE_CHARS}
        </span>
      </div>
      {error && (
        <p role="alert" className="bg-danger-soft text-danger rounded-xl px-3.5 py-2.5 text-sm">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={saving}>
        {saving && <Loader2 className="animate-spin" aria-hidden />}
        {saving ? "Saving…" : isEdit ? "Update response" : `Submit Day ${props.dayNumber}`}
      </Button>
    </form>
  );
}
