import type { Metadata } from "next";
import {
  deleteManualTestimonialAction,
  setManualTestimonialPublishedAction,
  setRatingPublishedAction,
} from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/action-button";
import { TestimonialForm, type ManualTestimonial } from "@/components/admin/testimonial-form";
import { AdminHeader, ReportProblems, Section, TableWrap, fmtDate } from "@/components/admin/ui";
import { Stars } from "@/components/shared/stars";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getAllCourses, noteReportProblem, reportProblems } from "@/lib/queries/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Testimonials" };

interface RatingRow {
  id: string;
  course_id: string;
  user_id: string;
  stars: number;
  comment: string | null;
  share_ok: boolean;
  display_name: string | null;
  country: string | null;
  is_published: boolean;
  updated_at: string;
  profiles: { email: string } | null;
}

export default async function AdminTestimonialsPage() {
  await requireAdmin();
  const db = createAdminClient();
  const [courses, ratingsRes, manualRes] = await Promise.all([
    getAllCourses(),
    db
      .from("course_ratings")
      .select(
        "id, course_id, user_id, stars, comment, share_ok, display_name, country, is_published, updated_at, profiles(email)",
      )
      .order("updated_at", { ascending: false })
      .limit(300),
    db.from("testimonials").select("*").order("created_at", { ascending: false }),
  ]);
  if (ratingsRes.error) noteReportProblem("course_ratings", ratingsRes.error.message);
  if (manualRes.error) noteReportProblem("testimonials", manualRes.error.message);
  const ratings = (ratingsRes.data ?? []) as unknown as RatingRow[];
  const manual = (manualRes.data ?? []) as ManualTestimonial[];
  const nameOf = new Map(courses.map((c) => [c.id, `${c.emoji} ${c.name}`]));
  const options = courses.map((c) => ({ id: c.id, name: c.name }));
  const toReview = ratings.filter((r) => r.share_ok && r.comment && !r.is_published);

  return (
    <>
      <AdminHeader
        title="Testimonials"
        description="Everything shown on course pages comes from real learners: shared rating comments, starred daily responses, and quotes you add here."
      />
      <ReportProblems problems={reportProblems()} />

      <Section title="Ratings by course">
        <TableWrap>
          <thead>
            <tr>
              <th>Course</th>
              <th>Average</th>
              <th>Ratings</th>
              <th>Shown on page</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => {
              const rs = ratings.filter((r) => r.course_id === c.id);
              const avg = rs.length ? rs.reduce((s, r) => s + r.stars, 0) / rs.length : 0;
              return (
                <tr key={c.id}>
                  <td className="font-medium">{nameOf.get(c.id)}</td>
                  <td>
                    {rs.length ? (
                      <span className="inline-flex items-center gap-2">
                        <Stars value={avg} /> {avg.toFixed(1)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{rs.length}</td>
                  <td>{rs.length >= 3 ? "Yes" : `After ${3 - rs.length} more`}</td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </Section>

      <Section title={`Comments to review (${toReview.length})`}>
        {toReview.length === 0 ? (
          <p className="text-muted-foreground">
            Nothing waiting. Learners are asked for a rating when they finish a course.
          </p>
        ) : (
          <ul className="space-y-3">
            {toReview.map((r) => (
              <li
                key={r.id}
                className="rounded-card border-border bg-surface shadow-soft border p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Stars value={r.stars} />
                  <span className="font-medium">
                    {r.display_name}
                    {r.country ? `, ${r.country}` : ""}
                  </span>
                  <span className="text-muted-foreground">
                    · {nameOf.get(r.course_id)} · {fmtDate(r.updated_at)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap">{r.comment}</p>
                <div className="mt-3">
                  <ActionButton
                    variant="primary"
                    action={setRatingPublishedAction.bind(null, r.id, true)}
                  >
                    Publish on course page
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`All ratings (${ratings.length})`}>
        <TableWrap>
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Stars</th>
              <th>Comment</th>
              <th>Learner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ratings.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted-foreground text-center">
                  No ratings yet.
                </td>
              </tr>
            )}
            {ratings.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap">{fmtDate(r.updated_at)}</td>
                <td>{nameOf.get(r.course_id)}</td>
                <td>
                  <Stars value={r.stars} />
                </td>
                <td className="max-w-sm">
                  {r.comment ?? <span className="text-muted-foreground">—</span>}
                </td>
                <td>
                  {r.profiles?.email ?? "—"}
                  {r.share_ok && (
                    <div className="text-muted-foreground">
                      Shows as {r.display_name}
                      {r.country ? `, ${r.country}` : ""}
                    </div>
                  )}
                </td>
                <td>
                  {r.is_published ? (
                    <div className="flex flex-col items-start gap-2">
                      <Badge variant="success">Published</Badge>
                      <ActionButton action={setRatingPublishedAction.bind(null, r.id, false)}>
                        Hide
                      </ActionButton>
                    </div>
                  ) : r.share_ok && r.comment ? (
                    <Badge variant="accent">Waiting for review</Badge>
                  ) : (
                    <Badge variant="neutral">Private</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Section>

      <Section title="Add a quote you received">
        <Card>
          <CardBody>
            <p className="text-muted-foreground mb-4 text-sm">
              For real feedback that reached you outside the app — an Instagram DM, an email, a
              comment. Only add words a real customer wrote, with their permission.
            </p>
            <TestimonialForm key={manual.length} courses={options} />
          </CardBody>
        </Card>
      </Section>

      <Section title={`Quotes you added (${manual.length})`}>
        <div className="space-y-3">
          {manual.length === 0 && <p className="text-muted-foreground">None yet.</p>}
          {manual.map((t) => (
            <details
              key={t.id}
              className="group rounded-card border-border bg-surface shadow-soft border"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 p-4 [&::-webkit-details-marker]:hidden">
                {t.stars != null && <Stars value={t.stars} />}
                <span className="font-medium">
                  {t.name}
                  {t.country ? `, ${t.country}` : ""}
                </span>
                <span className="text-muted-foreground text-sm">
                  {t.course_id ? nameOf.get(t.course_id) : "General"}
                </span>
                {t.is_published ? (
                  <Badge variant="success">Shown</Badge>
                ) : (
                  <Badge variant="neutral">Hidden</Badge>
                )}
                {t.is_dev_sample && (
                  <Badge variant="danger">Dev sample — never shown in production</Badge>
                )}
                <span className="text-muted-foreground w-full truncate text-sm">“{t.body}”</span>
              </summary>
              <div className="border-border space-y-4 border-t p-4">
                <p className="text-muted-foreground text-sm">Source: {t.source_note}</p>
                <TestimonialForm courses={options} testimonial={t} />
                <div className="flex gap-2">
                  <ActionButton
                    action={setManualTestimonialPublishedAction.bind(null, t.id, !t.is_published)}
                  >
                    {t.is_published ? "Hide" : "Show"}
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    confirm="Delete this testimonial?"
                    action={deleteManualTestimonialAction.bind(null, t.id)}
                  >
                    Delete
                  </ActionButton>
                </div>
              </div>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
