import type { Metadata } from "next";
import Link from "next/link";
import { TestimonialControls } from "@/components/admin/misc-forms";
import { AdminHeader, fmtDate } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { getAllCourses } from "@/lib/queries/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ResponseRow } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Responses" };

type Row = ResponseRow & {
  profiles: { name: string; email: string } | null;
  enrollments: { course_id: string; courses: { name: string; emoji: string } | null } | null;
};

export default async function AdminResponsesPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; day?: string; starred?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const courses = await getAllCourses();
  const courseId = courses.some((c) => c.id === sp.course) ? sp.course : undefined;
  const day = Number(sp.day) > 0 ? Math.floor(Number(sp.day)) : undefined;
  const starred = sp.starred === "1";

  let query = createAdminClient()
    .from("responses")
    .select("*, profiles(name, email), enrollments!inner(course_id, courses(name, emoji))")
    .order("submitted_at", { ascending: false })
    .limit(100);
  if (courseId) query = query.eq("enrollments.course_id", courseId);
  if (day) query = query.eq("day_number", day);
  if (starred) query = query.eq("is_starred", true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <>
      <AdminHeader
        title="Responses"
        description="Star a response to show it as a testimonial. Set the display name people will see — and ask the learner first."
      />
      <form className="mb-5 flex flex-wrap items-end gap-2">
        <Select
          name="course"
          defaultValue={courseId ?? ""}
          aria-label="Course"
          className="w-auto min-w-48"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          name="day"
          type="number"
          min={1}
          defaultValue={day ?? ""}
          placeholder="Day"
          aria-label="Day number"
          className="w-24"
        />
        <label className="flex h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="starred"
            value="1"
            defaultChecked={starred}
            className="size-4"
          />
          Starred only
        </label>
        <Button type="submit" variant="outline">
          Filter
        </Button>
        {(courseId || day || starred) && (
          <Link href="/admin/responses" className="text-accent-strong px-2 text-sm underline">
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center">No responses match.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-card border-border bg-surface shadow-soft border p-4">
              <p className="text-muted-foreground text-sm">
                {r.enrollments?.courses?.emoji} {r.enrollments?.courses?.name} · Day {r.day_number}{" "}
                ·{" "}
                <Link href={`/admin/users/${r.user_id}`} className="hover:underline">
                  {r.profiles?.name || r.profiles?.email}
                </Link>{" "}
                · {fmtDate(r.submitted_at)}
              </p>
              <p className="mt-2 mb-3 whitespace-pre-wrap">{r.body}</p>
              <TestimonialControls
                key={`${r.id}-${r.is_starred}-${r.testimonial_name}`}
                id={r.id}
                starred={r.is_starred}
                name={r.testimonial_name}
              />
            </li>
          ))}
        </ul>
      )}
      {rows.length === 100 && (
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Showing the latest 100. Use the filters to narrow down.
        </p>
      )}
    </>
  );
}
