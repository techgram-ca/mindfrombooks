import type { Metadata } from "next";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = await requireUser("/dashboard/settings");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <SettingsForm profile={profile} />
    </div>
  );
}
