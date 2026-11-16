import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  manualRefundAction,
  restoreEnrollmentAction,
  revokeEnrollmentAction,
  setRoleAction,
} from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/action-button";
import { GrantCourseForm, SetDayForm } from "@/components/admin/misc-forms";
import { AdminHeader, Section, TableWrap, fmtDate } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { isPastFinalDay, todayInTz } from "@/lib/course-days";
import { formatUsd } from "@/lib/pricing";
import { getAllCourses } from "@/lib/queries/admin";
import { getSettings } from "@/lib/queries/catalog";
import { computeProgress, isPaidSource } from "@/lib/refunds";
import { getSessionProfile, requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Course, Enrollment, Profile, ResponseRow } from "@/lib/types";

export const metadata: Metadata = { title: "User" };

const sourceLabel: Record<Enrollment["source"], string> = {
  stripe: "Paid",
  bundle: "All Access",
  coupon_free: "100% coupon",
  admin_grant: "Granted",
};

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = createAdminClient();
  const { data: profileRow } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profileRow) notFound();
  const user = profileRow as Profile;

  const [enrollRes, respRes, courses, settings, me] = await Promise.all([
    db.from("enrollments").select("*, courses(*)").eq("user_id", id).order("created_at"),
    db
      .from("responses")
      .select("*")
      .eq("user_id", id)
      .order("submitted_at", { ascending: false })
      .limit(200),
    getAllCourses(),
    getSettings(),
    getSessionProfile(),
  ]);
  const enrollments = (enrollRes.data ?? []) as (Enrollment & { courses: Course })[];
  const responses = (respRes.data ?? []) as ResponseRow[];
  const byEnrollment = new Map<string, number[]>();
  for (const r of responses)
    byEnrollment.set(r.enrollment_id, [...(byEnrollment.get(r.enrollment_id) ?? []), r.day_number]);
  const courseOf = new Map(enrollments.map((e) => [e.id, e.courses]));
  const held = new Set(enrollments.map((e) => e.course_id));

  return (
    <>
      <Link href="/admin/users" className="text-muted-foreground hover:text-foreground text-sm">
        ← Users
      </Link>
      <div className="mt-2">
        <AdminHeader
          title={user.name || user.email}
          description={user.email}
          actions={
            user.role === "admin" ? (
              me?.id !== user.id && (
                <ActionButton
                  action={setRoleAction.bind(null, user.id, "user")}
                  confirm="Remove admin access for this person?"
                >
                  Remove admin
                </ActionButton>
              )
            ) : (
              <ActionButton
                action={setRoleAction.bind(null, user.id, "admin")}
                confirm={`Make ${user.email} an admin? They will be able to see and change everything.`}
              >
                Make admin
              </ActionButton>
            )
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="mb-3 text-lg font-semibold">Profile</h2>
            <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              <dt className="text-muted-foreground">Role</dt>
              <dd>{user.role === "admin" ? <Badge variant="accent">Admin</Badge> : "User"}</dd>
              <dt className="text-muted-foreground">Timezone</dt>
              <dd>
                {user.timezone}
                {!user.timezone_confirmed && " (not confirmed)"}
              </dd>
              <dt className="text-muted-foreground">Reminders</dt>
              <dd>
                {user.email_reminders
                  ? `On · ${String(user.reminder_hour).padStart(2, "0")}:00`
                  : "Off"}
              </dd>
              <dt className="text-muted-foreground">Joined</dt>
              <dd>{fmtDate(user.created_at)}</dd>
              <dt className="text-muted-foreground">Last active</dt>
              <dd>{fmtDate(user.last_active_at)}</dd>
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="mb-3 text-lg font-semibold">Attribution</h2>
            <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm break-all">
              <dt className="text-muted-foreground">Source</dt>
              <dd>{user.signup_source ?? "—"}</dd>
              <dt className="text-muted-foreground">Medium</dt>
              <dd>{user.signup_medium ?? "—"}</dd>
              <dt className="text-muted-foreground">Campaign</dt>
              <dd>{user.signup_campaign ?? "—"}</dd>
              <dt className="text-muted-foreground">Landing page</dt>
              <dd>{user.landing_page ?? "—"}</dd>
              <dt className="text-muted-foreground">Referrer</dt>
              <dd>{user.referrer ?? "—"}</dd>
            </dl>
          </CardBody>
        </Card>
      </div>

      <Section title="Enrollments">
        <TableWrap>
          <thead>
            <tr>
              <th>Course</th>
              <th>Access</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Refund guarantee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted-foreground text-center">
                  No courses yet.
                </td>
              </tr>
            )}
            {enrollments.map((e) => {
              const p = computeProgress({
                status: e.status,
                source: e.source,
                amountPaidCents: e.amount_paid_cents,
                startDate: e.start_date,
                graceDays: e.grace_days,
                totalDays: e.courses.days,
                respondedDays: byEnrollment.get(e.id) ?? [],
                today: todayInTz(e.timezone),
                refundWindowDays: settings.refund_window_days,
              });
              const paid = isPaidSource(e.source, e.amount_paid_cents);
              return (
                <tr key={e.id}>
                  <td className="font-medium">
                    {e.courses.emoji} {e.courses.name}
                    <div className="text-muted-foreground font-normal">
                      {e.start_date
                        ? `Day 1 is ${e.start_date}`
                        : "Not started — waiting for the learner to tap Start"}{" "}
                      · {e.timezone}
                    </div>
                  </td>
                  <td>
                    {sourceLabel[e.source]}
                    {paid && (
                      <div className="text-muted-foreground">{formatUsd(e.amount_paid_cents)}</div>
                    )}
                  </td>
                  <td>
                    <Badge
                      variant={
                        e.status === "active"
                          ? "success"
                          : e.status === "revoked"
                            ? "danger"
                            : "neutral"
                      }
                    >
                      {e.status}
                    </Badge>
                  </td>
                  <td>
                    {!e.start_date
                      ? "Not started"
                      : p.currentDay === 0
                        ? "Starts tomorrow"
                        : `Day ${p.currentDay}/${e.courses.days}`}
                    <div className="text-muted-foreground">
                      {p.respondedCount} done · {p.missedDays.length} missed
                    </div>
                  </td>
                  <td>
                    {p.refundEligible ? (
                      <Badge variant="success">Eligible</Badge>
                    ) : (
                      (p.refundIneligibleReason ?? "—")
                    )}
                    <div className="text-muted-foreground">Grace: {e.grace_days}</div>
                  </td>
                  <td>
                    {(e.status === "active" || e.status === "completed") && (
                      <div className="mb-3">
                        <SetDayForm
                          key={`${e.id}-${e.start_date}`}
                          enrollmentId={e.id}
                          currentDay={
                            !e.start_date
                              ? -1
                              : isPastFinalDay(e.start_date, todayInTz(e.timezone), e.courses.days)
                                ? e.courses.days + 1
                                : p.currentDay
                          }
                          totalDays={e.courses.days}
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(e.status === "active" || e.status === "completed") && (
                        <ActionButton
                          action={revokeEnrollmentAction.bind(null, e.id)}
                          confirm={`Revoke access to ${e.courses.name}? No money is refunded.`}
                        >
                          Revoke
                        </ActionButton>
                      )}
                      {e.status === "revoked" && (
                        <ActionButton action={restoreEnrollmentAction.bind(null, e.id)}>
                          Restore
                        </ActionButton>
                      )}
                      {paid && e.status !== "refunded" && (
                        <ActionButton
                          variant="danger"
                          action={manualRefundAction.bind(null, e.id)}
                          confirm={`Refund ${formatUsd(e.amount_paid_cents)} for ${e.courses.name} now? This goes to Stripe immediately and ignores the guarantee rules.`}
                        >
                          Refund {formatUsd(e.amount_paid_cents)}
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
        <div className="mt-4">
          <GrantCourseForm
            userId={user.id}
            courses={courses
              .filter((c) => !held.has(c.id))
              .map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>
      </Section>

      <Section title={`Responses (${responses.length}${responses.length === 200 ? "+" : ""})`}>
        {responses.length === 0 ? (
          <p className="text-muted-foreground">No responses yet.</p>
        ) : (
          <ul className="space-y-3">
            {responses.map((r) => (
              <li key={r.id} className="rounded-card border-border bg-surface border p-4">
                <p className="text-muted-foreground text-sm">
                  {courseOf.get(r.enrollment_id)?.name ?? "Course"} · Day {r.day_number} ·{" "}
                  {fmtDate(r.submitted_at)}
                  {r.is_starred && " · ★ testimonial"}
                </p>
                <p className="mt-1.5 whitespace-pre-wrap">{r.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
