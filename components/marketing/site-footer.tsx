import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { INSTAGRAM_URL, SUPPORT_EMAIL, TAGLINE } from "@/lib/utils";

const groups = [
  {
    title: "Courses",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/all-access", label: "All Access" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/guarantee", label: "Refund guarantee" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: INSTAGRAM_URL, label: "Instagram" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/refund-policy", label: "Refund policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-border bg-surface-muted/60 mt-20 border-t">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="text-muted-foreground mt-3 max-w-xs text-sm">{TAGLINE}</p>
        </div>
        {groups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="font-sans text-sm font-semibold tracking-normal">{g.title}</h2>
            <ul className="text-muted-foreground mt-3 space-y-2.5 text-sm">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container-page border-border text-muted-foreground border-t py-6 text-xs leading-relaxed">
        <p>
          © {new Date().getFullYear()} mindfrombooks. Prices are in US dollars. Courses are inspired
          by the books named and are not affiliated with, authorised or endorsed by their authors or
          publishers.
        </p>
        <p className="mt-2">
          Questions?{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="hover:text-foreground underline underline-offset-2"
          >
            {SUPPORT_EMAIL}
          </a>
          {" · "}
          Developed by{" "}
          <a
            href="https://techgram.ca"
            target="_blank"
            rel="noopener"
            className="hover:text-foreground font-medium underline underline-offset-2"
          >
            Techgram
          </a>
        </p>
      </div>
    </footer>
  );
}
