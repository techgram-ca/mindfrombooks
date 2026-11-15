"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveCourseAction } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/image-upload";
import { useSave } from "@/components/admin/use-save";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FieldHint, Input, Label, Select, Textarea } from "@/components/ui/input";
import type { Course, CourseBook, CoursePhase, FaqItem } from "@/lib/types";

interface BookRow {
  title: string;
  author: string;
  image_url: string;
}
interface PhaseRow {
  name: string;
  start_day: string;
  end_day: string;
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button type="button" variant="ghost" size="icon" onClick={onClick} aria-label={label}>
      <Trash2 />
    </Button>
  );
}

export function CourseForm({
  course,
  books,
  phases,
}: {
  course?: Course;
  books?: CourseBook[];
  phases?: CoursePhase[];
}) {
  const router = useRouter();
  const { pending, error, save } = useSave();
  const [f, setF] = useState({
    name: course?.name ?? "",
    slug: course?.slug ?? "",
    category: course?.category ?? "",
    emoji: course?.emoji ?? "📘",
    accent_color: course?.accent_color ?? "#C8892B",
    short_description: course?.short_description ?? "",
    description: course?.description ?? "",
    number_reason: course?.number_reason ?? "",
    outcomes: (course?.outcomes ?? []).join("\n"),
    notice: course?.notice ?? "",
    days: String(course?.days ?? 21),
    price_dollars: course ? (course.price_cents / 100).toFixed(2) : "9.99",
    grace_days: String(course?.grace_days ?? 0),
    cover_image_url: course?.cover_image_url ?? "",
    status: course?.status ?? "draft",
    sort_order: String(course?.sort_order ?? 0),
  });
  const [bookRows, setBooks] = useState<BookRow[]>(
    (books ?? []).map((b) => ({ title: b.title, author: b.author, image_url: b.image_url ?? "" })),
  );
  const [phaseRows, setPhases] = useState<PhaseRow[]>(
    (phases ?? []).map((p) => ({
      name: p.name,
      start_day: String(p.start_day),
      end_day: String(p.end_day),
    })),
  );
  const [faq, setFaq] = useState<FaqItem[]>(course?.faq ?? []);

  const set =
    (key: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF((prev) => ({ ...prev, [key]: e.target.value }));
  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    save(
      () =>
        saveCourseAction({
          ...f,
          id: course?.id,
          outcomes: f.outcomes
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          books: bookRows.filter((b) => b.title.trim()),
          phases: phaseRows.filter((p) => p.name.trim()),
          faq: faq.filter((x) => x.q.trim() && x.a.trim()),
        }),
      (result) => {
        if (!course && result.id) router.push(`/admin/courses/${result.id}`);
      },
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={f.name}
              required
              onChange={(e) =>
                setF((p) => ({
                  ...p,
                  name: e.target.value,
                  slug: course ? p.slug : autoSlug(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={f.slug} onChange={set("slug")} required />
            <FieldHint>/courses/{f.slug || "…"}</FieldHint>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={f.category} onChange={set("category")} required />
          </div>
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <Input id="emoji" value={f.emoji} onChange={set("emoji")} required />
          </div>
          <div>
            <Label htmlFor="accent">Accent colour</Label>
            <div className="flex gap-2">
              <input
                type="color"
                aria-label="Pick accent colour"
                value={/^#[0-9a-fA-F]{6}$/.test(f.accent_color) ? f.accent_color : "#C8892B"}
                onChange={set("accent_color")}
                className="border-border bg-surface h-11 w-14 rounded-xl border p-1"
              />
              <Input id="accent" value={f.accent_color} onChange={set("accent_color")} />
            </div>
          </div>
          <div>
            <Label htmlFor="days">Days</Label>
            <Input
              id="days"
              type="number"
              min={1}
              max={366}
              value={f.days}
              onChange={set("days")}
              required
            />
            <FieldHint>Lowering this hides later tasks but keeps their content.</FieldHint>
          </div>
          <div>
            <Label htmlFor="price">Price (US$)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              value={f.price_dollars}
              onChange={set("price_dollars")}
              required
            />
          </div>
          <div>
            <Label htmlFor="grace">Grace days</Label>
            <Input
              id="grace"
              type="number"
              min={0}
              value={f.grace_days}
              onChange={set("grace_days")}
              required
            />
            <FieldHint>
              Days a learner may miss and still get the refund. Applies to people who buy from now
              on; existing learners keep the number they bought with.
            </FieldHint>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={f.status} onChange={set("status")}>
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
              <option value="archived">Archived (hidden, learners keep access)</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="sort">Sort order</Label>
            <Input
              id="sort"
              type="number"
              min={0}
              value={f.sort_order}
              onChange={set("sort_order")}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="reason">Why this number of days</Label>
            <Input id="reason" value={f.number_reason} onChange={set("number_reason")} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="short">Short description (cards)</Label>
            <Textarea
              id="short"
              rows={2}
              className="min-h-0"
              value={f.short_description}
              onChange={set("short_description")}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="long">Long description (sales page)</Label>
            <Textarea id="long" rows={5} value={f.description} onChange={set("description")} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="outcomes">What you&apos;ll achieve</Label>
            <Textarea id="outcomes" rows={4} value={f.outcomes} onChange={set("outcomes")} />
            <FieldHint>One per line.</FieldHint>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notice">Notice (optional)</Label>
            <Input
              id="notice"
              value={f.notice}
              onChange={set("notice")}
              placeholder="e.g. Not medical advice — check with a doctor…"
            />
            <FieldHint>Shown on the sales page and on Day 1.</FieldHint>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="cover">Cover image</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="cover"
                className="min-w-0 flex-1"
                value={f.cover_image_url}
                onChange={set("cover_image_url")}
                placeholder="https://…"
              />
              <ImageUpload onUploaded={(url) => setF((p) => ({ ...p, cover_image_url: url }))} />
            </div>
            <FieldHint>Your own image only — never an official publisher book cover.</FieldHint>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Inspired by (books)</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBooks((b) => [...b, { title: "", author: "", image_url: "" }])}
            >
              <Plus /> Add book
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Shown as text cards. Add an image only if it is your own design.
          </p>
          {bookRows.map((b, i) => (
            <div
              key={i}
              className="border-border grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <Input
                aria-label="Book title"
                placeholder="Title"
                value={b.title}
                onChange={(e) =>
                  setBooks((rows) =>
                    rows.map((r, j) => (j === i ? { ...r, title: e.target.value } : r)),
                  )
                }
              />
              <Input
                aria-label="Author"
                placeholder="Author"
                value={b.author}
                onChange={(e) =>
                  setBooks((rows) =>
                    rows.map((r, j) => (j === i ? { ...r, author: e.target.value } : r)),
                  )
                }
              />
              <div className="flex items-center gap-1">
                <ImageUpload
                  label={b.image_url ? "Replace" : "Image"}
                  onUploaded={(url) =>
                    setBooks((rows) => rows.map((r, j) => (j === i ? { ...r, image_url: url } : r)))
                  }
                />
                <RemoveButton
                  label="Remove book"
                  onClick={() => setBooks((rows) => rows.filter((_, j) => j !== i))}
                />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Phases</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPhases((p) => [...p, { name: "", start_day: "", end_day: "" }])}
            >
              <Plus /> Add phase
            </Button>
          </div>
          {phaseRows.map((p, i) => (
            <div key={i} className="grid grid-cols-[1fr_5rem_5rem_auto] items-center gap-2">
              <Input
                aria-label="Phase name"
                placeholder="Name"
                value={p.name}
                onChange={(e) =>
                  setPhases((rows) =>
                    rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)),
                  )
                }
              />
              <Input
                aria-label="First day"
                type="number"
                min={1}
                placeholder="From"
                value={p.start_day}
                onChange={(e) =>
                  setPhases((rows) =>
                    rows.map((r, j) => (j === i ? { ...r, start_day: e.target.value } : r)),
                  )
                }
              />
              <Input
                aria-label="Last day"
                type="number"
                min={1}
                placeholder="To"
                value={p.end_day}
                onChange={(e) =>
                  setPhases((rows) =>
                    rows.map((r, j) => (j === i ? { ...r, end_day: e.target.value } : r)),
                  )
                }
              />
              <RemoveButton
                label="Remove phase"
                onClick={() => setPhases((rows) => rows.filter((_, j) => j !== i))}
              />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">FAQ</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFaq((x) => [...x, { q: "", a: "" }])}
            >
              <Plus /> Add question
            </Button>
          </div>
          {faq.map((item, i) => (
            <div key={i} className="border-border space-y-2 rounded-xl border p-3">
              <div className="flex gap-2">
                <Input
                  aria-label="Question"
                  placeholder="Question"
                  value={item.q}
                  onChange={(e) =>
                    setFaq((rows) =>
                      rows.map((r, j) => (j === i ? { ...r, q: e.target.value } : r)),
                    )
                  }
                />
                <RemoveButton
                  label="Remove question"
                  onClick={() => setFaq((rows) => rows.filter((_, j) => j !== i))}
                />
              </div>
              <Textarea
                aria-label="Answer"
                placeholder="Answer"
                rows={2}
                className="min-h-0"
                value={item.a}
                onChange={(e) =>
                  setFaq((rows) => rows.map((r, j) => (j === i ? { ...r, a: e.target.value } : r)))
                }
              />
            </div>
          ))}
        </CardBody>
      </Card>

      {course && (
        <p className="text-muted-foreground text-sm">
          Sample days shown on the sales page are chosen in the{" "}
          <Link href={`/admin/courses/${course.id}/tasks`} className="text-accent-strong underline">
            task editor
          </Link>{" "}
          (tick “Show publicly as a sample”).
        </p>
      )}

      {error && (
        <p role="alert" className="bg-danger-soft text-danger rounded-xl px-3.5 py-2.5 text-sm">
          {error}
        </p>
      )}
      <div className="border-border bg-background/95 sticky bottom-0 -mx-5 border-t px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : course ? "Save course" : "Create course"}
        </Button>
      </div>
    </form>
  );
}
