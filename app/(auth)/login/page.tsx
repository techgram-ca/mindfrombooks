import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/auth-forms";
import { isGoogleSignInEnabled } from "@/lib/supabase/providers";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = safeNextPath(sp.next);
  const googleEnabled = await isGoogleSignInEnabled();
  return (
    <>
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="text-muted-foreground mt-1 mb-6">Today&apos;s task is waiting.</p>
      <LoginForm next={next} linkError={sp.error === "link"} googleEnabled={googleEnabled} />
      <p className="text-muted-foreground mt-6 text-center text-sm">
        New here?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="text-accent-strong font-medium underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
