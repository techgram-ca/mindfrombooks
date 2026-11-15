import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BottomNav, SidebarNav } from "@/components/dashboard/nav";
import { TimezoneSync } from "@/components/dashboard/timezone-sync";
import { Logo } from "@/components/shared/logo";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Today", template: "%s · mindfrombooks" },
  robots: { index: false },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const profile = await requireUser();
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-border bg-surface sticky top-0 hidden h-dvh flex-col border-r p-5 md:flex">
        <Logo href="/dashboard" />
        <div className="mt-8 flex-1">
          <SidebarNav isAdmin={profile.role === "admin"} />
        </div>
        <p className="text-muted-foreground truncate text-sm" title={profile.email}>
          {profile.email}
        </p>
      </aside>
      <div className="min-w-0">
        <header className="border-border/70 bg-background flex h-14 items-center border-b px-5 md:hidden">
          <Logo href="/dashboard" />
        </header>
        <main className="mx-auto w-full max-w-3xl px-5 pt-6 pb-28 md:px-8 md:pt-10 md:pb-16">
          {children}
        </main>
      </div>
      <BottomNav />
      {!profile.timezone_confirmed && <TimezoneSync />}
    </div>
  );
}
