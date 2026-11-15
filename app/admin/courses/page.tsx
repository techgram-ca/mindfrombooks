import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader, ReportProblems, TableWrap, pct } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/pricing";
import { getAllCourses, getCourseStats, reportProblems } from "@/lib/queries/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Courses" };

const statusVariant = { published: "success", draft: "neutral", archived: "outline" } as const;

export default async function AdminCoursesPage() {
  await requireAdmin();
  const [courses, stats] = await Promise.all([getAllCourses(), getCourseStats()]);
  return (
    <>
      <AdminHeader
        title="Courses"
        actions={
          <Button asChild>
            <Link href="/admin/courses/new">
              <Plus /> New course
            </Link>
          </Button>
        }
      />
      <ReportProblems problems={reportProblems()} />
      <TableWrap>
        <thead>
          <tr>
            <th>Course</th>
            <th>Status</th>
            <th>Price</th>
            <th>Days</th>
            <th>Grace</th>
            <th>Enrollments</th>
            <th>Completion</th>
            <th>Refunds</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => {
            const s = stats.get(c.id);
            return (
              <tr key={c.id}>
                <td>
                  <Link href={`/admin/courses/${c.id}`} className="font-medium hover:underline">
                    {c.emoji} {c.name}
                  </Link>
                </td>
                <td>
                  <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                </td>
                <td>{formatUsd(c.price_cents)}</td>
                <td>{c.days}</td>
                <td>{c.grace_days}</td>
                <td>{s?.enrollments ?? 0}</td>
                <td>{pct(s?.completed ?? 0, s?.finished ?? 0)}</td>
                <td>{pct(s?.refunded ?? 0, s?.paid_enrollments ?? 0)}</td>
                <td className="whitespace-nowrap">
                  <Link
                    href={`/admin/courses/${c.id}/tasks`}
                    className="text-accent-strong underline"
                  >
                    Tasks
                  </Link>
                  {" · "}
                  <Link
                    href={`/admin/courses/${c.id}/analytics`}
                    className="text-accent-strong underline"
                  >
                    Analytics
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </>
  );
}
