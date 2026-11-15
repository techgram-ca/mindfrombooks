"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Receipt, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Today", icon: Home, exact: true },
  { href: "/dashboard/courses", label: "My courses", icon: BookOpen },
  { href: "/dashboard/purchases", label: "Purchases", icon: Receipt },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function useActive() {
  const pathname = usePathname();
  return (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
}

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const isActive = useActive();
  return (
    <nav aria-label="Dashboard" className="space-y-1">
      {items.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href, exact) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
            isActive(href, exact)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
          )}
        >
          <Icon className="size-4.5" aria-hidden />
          {label}
        </Link>
      ))}
      {isAdmin && (
        <Link
          href="/admin"
          className="text-accent-strong hover:bg-accent-soft mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium"
        >
          <Shield className="size-4.5" aria-hidden />
          Admin
        </Link>
      )}
    </nav>
  );
}

export function BottomNav() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Dashboard"
      className="border-border bg-surface/95 pb-safe fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t backdrop-blur md:hidden"
    >
      {items.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href, exact) ? "page" : undefined}
          className={cn(
            "flex flex-col items-center gap-1 pt-2.5 text-[11px] font-medium",
            isActive(href, exact) ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <Icon
            className={cn("size-5", isActive(href, exact) && "text-accent-strong")}
            aria-hidden
          />
          {label}
        </Link>
      ))}
    </nav>
  );
}
