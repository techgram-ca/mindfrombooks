import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/auth-forms";
import { isGoogleSignInEnabled } from "@/lib/supabase/providers";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Create your account", robots: { index: false } };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNextPath((await searchParams).next);
  const googleEnabled = await isGoogleSignInEnabled();
  return (
    <>
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="text-muted-foreground mt-1 mb-6">
        One small action a day. That&apos;s the whole plan.
      </p>
      <SignupForm next={next} googleEnabled={googleEnabled} />
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="text-accent-strong font-medium underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
