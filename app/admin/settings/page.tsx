import type { Metadata } from "next";
import { refreshPublicPagesAction } from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/action-button";
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
      <Card className="mt-6 max-w-xl">
        <CardBody className="space-y-3">
          <h2 className="text-lg font-semibold">Refresh public pages</h2>
          <p className="text-muted-foreground text-sm">
            Course and home pages are cached for up to 5 minutes. If you changed something directly
            in Supabase (for example by running an SQL script), press this to show it straight away.
          </p>
          <ActionButton action={refreshPublicPagesAction}>Refresh public pages now</ActionButton>
        </CardBody>
      </Card>
    </>
  );
}
