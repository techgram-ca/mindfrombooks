import type { EmailTemplate, EmailTemplateKey } from "@/lib/types";

/**
 * Default copy for every email. Seeded into the email_templates table and
 * editable at /admin/emails; these are also the fallback if a row is missing.
 * Placeholders use {{name}} syntax — see TEMPLATE_VARIABLES for what each
 * template can use.
 */
export const DEFAULT_TEMPLATES: Record<EmailTemplateKey, EmailTemplate> = {
  welcome: {
    key: "welcome",
    subject: "You're in — welcome to {{course_name}}",
    body_markdown:
      "Hi {{name}},\n\nWelcome to **{{course_name}}** — {{days}} days, one small action a day.\n\n**{{start_line}}** Each day you get one task and answer one question. A day's task closes at 11:59 pm your time, so try to do it early.\n\n{{guarantee_line}}\n\n{{account_line}}",
    button_label: "Open my dashboard",
  },
  daily_reminder: {
    key: "daily_reminder",
    subject: "Day {{day}} of {{course_name}} is ready: {{task_title}}",
    body_markdown:
      "Hi {{name}},\n\nToday's task for **{{course_name}}** (Day {{day}} of {{days}}):\n\n**{{task_title}}**\n\nIt takes a few minutes, and it closes at 11:59 pm tonight.{{more_line}}",
    button_label: "Do today's task",
  },
  missed_yesterday: {
    key: "missed_yesterday",
    subject: "Yesterday is gone. Today is open.",
    body_markdown:
      "Hi {{name}},\n\nYou missed yesterday's task in **{{course_name}}**. You can't redo it — but that's okay. One missed day doesn't undo the days you showed up.\n\nToday is Day {{day}}: **{{task_title}}**. It's open right now.{{grace_line}}",
    button_label: "Do today's task",
  },
  course_complete: {
    key: "course_complete",
    subject: "You finished {{course_name}} 🎉",
    body_markdown:
      "Hi {{name}},\n\nYou completed **{{course_name}}** — {{responded}} of {{days}} days done. That's real work, and your certificate is ready to share.\n\n{{refund_line}}\n\nReady for the next one? {{next_course_line}}",
    button_label: "See my certificate",
  },
  refund_confirmation: {
    key: "refund_confirmation",
    subject: "Your refund for {{course_name}} is on its way",
    body_markdown:
      "Hi {{name}},\n\nWe've refunded **{{amount}}** for **{{course_name}}** to your original payment method. Banks usually take 5–10 business days to show it.\n\nYou keep read-only access to your journal for this course. Thank you for doing the work.",
    button_label: "View my purchases",
  },
  admin_invite: {
    key: "admin_invite",
    subject: "You've been given access to {{courses}}",
    body_markdown:
      "Hi {{name}},\n\nYou've been given free access to **{{courses}}** on mindfrombooks.\n\nSet a password to get started. Day 1 opens tomorrow morning — one small task a day.",
    button_label: "Set my password",
  },
};

export const TEMPLATE_VARIABLES: Record<EmailTemplateKey, string[]> = {
  welcome: ["name", "course_name", "days", "start_line", "guarantee_line", "account_line"],
  daily_reminder: ["name", "course_name", "day", "days", "task_title", "more_line"],
  missed_yesterday: ["name", "course_name", "day", "days", "task_title", "grace_line"],
  course_complete: ["name", "course_name", "days", "responded", "refund_line", "next_course_line"],
  refund_confirmation: ["name", "course_name", "amount"],
  admin_invite: ["name", "courses"],
};

export const TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  welcome: "Welcome (after enrolling)",
  daily_reminder: "Daily reminder",
  missed_yesterday: "Missed yesterday",
  course_complete: "Course complete",
  refund_confirmation: "Refund confirmation",
  admin_invite: "Admin invite",
};
