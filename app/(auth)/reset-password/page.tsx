import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Choose a password</h1>
      <p className="text-muted-foreground mt-1 mb-6">You&apos;ll use it to log in from now on.</p>
      <ResetPasswordForm />
    </>
  );
}
