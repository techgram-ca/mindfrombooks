import { z } from "zod";
import { emailSchema, timezoneSchema } from "./auth";

const text = (max: number) => z.string().trim().max(max);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #C8892B.");
const url = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || /^https:\/\//.test(v), "Use an https:// link.")
  .transform((v) => v || null);

export const courseSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: text(120).min(1, "Give the course a name."),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes for the slug."),
    category: text(60).min(1, "Add a category."),
    emoji: text(8).min(1, "Add an emoji."),
    accent_color: hex,
    short_description: text(300),
    description: text(4000),
    number_reason: text(300),
    outcomes: z.array(text(300).min(1)).max(12),
    notice: text(500).transform((v) => v || null),
    days: z.coerce.number().int().min(1, "A course needs at least 1 day.").max(366),
    price_dollars: z.coerce.number().min(0, "Price can't be negative.").max(10000),
    grace_days: z.coerce.number().int().min(0, "Grace days can't be negative.").max(365),
    cover_image_url: url,
    status: z.enum(["draft", "published", "archived"]),
    format: z.enum(["daily", "self_paced"]).default("daily"),
    has_guarantee: z.boolean().default(true),
    sort_order: z.coerce.number().int().min(0).max(9999),
    faq: z.array(z.object({ q: text(300).min(1), a: text(2000).min(1) })).max(30),
    books: z
      .array(z.object({ title: text(200).min(1), author: text(200), image_url: url }))
      .max(12),
    phases: z
      .array(
        z.object({
          name: text(120).min(1),
          start_day: z.coerce.number().int().min(1),
          end_day: z.coerce.number().int().min(1),
        }),
      )
      .max(12),
  })
  .superRefine((c, ctx) => {
    if (c.format === "daily" && c.grace_days >= c.days) {
      ctx.addIssue({
        code: "custom",
        message: "Grace days must be fewer than the number of days.",
      });
    }
    for (const p of c.phases) {
      if (p.end_day < p.start_day || p.end_day > c.days) {
        ctx.addIssue({
          code: "custom",
          message: `Phase "${p.name}" must sit within days 1–${c.days}.`,
        });
      }
    }
  });
export type CourseInput = z.infer<typeof courseSchema>;

export const taskFieldsSchema = z.object({
  title: text(200).min(1, "Every task needs a title."),
  book_insight: text(2000).default(""),
  book_reference: text(300).default(""),
  instructions: z.array(text(500).min(1)).max(10).default([]),
  response_prompt: text(600).default(""),
  min_response_chars: z.coerce.number().int().min(0).max(5000).default(0),
  is_sample: z.coerce.boolean().default(false),
});

export const lessonResourceSchema = z.object({
  kind: z.enum(["prompt", "command", "link", "note"]),
  label: text(120).min(1, "Every block needs a label."),
  content: z.string().trim().min(1, "Every block needs content.").max(8000),
  os: z.enum(["windows", "mac", "linux", "all"]).optional(),
});

export const taskSchema = taskFieldsSchema.extend({
  id: z.string().uuid(),
  /** Workshops: copy-able blocks. */
  resources: z.array(lessonResourceSchema).max(20).optional(),
  /** Workshops: a YouTube link or id. "" removes the video; undefined leaves it alone. */
  video: z.string().trim().max(300).optional(),
});
export const importTaskSchema = taskFieldsSchema.extend({
  day_number: z.coerce.number().int().min(1).max(366),
});
export type ImportTask = z.infer<typeof importTaskSchema>;

export const couponSchema = z
  .object({
    id: z.string().uuid().optional(),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        /^[A-Z0-9_-]{2,40}$/,
        "Codes use letters, numbers, dashes or underscores (2–40 characters).",
      ),
    discount_type: z.enum(["percent", "amount"]),
    discount_value: z.coerce.number().positive("Enter a discount greater than 0."),
    course_ids: z.array(z.string().uuid()),
    max_redemptions: z
      .union([z.literal(""), z.coerce.number().int().positive()])
      .transform((v) => (v === "" ? null : v)),
    one_per_user: z.boolean(),
    expires_at: z
      .string()
      .trim()
      .transform((v) => (v ? new Date(v) : null))
      .refine((d) => d === null || !Number.isNaN(d.getTime()), "That expiry date isn't valid."),
    source_label: text(120).transform((v) => v || null),
    active: z.boolean(),
  })
  .superRefine((c, ctx) => {
    if (
      c.discount_type === "percent" &&
      (c.discount_value > 100 || !Number.isInteger(c.discount_value))
    ) {
      ctx.addIssue({
        code: "custom",
        message: "A percentage must be a whole number from 1 to 100.",
      });
    }
  });

export const settingsSchema = z.object({
  refund_window_days: z.coerce.number().int().min(0).max(365),
  default_reminder_hour: z.coerce.number().int().min(0).max(23),
  announcement: text(300).transform((v) => v || null),
  instagram_followers: z.coerce.number().int().min(0).max(1_000_000_000),
});

export const emailTemplateSchema = z.object({
  key: z.enum([
    "welcome",
    "daily_reminder",
    "missed_yesterday",
    "course_complete",
    "refund_confirmation",
    "admin_invite",
  ]),
  subject: text(200).min(1, "Add a subject."),
  body_markdown: text(5000).min(1, "Add the email text."),
  button_label: text(60),
});

export const grantSchema = z.object({
  email: emailSchema,
  name: text(80),
  course_ids: z.array(z.string().uuid()).min(1, "Pick at least one course."),
});

export const testimonialSchema = z.object({
  id: z.string().uuid(),
  is_starred: z.boolean(),
  testimonial_name: text(80).transform((v) => v || null),
});

export { timezoneSchema };

export const manualTestimonialSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z
    .string()
    .transform((v) => v || null)
    .pipe(z.string().uuid().nullable()),
  name: text(60).min(1, "Add the person's name."),
  country: text(60).transform((v) => v || null),
  body: text(600).min(1, "Add the quote."),
  stars: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(5)])
    .transform((v) => (v === "" ? null : v)),
  source_note: text(300).min(3, "Say where this quote came from (e.g. Instagram DM, 12 Nov)."),
  permission_confirmed: z.literal(true, {
    error: "Confirm this is a real quote you have permission to publish.",
  }),
  is_published: z.boolean(),
});
