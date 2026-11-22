"use client";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Download, GripVertical, Upload } from "lucide-react";
import { importTasksAction, reorderTasksAction, saveTaskAction } from "@/app/admin/actions";
import { useSave } from "@/components/admin/use-save";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FieldHint, Input, Label, Select, Textarea } from "@/components/ui/input";
import { parseTaskImport, type ImportPreview } from "@/lib/task-import";
import type { LessonResource, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

function ResourcesEditor({
  value,
  onChange,
}: {
  value: LessonResource[];
  onChange: (next: LessonResource[]) => void;
}) {
  const update = (i: number, patch: Partial<LessonResource>) =>
    onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-3">
      {value.map((r, i) => (
        <div key={i} className="border-border space-y-2 rounded-xl border p-3">
          <div className="flex flex-wrap gap-2">
            <Select
              aria-label="Block type"
              className="h-9 w-36"
              value={r.kind}
              onChange={(e) => update(i, { kind: e.target.value as LessonResource["kind"] })}
            >
              <option value="prompt">Prompt</option>
              <option value="command">Command</option>
              <option value="link">Link</option>
              <option value="note">Note</option>
            </Select>
            {r.kind === "command" && (
              <Select
                aria-label="Operating system"
                className="h-9 w-36"
                value={r.os ?? "all"}
                onChange={(e) => update(i, { os: e.target.value as LessonResource["os"] })}
              >
                <option value="all">All systems</option>
                <option value="windows">Windows</option>
                <option value="mac">Mac</option>
                <option value="linux">Linux</option>
              </Select>
            )}
            <Input
              aria-label="Label"
              className="h-9 min-w-0 flex-1"
              placeholder="Label, e.g. Setup prompt"
              value={r.label}
              onChange={(e) => update(i, { label: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              Remove
            </Button>
          </div>
          <Textarea
            aria-label="Content"
            rows={r.kind === "link" ? 1 : 4}
            className="min-h-0 font-mono text-sm"
            placeholder={r.kind === "link" ? "https://…" : "Text people will copy"}
            value={r.content}
            onChange={(e) => update(i, { content: e.target.value })}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, { kind: "prompt", label: "", content: "" }])}
      >
        Add a block
      </Button>
    </div>
  );
}

function TaskFields({
  task,
  onSaved,
  workshop,
  videoId,
}: {
  task: Task;
  onSaved: () => void;
  workshop: boolean;
  videoId: string;
}) {
  const [resources, setResources] = useState<LessonResource[]>(task.resources ?? []);
  const [video, setVideo] = useState(videoId ? `https://youtu.be/${videoId}` : "");
  const { pending, error, save } = useSave();
  const [f, setF] = useState({
    title: task.title,
    book_insight: task.book_insight,
    book_reference: task.book_reference,
    instructions: task.instructions.join("\n"),
    response_prompt: task.response_prompt,
    min_response_chars: String(task.min_response_chars),
    is_sample: task.is_sample,
  });
  const id = `t-${task.id}`;
  const set =
    (key: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF((p) => ({ ...p, [key]: e.target.value }));

  return (
    <form
      className="border-border space-y-3 border-t p-4"
      onSubmit={(e) => {
        e.preventDefault();
        save(
          () =>
            saveTaskAction({
              ...f,
              id: task.id,
              ...(workshop
                ? { resources: resources.filter((r) => r.label.trim() && r.content.trim()), video }
                : {}),
              instructions: f.instructions
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            }),
          onSaved,
        );
      }}
    >
      <div>
        <Label htmlFor={`${id}-title`}>Title</Label>
        <Input id={`${id}-title`} value={f.title} onChange={set("title")} required />
      </div>
      <div>
        <Label htmlFor={`${id}-insight`}>
          {workshop ? "Intro (why this lesson matters)" : "Book insight"}
        </Label>
        <Textarea
          id={`${id}-insight`}
          rows={3}
          className="min-h-0"
          value={f.book_insight}
          onChange={set("book_insight")}
        />
        <FieldHint>
          {workshop
            ? "2–3 sentences shown above the steps."
            : "2–3 sentences in your own words. Never quote the book."}
        </FieldHint>
      </div>
      <div>
        <Label htmlFor={`${id}-ref`}>Book reference{workshop ? " (optional)" : ""}</Label>
        <Input
          id={`${id}-ref`}
          value={f.book_reference}
          onChange={set("book_reference")}
          placeholder="Atomic Habits — James Clear"
        />
      </div>
      <div>
        <Label htmlFor={`${id}-steps`}>{workshop ? "Steps" : "Instructions"}</Label>
        <Textarea
          id={`${id}-steps`}
          rows={4}
          className="min-h-0"
          value={f.instructions}
          onChange={set("instructions")}
        />
        <FieldHint>One bullet per line (2–5 works best).</FieldHint>
      </div>
      {!workshop && (
        <>
          <div>
            <Label htmlFor={`${id}-prompt`}>Response prompt</Label>
            <Textarea
              id={`${id}-prompt`}
              rows={2}
              className="min-h-0"
              value={f.response_prompt}
              onChange={set("response_prompt")}
            />
          </div>
        </>
      )}
      {workshop ? (
        <>
          <div>
            <Label htmlFor={`${id}-video`}>Video (YouTube link)</Label>
            <Input
              id={`${id}-video`}
              value={video}
              onChange={(e) => setVideo(e.target.value)}
              placeholder="https://youtu.be/… — upload as Unlisted on YouTube"
            />
            <FieldHint>
              Upload the video to YouTube as Unlisted and paste its link. Learners never see the
              link; leave empty for no video.
            </FieldHint>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">Prompts, commands, links and notes</p>
            <ResourcesEditor value={resources} onChange={setResources} />
          </div>
        </>
      ) : null}
      <div className="flex flex-wrap items-end gap-4">
        {!workshop && (
          <div>
            <Label htmlFor={`${id}-min`}>Minimum characters</Label>
            <Input
              id={`${id}-min`}
              type="number"
              min={0}
              className="w-32"
              value={f.min_response_chars}
              onChange={set("min_response_chars")}
            />
          </div>
        )}
        <label className="flex h-11 items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="size-4"
            checked={f.is_sample}
            onChange={(e) => setF((p) => ({ ...p, is_sample: e.target.checked }))}
          />
          Show publicly as a sample
        </label>
      </div>
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save task"}
      </Button>
    </form>
  );
}

function ImportPanel({ courseId, days }: { courseId: string; days: number }) {
  const { pending, error, save } = useSave();
  const [raw, setRaw] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const file = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardBody className="space-y-3">
        <h2 className="text-xl font-semibold">Bulk import</h2>
        <p className="text-muted-foreground text-sm">
          Paste JSON or CSV, or choose a file. Days in the file replace the matching days; other
          days are left alone. CSV columns:{" "}
          <code>
            day_number, title, book_insight, book_reference, instructions, response_prompt,
            min_response_chars, is_sample
          </code>{" "}
          — separate instruction bullets with <code>|</code>.
        </p>
        <Textarea
          aria-label="JSON or CSV to import"
          rows={6}
          className="font-mono text-sm"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setPreview(null);
          }}
          placeholder='[{"day_number": 4, "title": "…", "instructions": ["…"]}]'
        />
        <input
          ref={file}
          type="file"
          accept=".json,.csv,application/json,text/csv"
          className="sr-only"
          aria-label="Choose a JSON or CSV file"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const text = await f.text();
            setRaw(text);
            setPreview(parseTaskImport(text, days));
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => file.current?.click()}>
            <Upload /> Choose file
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!raw.trim()}
            onClick={() => setPreview(parseTaskImport(raw, days))}
          >
            Preview
          </Button>
        </div>

        {preview && (
          <div className="space-y-3">
            {preview.errors.length > 0 && (
              <ul
                role="alert"
                className="bg-danger-soft text-danger list-disc space-y-1 rounded-xl py-3 pr-4 pl-8 text-sm"
              >
                {preview.errors.slice(0, 12).map((e) => (
                  <li key={e}>{e}</li>
                ))}
                {preview.errors.length > 12 && <li>…and {preview.errors.length - 12} more</li>}
              </ul>
            )}
            {preview.tasks.length > 0 && (
              <div className="border-border max-h-72 overflow-auto rounded-xl border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-muted text-muted-foreground sticky top-0 text-xs uppercase">
                    <tr>
                      <th className="px-3 py-2">Day</th>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Bullets</th>
                      <th className="px-3 py-2">Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.tasks.map((t) => (
                      <tr key={t.day_number} className="border-border border-t">
                        <td className="px-3 py-2">{t.day_number}</td>
                        <td className="px-3 py-2">{t.title}</td>
                        <td className="px-3 py-2">{t.instructions.length}</td>
                        <td className="px-3 py-2">{t.is_sample ? "Yes" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Button
              type="button"
              disabled={pending || preview.errors.length > 0 || preview.tasks.length === 0}
              onClick={() =>
                save(
                  () => importTasksAction(courseId, raw),
                  () => {
                    setRaw("");
                    setPreview(null);
                  },
                )
              }
            >
              {pending
                ? "Importing…"
                : `Import ${preview.tasks.length} task${preview.tasks.length === 1 ? "" : "s"}`}
            </Button>
            {error && (
              <p role="alert" className="text-danger text-sm">
                {error}
              </p>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function TaskEditor({
  courseId,
  days,
  tasks,
  workshop = false,
  videos = {},
}: {
  courseId: string;
  days: number;
  tasks: Task[];
  /** Self-paced workshop: lessons get a video and copy blocks. */
  workshop?: boolean;
  /** task id → YouTube id */
  videos?: Record<string, string>;
}) {
  const { pending, save } = useSave();
  const [order, setOrder] = useState(tasks.map((t) => t.id));
  const [open, setOpen] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const byId = new Map(tasks.map((t) => [t.id, t]));
  // If the server sent a different set of tasks (after import), fall back to it.
  const ids =
    order.length === tasks.length && order.every((id) => byId.has(id))
      ? order
      : tasks.map((t) => t.id);
  const dirty = ids.some((id, i) => id !== tasks[i]?.id);

  function move(id: string, to: number) {
    const from = ids.indexOf(id);
    if (from < 0 || to < 0 || to >= ids.length || from === to) return;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, id);
    setOrder(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          Drag the handle (or use the arrows) to reorder. Reordering moves the content between days;
          avoid it once learners have started.
        </p>
        <div className="flex gap-2">
          {dirty && (
            <Button
              disabled={pending}
              onClick={() => save(() => reorderTasksAction(courseId, ids))}
            >
              {pending ? "Saving…" : "Save new order"}
            </Button>
          )}
          <Button asChild variant="outline">
            <a href={`/api/admin/courses/${courseId}/tasks/export`}>
              <Download /> Export JSON
            </a>
          </Button>
        </div>
      </div>

      <ol className="rounded-card border-border bg-surface shadow-soft overflow-hidden border">
        {ids.map((id, index) => {
          const task = byId.get(id);
          if (!task) return null;
          const hidden = index + 1 > days;
          const placeholder = /coming soon$/i.test(task.title);
          return (
            <li
              key={id}
              className={cn(
                "border-border border-b last:border-b-0",
                dragId === id && "opacity-50",
                hidden && "bg-surface-muted/60",
              )}
              onDragOver={(e) => {
                if (dragId) e.preventDefault();
              }}
              onDrop={() => {
                if (dragId) move(dragId, index);
                setDragId(null);
              }}
            >
              <div className="flex items-center gap-1 px-2 py-2 sm:gap-2 sm:px-3">
                <span
                  draggable
                  onDragStart={() => setDragId(id)}
                  onDragEnd={() => setDragId(null)}
                  className="text-muted-foreground hidden cursor-grab p-1 sm:block"
                  aria-hidden
                >
                  <GripVertical className="size-4" />
                </span>
                <span className="text-muted-foreground w-12 shrink-0 text-sm font-semibold">
                  Day {index + 1}
                </span>
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
                  aria-expanded={open === id}
                  onClick={() => setOpen(open === id ? null : id)}
                >
                  <span
                    className={cn(
                      "truncate font-medium",
                      placeholder && "text-muted-foreground italic",
                    )}
                  >
                    {task.title}
                  </span>
                  {task.is_sample && <Badge variant="accent">Sample</Badge>}
                  {hidden && <Badge variant="outline">Hidden</Badge>}
                  <ChevronDown
                    className={cn(
                      "ml-auto size-4 shrink-0 transition-transform",
                      open === id && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move day ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => move(id, index - 1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move day ${index + 1} down`}
                  disabled={index === ids.length - 1}
                  onClick={() => move(id, index + 1)}
                >
                  <ArrowDown />
                </Button>
              </div>
              {open === id && (
                <TaskFields
                  task={task}
                  onSaved={() => setOpen(null)}
                  workshop={workshop}
                  videoId={videos[task.id] ?? ""}
                />
              )}
            </li>
          );
        })}
      </ol>

      <ImportPanel courseId={courseId} days={days} />
    </div>
  );
}
