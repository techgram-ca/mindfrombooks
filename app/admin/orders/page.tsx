import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, Section, TableWrap, fmtDate } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/pricing";
import { stripeDashboardUrl } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, Refund } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Orders" };

type OrderRow = Order & {
  profiles: { email: string } | null;
  courses: { name: string } | null;
  bundles: { name: string } | null;
  coupons: { code: string } | null;
};
type RefundRow = Refund & {
  profiles: { email: string } | null;
  enrollments: { courses: { name: string } | null } | null;
  orders: { stripe_payment_intent_id: string | null } | null;
};

const variant = {
  paid: "success",
  pending: "outline",
  partially_refunded: "accent",
  refunded: "neutral",
} as const;

export default async function AdminOrdersPage() {
  await requireAdmin();
  const db = createAdminClient();
  const [ordersRes, refundsRes] = await Promise.all([
    db
      .from("orders")
      .select("*, profiles(email), courses(name), bundles(name), coupons(code)")
      .neq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(200),
    db
      .from("refunds")
      .select("*, profiles(email), enrollments(courses(name)), orders(stripe_payment_intent_id)")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);
  if (ordersRes.error) throw new Error(ordersRes.error.message);
  const orders = (ordersRes.data ?? []) as unknown as OrderRow[];
  const refunds = (refundsRes.data ?? []) as unknown as RefundRow[];

  return (
    <>
      <AdminHeader title="Orders" description="The latest 200 payments and refunds." />
      <TableWrap>
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Amount</th>
            <th>Coupon</th>
            <th>Campaign</th>
            <th>Status</th>
            <th>Stripe</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={8} className="text-muted-foreground text-center">
                No orders yet.
              </td>
            </tr>
          )}
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="whitespace-nowrap">{fmtDate(o.created_at)}</td>
              <td>
                {o.user_id ? (
                  <Link href={`/admin/users/${o.user_id}`} className="hover:underline">
                    {o.profiles?.email ?? "—"}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Deleted account</span>
                )}
              </td>
              <td>{o.courses?.name ?? o.bundles?.name ?? "—"}</td>
              <td className="whitespace-nowrap">
                {o.amount_total_cents === 0 ? "Free" : formatUsd(o.amount_total_cents)}
                {o.amount_refunded_cents > 0 && (
                  <div className="text-muted-foreground">−{formatUsd(o.amount_refunded_cents)}</div>
                )}
              </td>
              <td>
                {o.coupons?.code ?? "—"}
                {o.amount_discount_cents > 0 && (
                  <div className="text-muted-foreground">−{formatUsd(o.amount_discount_cents)}</div>
                )}
              </td>
              <td>{o.utm_campaign ?? "—"}</td>
              <td>
                <Badge variant={variant[o.status]}>{o.status.replace("_", " ")}</Badge>
              </td>
              <td>
                {o.stripe_payment_intent_id ? (
                  <a
                    href={stripeDashboardUrl(o.stripe_payment_intent_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-strong underline"
                  >
                    Open
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <Section title="Refunds">
        <TableWrap>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Course</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Stripe</th>
            </tr>
          </thead>
          <tbody>
            {refunds.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted-foreground text-center">
                  No refunds yet.
                </td>
              </tr>
            )}
            {refunds.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap">{fmtDate(r.created_at)}</td>
                <td>{r.profiles?.email ?? "Deleted account"}</td>
                <td>{r.enrollments?.courses?.name ?? "—"}</td>
                <td>{formatUsd(r.amount_cents)}</td>
                <td>{r.type === "guarantee" ? "One-click guarantee" : "Admin / Stripe"}</td>
                <td>
                  {r.orders?.stripe_payment_intent_id ? (
                    <a
                      href={stripeDashboardUrl(r.orders.stripe_payment_intent_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-strong underline"
                    >
                      Open
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Section>
    </>
  );
}
