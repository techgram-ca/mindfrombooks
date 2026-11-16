"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/responses", label: "Responses" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/settings", label: "Settings" },
];

/** `openSupport` adds a count badge to the Support link. */
export function AdminNav({ openSupport = 0 }: { openSupport?: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-5 pb-2 md:px-8">
      {items.map((i) => {
        const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            {i.label}
            {i.href === "/admin/support" && openSupport > 0 && (
              <span
                className="bg-danger ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white"
                aria-label={`${openSupport} open`}
              >
                {openSupport}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
