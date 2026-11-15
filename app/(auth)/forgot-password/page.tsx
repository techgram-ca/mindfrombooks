import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Forgot your password?</h1>
      <p className="mt-1 mb-6 text-muted-foreground">Enter your email and we&apos;ll send a reset link.</p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-accent-strong underline-offset-4 hover:underline">
          Back to log in
        </Link>
      </p>
    </>
  );
}
