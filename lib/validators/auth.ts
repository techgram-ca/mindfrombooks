import { z } from "zod";
import { isValidTimezone } from "@/lib/course-days";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.");
export const timezoneSchema = z.string().refine(isValidTimezone, "Pick a valid timezone.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(80),
  email: emailSchema,
  password: passwordSchema,
  timezone: timezoneSchema,
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(80),
  timezone: timezoneSchema,
  reminder_hour: z.coerce.number().int().min(0).max(23),
  email_reminders: z.boolean(),
});
