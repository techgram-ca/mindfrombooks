import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { setSupportStatusAction } from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/action-button";
import { SupportNote } from "@/components/admin/support-note";
import { AdminHeader, ReportProblems, fmtDate } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { noteReportProblem, reportProblems } from "@/lib/queries/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";
import { SUPPORT_TOPICS, type SupportTopic } from "@/lib/validators/support";

export const metadata: Metadata = { title: "Support" };

interface Message {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  topic: SupportTopic;
  message: string;
  status: "open" | "resolved";
  admin_note: string | null;
  resolved_at: string | null;
  created_at: string;
}

function replyHref(m: Message): string {
  const subject = `Re: your message to mindfrombooks`;
  const quoted = m.message
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const body = `Hi ${m.name.split(/\s+/)[0]},\n\n\n\n—\nmindfrombooks\n\nOn ${fmtDate(m.created_at)} you wrote:\n${quoted}`;
  return `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const view = sp.status === "resolved" ? "resolved" : "open";
  const db = createAdminClient();
  const [{ data, error }, openCount, resolvedCount] = await Promise.all([
    db
      .from("support_messages")
      .select("*")
      .eq("status", view)
      .order("created_at", { ascending: view === "open" })
      .limit(200),
    db.from("support_messages").select("id", { count: "exact" }).eq("status", "open").limit(1),
    db.from("support_messages").select("id", { count: "exact" }).eq("status", "resolved").limit(1),
  ]);
  if (error) noteReportProblem("support_messages", error.message);
  const messages = (data ?? []) as Message[];

  return (
    <>
      <AdminHeader
        title="Support"
        description="Messages sent from the Contact us page. Reply by email, then mark them resolved."
      />
      <ReportProblems problems={reportProblems()} />
      <div
        className="bg-surface-muted mb-5 inline-flex gap-1 rounded-full p-1"
        role="tablist"
        aria-label="Filter messages"
      >
        {(["open", "resolved"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/support${s === "resolved" ? "?status=resolved" : ""}`}
            role="tab"
            aria-selected={view === s}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              view === s ? "bg-surface shadow-soft text-foreground" : "text-muted-foreground",
            )}
          >
            {s === "open"
              ? `Open (${openCount.count ?? 0})`
              : `Resolved (${resolvedCount.count ?? 0})`}
          </Link>
        ))}
      </div>

      {messages.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center">
          {view === "open" ? "No open messages. 🎉" : "No resolved messages yet."}
        </p>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id} className="rounded-card border-border bg-surface shadow-soft border p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold">{m.name}</span>
                <a
                  href={`mailto:${m.email}`}
                  className="text-accent-strong text-sm underline-offset-2 hover:underline"
                >
                  {m.email}
                </a>
                <Badge variant={m.topic === "payment" ? "accent" : "neutral"}>
                  {SUPPORT_TOPICS[m.topic] ?? m.topic}
                </Badge>
                {m.user_id ? (
                  <Link
                    href={`/admin/users/${m.user_id}`}
                    className="text-muted-foreground text-sm underline-offset-2 hover:underline"
                  >
                    View account
                  </Link>
                ) : (
                  <span className="text-muted-foreground text-sm">Not logged in</span>
                )}
                <span className="text-muted-foreground ml-auto text-sm">
                  {fmtDate(m.created_at)}
                </span>
              </div>
              <p className="mt-3 leading-relaxed whitespace-pre-wrap">{m.message}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                <SupportNote key={`${m.id}-${m.admin_note ?? ""}`} id={m.id} note={m.admin_note} />
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button asChild size="sm">
                    <a href={replyHref(m)}>
                      <Mail aria-hidden /> Reply by email
                    </a>
                  </Button>
                  {m.status === "open" ? (
                    <ActionButton action={setSupportStatusAction.bind(null, m.id, "resolved")}>
                      Mark resolved
                    </ActionButton>
                  ) : (
                    <ActionButton action={setSupportStatusAction.bind(null, m.id, "open")}>
                      Reopen
                    </ActionButton>
                  )}
                </div>
              </div>
              {m.resolved_at && (
                <p className="text-muted-foreground mt-2 text-xs">
                  Resolved {fmtDate(m.resolved_at)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
