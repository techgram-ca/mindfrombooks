import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefundStatus } from "@/components/dashboard/refund-status";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth";
import { getLearnerState } from "@/lib/queries/learning";
import { createClient } from "@/lib/supabase/server";
import { formatUsd } from "@/lib/pricing";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "Purchases & refunds" };

type OrderRow = Order & {
  courses: { name: string; emoji: string } | null;
  bundles: { name: string } | null;
  coupons: { code: string } | null;
};

const statusLabel: Record<Order["status"], string> = {
  pending: "Pending",
  paid: "Paid",
  partially_refunded: "Partly refunded",
  refunded: "Refunded",
};

export default async function PurchasesPage() {
  const profile = await requireUser("/dashboard/purchases");
  const supabase = await createClient();
  const [{ views }, ordersRes] = await Promise.all([
    getLearnerState(profile),
    supabase
      .from("orders")
      .select("*, courses(name, emoji), bundles(name), coupons(code)")
      .eq("user_id", profile.id)
      .neq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);
  const orders = (ordersRes.data ?? []) as OrderRow[];
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: profile.timezone,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Purchases &amp; refunds</h1>
        <p className="text-muted-foreground mt-1">
          Your orders, and where each course stands with the guarantee.
        </p>
      </div>

      <section aria-labelledby="guarantee-heading">
        <h2 id="guarantee-heading" className="mb-3 text-xl font-semibold">
          Refund guarantee
        </h2>
        {views.length === 0 ? (
          <EmptyState
            emoji="🧾"
            title="No courses yet"
            action={
              <Button asChild>
                <Link href="/courses">Browse courses</Link>
              </Button>
            }
          >
            When you enroll, each course shows its refund status here.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {views.map((view) => (
              <Card key={view.enrollment.id}>
                <CardBody className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/dashboard/courses/${view.course.slug}`}
                      className="font-semibold hover:underline"
                    >
                      <span aria-hidden>{view.course.emoji} </span>
                      {view.course.name}
                    </Link>
                    <span className="text-muted-foreground shrink-0 text-sm">
                      {view.progress.isPaid ? formatUsd(view.enrollment.amount_paid_cents) : "Free"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {view.progress.respondedCount} of {view.course.days} days done
                    {view.progress.missedDays.length > 0 &&
                      ` · ${view.progress.missedDays.length} missed`}
                    {view.enrollment.source === "bundle" && " · part of All Access"}
                  </p>
                  <RefundStatus view={view} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="orders-heading">
        <h2 id="orders-heading" className="mb-3 text-xl font-semibold">
          Orders
        </h2>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="divide-border rounded-card border-border bg-surface divide-y overflow-hidden border">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {o.courses
                      ? `${o.courses.emoji} ${o.courses.name}`
                      : (o.bundles?.name ?? "Order")}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {dateFmt.format(new Date(o.created_at))}
                    {o.coupons?.code && ` · code ${o.coupons.code}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium">
                    {o.amount_total_cents === 0 ? "Free" : formatUsd(o.amount_total_cents)}
                  </p>
                  <Badge variant={o.status === "paid" ? "success" : "neutral"}>
                    {statusLabel[o.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
