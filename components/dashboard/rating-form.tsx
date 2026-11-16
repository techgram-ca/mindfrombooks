"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { rateCourseAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label, Textarea } from "@/components/ui/input";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

export interface ExistingRating {
  stars: number;
  comment: string | null;
  share_ok: boolean;
  display_name: string | null;
  country: string | null;
  is_published: boolean;
}

const LABELS = ["", "Not for me", "It was okay", "Good", "Very good", "Changed something for me"];
const COUNTRIES = [
  "India",
  "United States",
  "Canada",
  "Australia",
  "United Kingdom",
  "New Zealand",
  "Pakistan",
  "Philippines",
  "Nigeria",
  "Singapore",
  "UAE",
  "Germany",
];

export function RatingForm({
  enrollmentId,
  courseSlug,
  firstName,
  existing,
}: {
  enrollmentId: string;
  courseSlug: string;
  firstName: string;
  existing: ExistingRating | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [shareOk, setShareOk] = useState(existing?.share_ok ?? false);
  const [displayName, setDisplayName] = useState(existing?.display_name ?? firstName);
  const [country, setCountry] = useState(existing?.country ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(Boolean(existing));
  const shown = hover || stars;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stars) {
      setError("Choose a star rating.");
      return;
    }
    setError(null);
    start(async () => {
      const result = await rateCourseAction({
        enrollmentId,
        stars,
        comment,
        shareOk,
        displayName,
        country,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      if (!existing) track("course_rated", { course: courseSlug, stars });
      toast.success(result.message ?? "Thank you.");
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-[15px] font-medium">How would you rate this course?</legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer p-1" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name="stars"
                value={n}
                checked={stars === n}
                onChange={() => {
                  setStars(n);
                  setSaved(false);
                }}
                className="peer sr-only"
              />
              <span className="sr-only">
                {n} {n === 1 ? "star" : "stars"} — {LABELS[n]}
              </span>
              <Star
                aria-hidden
                className={cn(
                  "peer-focus-visible:ring-ring size-9 rounded transition-colors peer-focus-visible:ring-2",
                  n <= shown ? "fill-accent text-accent" : "text-border",
                )}
              />
            </label>
          ))}
        </div>
        <p className="text-muted-foreground mt-1 h-5 text-sm" aria-live="polite">
          {shown ? LABELS[shown] : ""}
        </p>
      </fieldset>

      <div>
        <Label htmlFor="rating-comment">What changed for you? (optional)</Label>
        <Textarea
          id="rating-comment"
          rows={3}
          className="min-h-0"
          maxLength={600}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setSaved(false);
          }}
          placeholder="One or two sentences is perfect."
        />
      </div>

      <label className="flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-4"
          checked={shareOk}
          onChange={(e) => {
            setShareOk(e.target.checked);
            setSaved(false);
          }}
        />
        <span>
          You can show my comment on the course page.
          <span className="text-muted-foreground block">
            We check every comment before it appears.
          </span>
        </span>
      </label>

      {shareOk && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="rating-name">Name to show</Label>
            <Input
              id="rating-name"
              value={displayName}
              maxLength={60}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <FieldHint>A first name is enough.</FieldHint>
          </div>
          <div>
            <Label htmlFor="rating-country">Country (optional)</Label>
            <Input
              id="rating-country"
              list="rating-countries"
              value={country}
              maxLength={60}
              onChange={(e) => setCountry(e.target.value)}
            />
            <datalist id="rating-countries">
              {COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="bg-danger-soft text-danger rounded-xl px-3.5 py-2.5 text-sm">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {existing ? "Update my rating" : "Send rating"}
        </Button>
        {saved && existing && (
          <span className="text-muted-foreground text-sm">
            {existing.is_published
              ? "Your comment is live on the course page."
              : "Saved — thank you."}
          </span>
        )}
      </div>
    </form>
  );
}
