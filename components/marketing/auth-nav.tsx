"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * Client-side so the marketing pages themselves can stay static and fast.
 */
export function AuthNav() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let active = true;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (active) setSignedIn(Boolean(data.session));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (signedIn) {
    return (
      <Button asChild size="sm">
        <Link href="/dashboard">My dashboard</Link>
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <Button asChild size="sm" variant="ghost">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/courses">Start</Link>
      </Button>
    </div>
  );
}
