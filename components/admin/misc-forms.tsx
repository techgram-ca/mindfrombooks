"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star } from "lucide-react";
import {
  createUserAndGrantAction,
  grantCourseAction,
  previewEmailAction,
  saveEmailTemplateAction,
  saveSettingsAction,
  saveTestimonialAction,
  setEnrollmentDayAction,
} from "@/app/admin/actions";
import { useSave } from "@/components/admin/use-save";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FieldHint, Input, Label, Select, Textarea } from "@/components/ui/input";
import type { AppSettings, EmailTemplate } from "@/lib/types";

function ErrorLine({ error }: { error: string | null }) {
  return error ? (
    <p role="alert" className="text-danger text-sm">
      {error}
    </p>
  ) : null;
}

// ------------------------------------------------------------------ settings
export function AdminSettingsForm({ settings }: { settings: AppSettings }) {
  const { pending, error, save } = useSave();
  const [f, setF] = useState({
    refund_window_days: String(settings.refund_window_days),
    default_reminder_hour: String(settings.default_reminder_hour),
    announcement: settings.announcement ?? "",
    instagram_followers: String(settings.instagram_followers),
  });
  const set =
    (key: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF((p) => ({ ...p, [key]: e.target.value }));
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        save(() => saveSettingsAction(f));
      }}
    >
      <div>
        <Label htmlFor="window">Refund window (days)</Label>
        <Input
          id="window"
          type="number"
          min={0}
          max={365}
          className="w-40"
          value={f.refund_window_days}
          onChange={set("refund_window_days")}
        />
        <FieldHint>How long after the final day the refund button stays available.</FieldHint>
      </div>
      <div>
        <Label htmlFor="hour">Default reminder time</Label>
        <Select
          id="hour"
          className="w-40"
          value={f.default_reminder_hour}
          onChange={set("default_reminder_hour")}
        >
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, "0")}:00
            </option>
          ))}
        </Select>
        <FieldHint>For new accounts, in each person&apos;s own timezone.</FieldHint>
      </div>
      <div>
        <Label htmlFor="announce">Site-wide announcement</Label>
        <Input
          id="announce"
          value={f.announcement}
          onChange={set("announcement")}
          maxLength={300}
          placeholder="Leave empty to hide the banner"
        />
      </div>
      <div>
        <Label htmlFor="followers">Instagram followers</Label>
        <Input
          id="followers"
          type="number"
          min={0}
          className="w-40"
          value={f.instagram_followers}
          onChange={set("instagram_followers")}
        />
        <FieldHint>Shown on the home page.</FieldHint>
      </div>
      <ErrorLine error={error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}

// ------------------------------------------------------------------ email templates
export function EmailEditor({
  template,
  label,
  variables,
}: {
  template: EmailTemplate;
  label: string;
  variables: string[];
}) {
  const { pending, error, save } = useSave();
  const [f, setF] = useState({
    subject: template.subject,
    body_markdown: template.body_markdown,
    button_label: template.button_label,
  });
  const [preview, setPreview] = useState<{ html: string; subject: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const key = template.key;

  async function showPreview() {
    setLoading(true);
    const result = await previewEmailAction({ key, ...f });
    setLoading(false);
    if (result.html) setPreview({ html: result.html, subject: result.message ?? "" });
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="text-xl font-semibold">{label}</h2>
        <div>
          <Label htmlFor={`${key}-subject`}>Subject</Label>
          <Input
            id={`${key}-subject`}
            value={f.subject}
            onChange={(e) => setF((p) => ({ ...p, subject: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor={`${key}-body`}>Body</Label>
          <Textarea
            id={`${key}-body`}
            rows={8}
            value={f.body_markdown}
            onChange={(e) => setF((p) => ({ ...p, body_markdown: e.target.value }))}
          />
          <FieldHint>
            Blank line = new paragraph. **bold** and [link text](https://…) work. Placeholders:{" "}
            {variables.map((v) => `{{${v}}}`).join(" ")}
          </FieldHint>
        </div>
        <div>
          <Label htmlFor={`${key}-button`}>Button label</Label>
          <Input
            id={`${key}-button`}
            value={f.button_label}
            onChange={(e) => setF((p) => ({ ...p, button_label: e.target.value }))}
          />
        </div>
        <ErrorLine error={error} />
        <div className="flex gap-2">
          <Button
            disabled={pending}
            onClick={() => save(() => saveEmailTemplateAction({ key, ...f }))}
          >
            {pending ? "Saving…" : "Save"}
          </Button>
          <Button variant="outline" disabled={loading} onClick={showPreview}>
            {loading ? "Rendering…" : "Preview"}
          </Button>
        </div>
        {preview && (
          <div>
            <p className="mb-2 text-sm">
              <span className="text-muted-foreground">Subject:</span> {preview.subject}
            </p>
            <iframe
              title={`${label} preview`}
              sandbox=""
              srcDoc={preview.html}
              className="border-border h-[30rem] w-full rounded-xl border bg-white"
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ------------------------------------------------------------------ users
export function CreateUserForm({
  courses,
}: {
  courses: { id: string; name: string; emoji: string }[];
}) {
  const router = useRouter();
  const { pending, error, save } = useSave();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [ids, setIds] = useState<string[]>([]);
  const [done, setDone] = useState<{ message: string; id?: string } | null>(null);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        save(
          () => createUserAndGrantAction({ email, name, course_ids: ids }),
          (r) => setDone({ message: r.message ?? "Done.", id: r.id }),
        );
      }}
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Give free access to</legend>
        <div className="space-y-2">
          {courses.map((c) => (
            <label key={c.id} className="flex items-center gap-2.5">
              <input
                type="checkbox"
                className="size-4"
                checked={ids.includes(c.id)}
                onChange={(e) =>
                  setIds((x) => (e.target.checked ? [...x, c.id] : x.filter((i) => i !== c.id)))
                }
              />
              <span aria-hidden>{c.emoji}</span> {c.name}
            </label>
          ))}
        </div>
        <button
          type="button"
          className="text-accent-strong mt-2 text-sm underline"
          onClick={() => setIds(courses.map((c) => c.id))}
        >
          Select all
        </button>
      </fieldset>
      <ErrorLine error={error} />
      {done && (
        <p
          role="status"
          className="bg-success-soft text-success rounded-xl px-3.5 py-2.5 text-sm break-words"
        >
          {done.message}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create user & grant access"}
        </Button>
        {done?.id && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/users/${done.id}`)}
          >
            View user
          </Button>
        )}
      </div>
    </form>
  );
}

export function GrantCourseForm({
  userId,
  courses,
}: {
  userId: string;
  courses: { id: string; name: string }[];
}) {
  const { pending, error, save } = useSave();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  if (courses.length === 0)
    return <p className="text-muted-foreground text-sm">This user already has every course.</p>;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Select
          aria-label="Course to grant"
          className="w-auto min-w-52"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Button
          disabled={pending || !courseId}
          onClick={() => save(() => grantCourseAction(userId, courseId))}
        >
          {pending ? "Granting…" : "Grant free access"}
        </Button>
      </div>
      <ErrorLine error={error} />
    </div>
  );
}

/** Testing tool on the user page: jump an enrollment to any day. */
export function SetDayForm({
  enrollmentId,
  currentDay,
  totalDays,
}: {
  enrollmentId: string;
  currentDay: number;
  totalDays: number;
}) {
  const { pending, error, save } = useSave();
  const [day, setDay] = useState(String(currentDay));
  const [responses, setResponses] = useState("keep");
  const id = `day-${enrollmentId}`;
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (
          responses === "clear" &&
          !window.confirm(
            "Delete every response this person wrote in this course? This can't be undone.",
          )
        )
          return;
        save(() => setEnrollmentDayAction({ enrollmentId, day, responses }));
      }}
    >
      <div>
        <Label htmlFor={id} className="text-muted-foreground text-xs">
          Jump to day
        </Label>
        <Select id={id} className="h-9 w-40" value={day} onChange={(e) => setDay(e.target.value)}>
          <option value="0">Starts tomorrow</option>
          {Array.from({ length: totalDays }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Day {i + 1}
              {i + 1 === totalDays ? " (final day)" : ""}
            </option>
          ))}
          <option value={totalDays + 1}>Finished yesterday</option>
        </Select>
      </div>
      <div>
        <Label htmlFor={`${id}-r`} className="text-muted-foreground text-xs">
          Responses
        </Label>
        <Select
          id={`${id}-r`}
          className="h-9 w-56"
          value={responses}
          onChange={(e) => setResponses(e.target.value)}
        >
          <option value="keep">Leave as they are</option>
          <option value="fill">Mark earlier days as answered</option>
          <option value="clear">Delete all responses</option>
        </Select>
      </div>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Moving…" : "Apply"}
      </Button>
      <ErrorLine error={error} />
    </form>
  );
}

// ------------------------------------------------------------------ testimonials
export function TestimonialControls({
  id,
  starred,
  name,
}: {
  id: string;
  starred: boolean;
  name: string | null;
}) {
  const { pending, save } = useSave();
  const [display, setDisplay] = useState(name ?? "");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        aria-label="Display name for testimonial"
        className="h-9 w-48"
        placeholder="e.g. Aman, Toronto"
        value={display}
        maxLength={80}
        onChange={(e) => setDisplay(e.target.value)}
      />
      <Button
        size="sm"
        variant={starred ? "accent" : "outline"}
        disabled={pending}
        aria-pressed={starred}
        onClick={() =>
          save(() => saveTestimonialAction({ id, is_starred: !starred, testimonial_name: display }))
        }
      >
        <Star className={starred ? "fill-current" : undefined} />
        {starred ? "Starred" : "Star"}
      </Button>
      {starred && display !== (name ?? "") && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            save(() => saveTestimonialAction({ id, is_starred: true, testimonial_name: display }))
          }
        >
          Save name
        </Button>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ visitor rate
export function VisitorRate({ signups30d }: { signups30d: number }) {
  const [visitors, setVisitors] = useState("");
  const n = Number(visitors);
  return (
    <div className="rounded-card border-border bg-surface shadow-soft border p-4">
      <Label htmlFor="visitors">Visitors, last 30 days</Label>
      <Input
        id="visitors"
        type="number"
        min={0}
        inputMode="numeric"
        className="h-9"
        value={visitors}
        onChange={(e) => setVisitors(e.target.value)}
        placeholder="From Vercel Analytics"
      />
      <p className="text-muted-foreground mt-2 text-sm">
        Visitor → signup:{" "}
        <span className="text-foreground font-semibold">
          {n > 0 ? `${((signups30d / n) * 100).toFixed(1)}%` : "—"}
        </span>
      </p>
    </div>
  );
}
