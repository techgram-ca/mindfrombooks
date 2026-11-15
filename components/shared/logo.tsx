import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("text-foreground font-serif text-xl font-semibold tracking-tight", className)}
      aria-label="mindfrombooks home"
    >
      mind<span className="text-accent-strong">from</span>books
    </Link>
  );
}
