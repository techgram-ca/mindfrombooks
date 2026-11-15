import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DropoffChart, type DropoffPoint } from "@/components/admin/dropoff-chart";
import { AdminHeader, Section, Stat, TableWrap, pct } from "@/components/admin/ui";
import { Card, CardBody } from "@/components/ui/card";
import { getCourseStats } from "@/lib/queries/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Course } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Course analytics" };

interface Row {
  day_number: number;
  title: string | null;
  reached: number;
  responded: number;
}

export default async function CourseAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = createAdminClient();
  const { data: course } = await db.from("courses").select("*").eq("id", id).maybeSingle();
  if (!course) notFound();
  const c = course as Course;
  const [{ data, error }, stats] = await Promise.all([
    db.rpc("admin_course_dropoff", { p_course_id: id }),
    getCourseStats(),
  ]);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];
  const points: DropoffPoint[] = rows.map((r) => ({
    day: r.day_number,
    title: r.title,
    reached: r.reached,
    responded: r.responded,
  }));
  const s = stats.get(id);
  const missed = rows
    .filter((r) => r.reached > 0)
    .map((r) => ({ ...r, missed: r.reached - r.responded }))
    .sort((a, b) => b.missed / b.reached - a.missed / a.reached || b.missed - a.missed)
    .slice(0, 8);
  const hasData = rows.some((r) => r.reached > 0);

  return (
    <>
      <Link
        href={`/admin/courses/${id}`}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← {c.name}
      </Link>
      <div className="mt-2">
        <AdminHeader title="Analytics" description={`${c.emoji} ${c.name} · ${c.days} days`} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Enrollments"
          value={s?.enrollments ?? 0}
          hint={`${s?.paid_enrollments ?? 0} paid`}
        />
        <Stat label="Finished" value={s?.finished ?? 0} />
        <Stat label="Completion rate" value={pct(s?.completed ?? 0, s?.finished ?? 0)} />
        <Stat label="Refund rate" value={pct(s?.refunded ?? 0, s?.paid_enrollments ?? 0)} />
      </div>

      <Section title="Response rate by day">
        <Card>
          <CardBody>
            {hasData ? (
              <DropoffChart points={points} color={c.accent_color} />
            ) : (
              <p className="text-muted-foreground py-8 text-center">
                No one has finished a day of this course yet. The chart fills in as learners
                progress.
              </p>
            )}
          </CardBody>
        </Card>
      </Section>

      {hasData && (
        <>
          <Section title="Most-missed days">
            <TableWrap>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Task</th>
                  <th>Missed</th>
                  <th>Reached</th>
                  <th>Miss rate</th>
                </tr>
              </thead>
              <tbody>
                {missed.map((r) => (
                  <tr key={r.day_number}>
                    <td>Day {r.day_number}</td>
                    <td>{r.title ?? "—"}</td>
                    <td>{r.missed}</td>
                    <td>{r.reached}</td>
                    <td>{pct(r.missed, r.reached)}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Section>
          <details className="mt-6">
            <summary className="text-accent-strong cursor-pointer text-sm font-medium">
              Show all days as a table
            </summary>
            <TableWrap className="mt-3">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Task</th>
                  <th>Reached</th>
                  <th>Responded</th>
                  <th>Response rate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.day_number}>
                    <td>{r.day_number}</td>
                    <td>{r.title ?? "—"}</td>
                    <td>{r.reached}</td>
                    <td>{r.responded}</td>
                    <td>{pct(r.responded, r.reached)}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </details>
        </>
      )}
    </>
  );
}
