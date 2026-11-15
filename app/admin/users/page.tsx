import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { AdminHeader, TableWrap, fmtDate } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { computeStreak, dateOfDay, todayInTz } from "@/lib/course-days";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Users" };

const PAGE = 50;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  // Strip characters that mean something in a PostgREST filter.
  const q = (sp.q ?? "")
    .replace(/[,()%*\\"']/g, "")
    .trim()
    .slice(0, 80);
  const page = Math.max(1, Number(sp.page) || 1);
  const db = createAdminClient();

  let query = db
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (q) query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  const users = (data ?? []) as Profile[];
  const ids = users.map((u) => u.id);

  const [enrollRes, respRes] = ids.length
    ? await Promise.all([
        db.from("enrollments").select("user_id, status, courses(emoji)").in("user_id", ids),
        db
          .from("responses")
          .select("user_id, day_number, enrollments!inner(start_date)")
          .in("user_id", ids),
      ])
    : [{ data: [] }, { data: [] }];
  const emojis = new Map<string, string[]>();
  for (const e of (enrollRes.data ?? []) as unknown as {
    user_id: string;
    status: string;
    courses: { emoji: string } | null;
  }[]) {
    if (e.status === "revoked") continue;
    emojis.set(e.user_id, [...(emojis.get(e.user_id) ?? []), e.courses?.emoji ?? "📘"]);
  }
  const dates = new Map<string, string[]>();
  for (const r of (respRes.data ?? []) as unknown as {
    user_id: string;
    day_number: number;
    enrollments: { start_date: string | null };
  }[]) {
    if (!r.enrollments.start_date) continue;
    dates.set(r.user_id, [
      ...(dates.get(r.user_id) ?? []),
      dateOfDay(r.enrollments.start_date, r.day_number),
    ]);
  }
  const total = count ?? users.length;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const link = (p: number) =>
    `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <>
      <AdminHeader
        title="Users"
        description={`${total} ${total === 1 ? "person" : "people"}${q ? ` matching “${q}”` : ""}`}
        actions={
          <Button asChild>
            <Link href="/admin/users/new">
              <Plus /> Create user &amp; grant access
            </Link>
          </Button>
        }
      />
      <form className="mb-4 flex max-w-md gap-2" role="search">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by email or name"
          aria-label="Search users"
        />
        <Button type="submit" variant="outline">
          <Search /> Search
        </Button>
      </form>
      <TableWrap>
        <thead>
          <tr>
            <th>User</th>
            <th>Courses</th>
            <th>Streak</th>
            <th>Last active</th>
            <th>Signup source</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="text-muted-foreground text-center">
                No users found.
              </td>
            </tr>
          )}
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <Link href={`/admin/users/${u.id}`} className="font-medium hover:underline">
                  {u.name || "—"}
                </Link>
                {u.role === "admin" && (
                  <Badge variant="accent" className="ml-2">
                    Admin
                  </Badge>
                )}
                <div className="text-muted-foreground">{u.email}</div>
              </td>
              <td>{emojis.get(u.id)?.join(" ") ?? "—"}</td>
              <td>{computeStreak(dates.get(u.id) ?? [], todayInTz(u.timezone))}</td>
              <td>{fmtDate(u.last_active_at)}</td>
              <td>
                {u.signup_source ?? "—"}
                {u.signup_campaign && (
                  <div className="text-muted-foreground">{u.signup_campaign}</div>
                )}
              </td>
              <td>{fmtDate(u.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      {pages > 1 && (
        <nav aria-label="Pages" className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={link(page - 1)} className="text-accent-strong underline">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={link(page + 1)} className="text-accent-strong underline">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
