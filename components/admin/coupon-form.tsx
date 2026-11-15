"use client";
import { useState } from "react";
import { saveCouponAction } from "@/app/admin/actions";
import { useSave } from "@/components/admin/use-save";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label, Select } from "@/components/ui/input";
import type { Coupon } from "@/lib/types";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function CouponForm({
  coupon,
  courses,
  onDone,
}: {
  coupon?: Coupon;
  courses: { id: string; name: string }[];
  onDone?: () => void;
}) {
  const { pending, error, save } = useSave();
  const [f, setF] = useState({
    code: coupon?.code ?? "",
    discount_type: coupon?.amount_off_cents != null ? "amount" : "percent",
    discount_value: coupon
      ? String(coupon.percent_off ?? (coupon.amount_off_cents ?? 0) / 100)
      : "",
    max_redemptions: coupon?.max_redemptions != null ? String(coupon.max_redemptions) : "",
    expires_at: toLocalInput(coupon?.expires_at ?? null),
    source_label: coupon?.source_label ?? "",
    one_per_user: coupon?.one_per_user ?? true,
    active: coupon?.active ?? true,
  });
  const [courseIds, setCourseIds] = useState<string[]>(coupon?.course_ids ?? []);
  const set =
    (key: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF((p) => ({ ...p, [key]: e.target.value }));
  const uid = coupon?.id ?? "new";

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        save(
          () =>
            saveCouponAction({
              ...f,
              id: coupon?.id,
              course_ids: courseIds,
              // Send the expiry as an absolute time in the admin's own timezone.
              expires_at: f.expires_at ? new Date(f.expires_at).toISOString() : "",
            }),
          onDone,
        );
      }}
    >
      <div>
        <Label htmlFor={`code-${uid}`}>Code</Label>
        <Input
          id={`code-${uid}`}
          value={f.code}
          onChange={(e) => setF((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
          required
        />
      </div>
      <div>
        <Label htmlFor={`label-${uid}`}>Source label</Label>
        <Input
          id={`label-${uid}`}
          value={f.source_label}
          onChange={set("source_label")}
          placeholder="reel-48laws-law12"
        />
        <FieldHint>Where you shared it — used in the campaign report.</FieldHint>
      </div>
      <div>
        <Label htmlFor={`type-${uid}`}>Discount</Label>
        <div className="flex gap-2">
          <Select
            id={`type-${uid}`}
            className="w-40"
            value={f.discount_type}
            onChange={set("discount_type")}
          >
            <option value="percent">% off</option>
            <option value="amount">US$ off</option>
          </Select>
          <Input
            aria-label="Discount value"
            type="number"
            min={0}
            step={f.discount_type === "percent" ? 1 : 0.01}
            value={f.discount_value}
            onChange={set("discount_value")}
            required
          />
        </div>
        <FieldHint>100% off makes a course free (no Stripe, no refund).</FieldHint>
      </div>
      <div>
        <Label htmlFor={`max-${uid}`}>Max redemptions</Label>
        <Input
          id={`max-${uid}`}
          type="number"
          min={1}
          value={f.max_redemptions}
          onChange={set("max_redemptions")}
          placeholder="Unlimited"
        />
      </div>
      <div>
        <Label htmlFor={`exp-${uid}`}>Expires</Label>
        <Input
          id={`exp-${uid}`}
          type="datetime-local"
          value={f.expires_at}
          onChange={set("expires_at")}
        />
        <FieldHint>Your local time. Leave empty for no expiry.</FieldHint>
      </div>
      <div className="space-y-2 pt-1">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="size-4"
            checked={f.one_per_user}
            onChange={(e) => setF((p) => ({ ...p, one_per_user: e.target.checked }))}
          />
          One use per person
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="size-4"
            checked={f.active}
            onChange={(e) => setF((p) => ({ ...p, active: e.target.checked }))}
          />
          Active
        </label>
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="mb-1.5 text-sm font-medium">Valid for</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {courses.map((c) => (
            <label key={c.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4"
                checked={courseIds.includes(c.id)}
                onChange={(e) =>
                  setCourseIds((ids) =>
                    e.target.checked ? [...ids, c.id] : ids.filter((x) => x !== c.id),
                  )
                }
              />
              {c.name}
            </label>
          ))}
        </div>
        <FieldHint>
          {courseIds.length === 0
            ? "Nothing ticked = every course and All Access."
            : "Only the ticked courses (not All Access)."}
        </FieldHint>
      </fieldset>
      {error && (
        <p role="alert" className="text-danger text-sm sm:col-span-2">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : coupon ? "Save coupon" : "Create coupon"}
        </Button>
      </div>
    </form>
  );
}
