"use client";
import { useState } from "react";
import { saveManualTestimonialAction } from "@/app/admin/actions";
import { useSave } from "@/components/admin/use-save";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label, Select, Textarea } from "@/components/ui/input";

export interface ManualTestimonial {
  id: string;
  course_id: string | null;
  name: string;
  country: string | null;
  body: string;
  stars: number | null;
  source_note: string;
  is_published: boolean;
  is_dev_sample?: boolean;
}

/** Add or edit a real quote received outside the app (DM, email, comment). */
export function TestimonialForm({
  courses,
  testimonial,
  onDone,
}: {
  courses: { id: string; name: string }[];
  testimonial?: ManualTestimonial;
  onDone?: () => void;
}) {
  const { pending, error, save } = useSave();
  const uid = testimonial?.id ?? "new";
  const [f, setF] = useState({
    course_id: testimonial?.course_id ?? "",
    name: testimonial?.name ?? "",
    country: testimonial?.country ?? "",
    body: testimonial?.body ?? "",
    stars: testimonial?.stars != null ? String(testimonial.stars) : "",
    source_note: testimonial?.source_note ?? "",
    is_published: testimonial?.is_published ?? true,
  });
  const [confirmed, setConfirmed] = useState(Boolean(testimonial));
  const set =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        save(
          () =>
            saveManualTestimonialAction({
              ...f,
              id: testimonial?.id,
              permission_confirmed: confirmed,
            }),
          () => {
            if (!testimonial) {
              setF((p) => ({ ...p, name: "", country: "", body: "", stars: "", source_note: "" }));
              setConfirmed(false);
            }
            onDone?.();
          },
        );
      }}
    >
      <div>
        <Label htmlFor={`tc-${uid}`}>Course</Label>
        <Select id={`tc-${uid}`} value={f.course_id} onChange={set("course_id")}>
          <option value="">General (home page only)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor={`ts-${uid}`}>Stars they gave (optional)</Label>
        <Select id={`ts-${uid}`} value={f.stars} onChange={set("stars")}>
          <option value="">No rating</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "star" : "stars"}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor={`tn-${uid}`}>Name to show</Label>
        <Input id={`tn-${uid}`} value={f.name} onChange={set("name")} maxLength={60} required />
      </div>
      <div>
        <Label htmlFor={`tco-${uid}`}>Country</Label>
        <Input
          id={`tco-${uid}`}
          value={f.country}
          onChange={set("country")}
          maxLength={60}
          placeholder="e.g. India"
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`tb-${uid}`}>Quote</Label>
        <Textarea
          id={`tb-${uid}`}
          rows={3}
          className="min-h-0"
          value={f.body}
          onChange={set("body")}
          maxLength={600}
          required
        />
        <FieldHint>
          Use their words as they wrote them. Shorten if needed, but don&apos;t rewrite.
        </FieldHint>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`tsrc-${uid}`}>Where it came from</Label>
        <Input
          id={`tsrc-${uid}`}
          value={f.source_note}
          onChange={set("source_note")}
          maxLength={300}
          required
          placeholder="e.g. Instagram DM from @handle, 12 Nov 2026"
        />
        <FieldHint>
          Only you see this. Keep it so you can show the original if anyone asks.
        </FieldHint>
      </div>
      <label className="flex items-start gap-2.5 text-sm sm:col-span-2">
        <input
          type="checkbox"
          className="mt-0.5 size-4"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span>
          This is a real quote from a real customer, and they agreed to it being published with this
          name.
        </span>
      </label>
      <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
        <input
          type="checkbox"
          className="size-4"
          checked={f.is_published}
          onChange={(e) => setF((p) => ({ ...p, is_published: e.target.checked }))}
        />
        Show it on the site
      </label>
      {error && (
        <p role="alert" className="text-danger text-sm sm:col-span-2">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending || !confirmed}>
          {pending ? "Saving…" : testimonial ? "Save" : "Add testimonial"}
        </Button>
      </div>
    </form>
  );
}
