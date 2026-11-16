import type { Metadata } from "next";
import { setCouponActiveAction } from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/action-button";
import { CouponForm } from "@/components/admin/coupon-form";
import { AdminHeader, Section, fmtDate } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { formatUsd } from "@/lib/pricing";
import { getAllCourses } from "@/lib/queries/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Coupon } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Coupons" };

interface CouponStat {
  coupon_id: string;
  orders: number;
  revenue_cents: number;
}

export default async function AdminCouponsPage() {
  await requireAdmin();
  const db = createAdminClient();
  const [couponsRes, statsRes, courses] = await Promise.all([
    db.from("coupons").select("*").order("created_at", { ascending: false }),
    db.rpc("admin_coupon_stats"),
    getAllCourses(),
  ]);
  if (couponsRes.error) throw new Error(couponsRes.error.message);
  if (statsRes.error) console.error("[admin report] admin_coupon_stats:", statsRes.error.message);
  const coupons = (couponsRes.data ?? []) as Coupon[];
  const stats = new Map(((statsRes.data ?? []) as CouponStat[]).map((s) => [s.coupon_id, s]));
  const courseOptions = courses.map((c) => ({ id: c.id, name: c.name }));
  const nameOf = new Map(courses.map((c) => [c.id, c.name]));
  const now = new Date().getTime();

  return (
    <>
      <AdminHeader
        title="Coupons"
        description="Codes are stored in capitals. Share links like /courses/fix-your-money?code=YOURCODE to pre-fill them."
      />
      <Card>
        <CardBody>
          <h2 className="mb-4 text-xl font-semibold">New coupon</h2>
          <CouponForm key={coupons.length} courses={courseOptions} />
        </CardBody>
      </Card>

      <Section title={`All coupons (${coupons.length})`}>
        <div className="space-y-3">
          {coupons.map((c) => {
            const s = stats.get(c.id);
            const expired = c.expires_at != null && new Date(c.expires_at).getTime() <= now;
            const usedUp = c.max_redemptions != null && c.times_redeemed >= c.max_redemptions;
            return (
              <details
                key={c.id}
                className="group rounded-card border-border bg-surface shadow-soft border"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 p-4 [&::-webkit-details-marker]:hidden">
                  <span className="font-mono font-semibold">{c.code}</span>
                  <span>
                    {c.percent_off != null
                      ? `${c.percent_off}% off`
                      : `${formatUsd(c.amount_off_cents ?? 0)} off`}
                  </span>
                  {!c.active ? (
                    <Badge variant="neutral">Inactive</Badge>
                  ) : expired ? (
                    <Badge variant="danger">Expired</Badge>
                  ) : usedUp ? (
                    <Badge variant="danger">Used up</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                  <span className="text-muted-foreground text-sm">
                    Used {c.times_redeemed}
                    {c.max_redemptions != null ? ` of ${c.max_redemptions}` : ""} ·{" "}
                    {formatUsd(s?.revenue_cents ?? 0)} revenue
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {c.course_ids
                      ? c.course_ids.map((id) => nameOf.get(id) ?? "?").join(", ")
                      : "All courses + bundle"}
                    {c.expires_at ? ` · expires ${fmtDate(c.expires_at)}` : ""}
                    {c.source_label ? ` · ${c.source_label}` : ""}
                  </span>
                  <span className="text-accent-strong ml-auto text-sm group-open:hidden">Edit</span>
                </summary>
                <div className="border-border space-y-4 border-t p-4">
                  <CouponForm coupon={c} courses={courseOptions} />
                  <ActionButton action={setCouponActiveAction.bind(null, c.id, !c.active)}>
                    {c.active ? "Deactivate" : "Activate"}
                  </ActionButton>
                </div>
              </details>
            );
          })}
        </div>
      </Section>
    </>
  );
}
