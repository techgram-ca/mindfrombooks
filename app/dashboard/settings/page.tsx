import type { Metadata } from "next";
import Link from "next/link";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = await requireUser("/dashboard/settings");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <SettingsForm profile={profile} />
      <p className="text-muted-foreground text-sm">
        Need help with a course, a payment or your account?{" "}
        <Link href="/contact" className="text-accent-strong underline underline-offset-4">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
