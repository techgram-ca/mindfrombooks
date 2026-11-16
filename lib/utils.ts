import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function siteUrl(path = ""): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") || path === "" ? path : `/${path}`}`;
}

/** Only allow same-site relative redirects (blocks //evil.com and absolute URLs). */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export const INSTAGRAM_URL = "https://www.instagram.com/mindfrombooks/";
export const BRAND = "mindfrombooks";
export const SUPPORT_EMAIL = "mindfrombooks22@gmail.com";
/** Date shown on the Terms, Privacy and Refund pages. Update it when you change them. */
export const LEGAL_UPDATED = "November 16, 2026";
export const TAGLINE = "Books teach. Daily action changes you.";
