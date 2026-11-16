import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/shared/logo";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Always rendered per request for the signed-in person — never cached or prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  // Open support messages, for the badge in the menu (fails soft before the migration).
  const { count: openSupport } = await createAdminClient()
    .from("support_messages")
    .select("id", { count: "exact" })
    .eq("status", "open")
    .limit(1);
  return (
    <div className="min-h-dvh">
      <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="flex h-14 items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <Logo href="/admin" />
            <span className="bg-accent-soft text-accent-strong rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Admin
            </span>
          </div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm">
            Back to my dashboard
          </Link>
        </div>
        <AdminNav openSupport={openSupport ?? 0} />
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">{children}</main>
    </div>
  );
}
