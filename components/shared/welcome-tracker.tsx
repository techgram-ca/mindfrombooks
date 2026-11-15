"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@/lib/track";

/** Fires `signup_completed` once, when a brand-new account first lands signed in. */
export function WelcomeTracker() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    const method = params.get("welcome");
    if (!method || fired.current) return;
    fired.current = true;
    track("signup_completed", { method: method === "google" ? "google" : "email" });
    const rest = new URLSearchParams(params);
    rest.delete("welcome");
    router.replace(rest.size > 0 ? `${pathname}?${rest}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  return null;
}
