import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { VisitorRate } from "@/components/admin/misc-forms";
import { AdminHeader, Section, Stat, TableWrap, pct } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/pricing";
import { getAllCourses, getCourseStats } from "@/lib/queries/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Coupon } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";

interface Overview {
  signups_today: number;
  signups_7d: number;
  signups_30d: number;
  signups_total: number;
  buyers_total: number;
  buyers_30d: number;
  paid_enrollments: number;
  revenue_cents: number;
  refunds_cents: number;
  refund_count: number;
  active_today: number;
}
interface CampaignRow {
  campaign: string;
  source: string;
  signups: number;
  buyers: number;
  revenue_cents: number;
}
interface CouponStat {
  coupon_id: string;
  orders: number;
  revenue_cents: number;
}

export default async function AdminOverviewPage() {
  await requireAdmin();
  const db = createAdminClient();
  const [overviewRes, campaignsRes, couponStatsRes, couponsRes, courses, stats] = await Promise.all(
    [
      db.rpc("admin_overview").maybeSingle(),
      db.rpc("admin_campaign_stats"),
      db.rpc("admin_coupon_stats"),
      db.from("coupons").select("id, code, source_label, times_redeemed"),
      getAllCourses(),
      getCourseStats(),
    ],
  );
  if (overviewRes.error) throw new Error(overviewRes.error.message);
  const o = overviewRes.data as Overview;
  const campaigns = (campaignsRes.data ?? []) as CampaignRow[];
  const couponStats = new Map(
    ((couponStatsRes.data ?? []) as CouponStat[]).map((c) => [c.coupon_id, c]),
  );
  const coupons = (
    (couponsRes.data ?? []) as Pick<Coupon, "id" | "code" | "source_label" | "times_redeemed">[]
  )
    .filter((c) => c.times_redeemed > 0 || couponStats.has(c.id))
    .sort((a, b) => b.times_redeemed - a.times_redeemed);

  return (
    <>
      <AdminHeader
        title="Overview"
        description="Signups, sales and how people are doing."
        actions={
          <Button asChild variant="outline" size="sm">
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
              Visitors in Vercel Analytics <ExternalLink />
            </a>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Signups today"
          value={o.signups_today}
          hint={`${o.signups_7d} in 7 days · ${o.signups_30d} in 30 days`}
        />
        <Stat
          label="Paid enrollments"
          value={o.paid_enrollments}
          hint={`${o.buyers_total} paying customers`}
        />
        <Stat
          label="Revenue"
          value={formatUsd(o.revenue_cents)}
          hint={`${formatUsd(o.refunds_cents)} refunded (${o.refund_count})`}
        />
        <Stat label="Net revenue" value={formatUsd(o.revenue_cents - o.refunds_cents)} />
        <Stat
          label="Signup → paid"
          value={pct(o.buyers_total, o.signups_total)}
          hint={`Last 30 days: ${pct(o.buyers_30d, o.signups_30d)}`}
        />
        <Stat
          label="Active today"
          value={o.active_today}
          hint="Submitted a response in the last 24 h"
        />
        <Stat label="Total signups" value={o.signups_total} />
        <VisitorRate signups30d={o.signups_30d} />
      </div>

      <Section title="Courses">
        <TableWrap>
          <thead>
            <tr>
              <th>Course</th>
              <th>Enrollments</th>
              <th>Finished</th>
              <th>Completion rate</th>
              <th>Refund rate</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => {
              const s = stats.get(c.id);
              return (
                <tr key={c.id}>
                  <td>
                    <Link
                      href={`/admin/courses/${c.id}/analytics`}
                      className="font-medium hover:underline"
                    >
                      {c.emoji} {c.name}
                    </Link>
                  </td>
                  <td>{s?.enrollments ?? 0}</td>
                  <td>{s?.finished ?? 0}</td>
                  <td>{pct(s?.completed ?? 0, s?.finished ?? 0)}</td>
                  <td>{pct(s?.refunded ?? 0, s?.paid_enrollments ?? 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
        <p className="text-muted-foreground mt-2 text-xs">
          Completion rate = of learners whose course has ended, the share who answered every
          required day.
        </p>
      </Section>

      <Section title="Campaigns">
        <TableWrap>
          <thead>
            <tr>
              <th>Campaign (utm_campaign)</th>
              <th>Source</th>
              <th>Signups</th>
              <th>Buyers</th>
              <th>Revenue</th>
              <th>Conversion</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted-foreground text-center">
                  No signups yet. Add ?utm_source=instagram&amp;utm_campaign=your-reel to the links
                  you share.
                </td>
              </tr>
            )}
            {campaigns.map((c) => (
              <tr key={c.campaign}>
                <td className="font-medium">{c.campaign}</td>
                <td>{c.source}</td>
                <td>{c.signups}</td>
                <td>{c.buyers}</td>
                <td>{formatUsd(c.revenue_cents)}</td>
                <td>{pct(c.buyers, c.signups)}</td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Section>

      <Section title="Coupons by source">
        <TableWrap>
          <thead>
            <tr>
              <th>Source label</th>
              <th>Code</th>
              <th>Redemptions</th>
              <th>Paid orders</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="text-muted-foreground text-center">
                  No coupon has been used yet.
                </td>
              </tr>
            )}
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="font-medium">{c.source_label ?? "—"}</td>
                <td>{c.code}</td>
                <td>{c.times_redeemed}</td>
                <td>{couponStats.get(c.id)?.orders ?? 0}</td>
                <td>{formatUsd(couponStats.get(c.id)?.revenue_cents ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Section>
    </>
  );
}
