import type { Metadata } from "next";
import { EmailEditor } from "@/components/admin/misc-forms";
import { AdminHeader } from "@/components/admin/ui";
import { DEFAULT_TEMPLATES, TEMPLATE_LABELS, TEMPLATE_VARIABLES } from "@/emails/defaults";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EmailTemplate, EmailTemplateKey } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Emails" };

export default async function AdminEmailsPage() {
  await requireAdmin();
  const { data } = await createAdminClient().from("email_templates").select("*");
  const saved = new Map(((data ?? []) as EmailTemplate[]).map((t) => [t.key, t]));
  const keys = Object.keys(DEFAULT_TEMPLATES) as EmailTemplateKey[];
  return (
    <>
      <AdminHeader
        title="Emails"
        description="Edit the words; the layout, button and unsubscribe link are added for you. Previews use sample data."
      />
      <div className="space-y-6">
        {keys.map((key) => (
          <EmailEditor
            key={key}
            template={saved.get(key) ?? DEFAULT_TEMPLATES[key]}
            label={TEMPLATE_LABELS[key]}
            variables={TEMPLATE_VARIABLES[key]}
          />
        ))}
      </div>
    </>
  );
}
