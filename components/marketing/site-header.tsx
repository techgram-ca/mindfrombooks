import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { AuthNav } from "./auth-nav";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/guarantee", label: "Guarantee" },
];

export function SiteHeader({ announcement }: { announcement?: string | null }) {
  return (
    <>
      {announcement && (
        <div
          className="bg-primary text-primary-foreground px-4 py-2 text-center text-sm"
          role="status"
        >
          {announcement}
        </div>
      )}
      <header className="border-border/70 bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
        <div className="container-page flex h-14 items-center justify-between gap-3">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-medium md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <AuthNav />
        </div>
        <nav
          aria-label="Sections"
          className="container-page flex gap-5 overflow-x-auto pb-2.5 text-sm font-medium md:hidden"
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted-foreground whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
