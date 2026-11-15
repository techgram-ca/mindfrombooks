import type { Metadata } from "next";
import { AdminSettingsForm } from "@/components/admin/misc-forms";
import { AdminHeader } from "@/components/admin/ui";
import { Card, CardBody } from "@/components/ui/card";
import { DEFAULT_SETTINGS, type AppSettings } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const { data } = await createAdminClient().from("app_settings").select("*").maybeSingle();
  return (
    <>
      <AdminHeader
        title="Settings"
        description="Grace days are set per course, on each course's edit page."
      />
      <Card className="max-w-xl">
        <CardBody>
          <AdminSettingsForm settings={(data as AppSettings | null) ?? DEFAULT_SETTINGS} />
        </CardBody>
      </Card>
    </>
  );
}
