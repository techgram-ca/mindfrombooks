import { z } from "zod";
import { emailSchema } from "./auth";

export const SUPPORT_TOPICS = {
  general: "A general question",
  course: "Something in a course",
  payment: "Payment or refund",
  account: "My account or login",
  feedback: "Feedback or an idea",
  other: "Something else",
} as const;

export type SupportTopic = keyof typeof SUPPORT_TOPICS;

export const supportMessageSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(80),
  email: emailSchema,
  topic: z.enum(Object.keys(SUPPORT_TOPICS) as [SupportTopic, ...SupportTopic[]]),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(4000, "Keep it under 4,000 characters."),
  /** Honeypot: hidden from people, filled in by bots. */
  website: z.string().max(200).optional(),
  /** When the form was shown (ms). Submissions within 3 seconds are bots. */
  startedAt: z.coerce.number().int().optional(),
});
