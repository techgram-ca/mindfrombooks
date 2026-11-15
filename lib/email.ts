import "server-only";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { EmailLayout } from "@/emails/layout";
import { fillTemplate, markdownToText } from "@/emails/markdown";
import { DEFAULT_TEMPLATES } from "@/emails/defaults";
import { createAdminClient } from "@/lib/supabase/admin";
import { unsubscribeUrl } from "@/lib/unsubscribe";
import { siteUrl } from "@/lib/utils";
import type { EmailTemplate, EmailTemplateKey } from "@/lib/types";

let resend: Resend | null = null;

export async function getTemplate(key: EmailTemplateKey): Promise<EmailTemplate> {
  try {
    const { data } = await createAdminClient()
      .from("email_templates")
      .select("key, subject, body_markdown, button_label")
      .eq("key", key)
      .maybeSingle();
    if (data) return data as EmailTemplate;
  } catch {
    // fall through to the built-in copy
  }
  return DEFAULT_TEMPLATES[key];
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export async function renderTemplate(
  template: Pick<EmailTemplate, "subject" | "body_markdown" | "button_label">,
  vars: Record<string, string | number>,
  options: { buttonUrl?: string; unsubscribeUrl?: string | null } = {},
): Promise<RenderedEmail> {
  const subject = fillTemplate(template.subject, vars).replace(/\s+/g, " ").trim();
  const body = fillTemplate(template.body_markdown, vars).trim();
  const buttonLabel = fillTemplate(template.button_label, vars).trim();
  const html = await render(
    EmailLayout({
      preview: markdownToText(body).split("\n").find(Boolean)?.slice(0, 120) ?? subject,
      body,
      buttonLabel: buttonLabel || undefined,
      buttonUrl: options.buttonUrl,
      unsubscribeUrl: options.unsubscribeUrl,
      siteUrl: siteUrl(),
    }),
  );
  const text = [
    markdownToText(body),
    buttonLabel && options.buttonUrl ? `${buttonLabel}: ${options.buttonUrl}` : "",
    options.unsubscribeUrl ? `Unsubscribe from daily reminders: ${options.unsubscribeUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  return { subject, html, text };
}

export interface SendEmailInput {
  to: string;
  userId: string | null;
  templateKey: EmailTemplateKey;
  vars: Record<string, string | number>;
  buttonUrl?: string;
  enrollmentId?: string | null;
  /**
   * When set, at most one email with this key is sent per user per local day
   * (enforced by a unique index on email_log).
   */
  dedupeKey?: string;
  /** The user's local date (yyyy-MM-dd); defaults to today in UTC. */
  localDate?: string;
}

export type SendEmailResult =
  { status: "sent" } | { status: "skipped" } | { status: "failed"; error: string };

/**
 * The only way email leaves the app. Logs every attempt to email_log and never
 * throws: a failed email must not break a purchase, a refund or a cron run.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const db = createAdminClient();
  const sentOn = input.localDate ?? new Date().toISOString().slice(0, 10);
  const logRow = {
    user_id: input.userId,
    template_key: input.templateKey,
    enrollment_id: input.enrollmentId ?? null,
    sent_on: sentOn,
    dedupe_key: input.dedupeKey ?? null,
  };
  let logId: string | null = null;

  try {
    // Claim the daily slot first so two overlapping cron runs can't both send.
    const { data: log, error: logError } = await db
      .from("email_log")
      .insert(logRow)
      .select("id")
      .single();
    if (logError) {
      if (logError.code === "23505") return { status: "skipped" };
      console.error("[email] could not write email_log", logError.message);
    } else {
      logId = log.id as string;
    }

    const key = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!key || !from) throw new Error("Email is not configured (RESEND_API_KEY / EMAIL_FROM)");
    resend ??= new Resend(key);

    const unsubscribe = input.userId ? unsubscribeUrl(input.userId) : null;
    const template = await getTemplate(input.templateKey);
    const email = await renderTemplate(template, input.vars, {
      buttonUrl: input.buttonUrl,
      unsubscribeUrl: unsubscribe,
    });

    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      headers: unsubscribe
        ? {
            "List-Unsubscribe": `<${unsubscribe.replace("/unsubscribe?", "/api/unsubscribe?")}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          }
        : undefined,
    });
    if (error) throw new Error(error.message);
    return { status: "sent" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`[email] ${input.templateKey} to user ${input.userId ?? "?"} failed: ${message}`);
    try {
      if (logId) {
        await db
          .from("email_log")
          .update({ status: "failed", error: message.slice(0, 500) })
          .eq("id", logId);
      }
    } catch {
      // nothing more we can do
    }
    return { status: "failed", error: message };
  }
}
