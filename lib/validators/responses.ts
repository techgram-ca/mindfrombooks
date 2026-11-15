import { z } from "zod";

export const MAX_RESPONSE_CHARS = 5000;

export const responseSchema = z.object({
  enrollmentId: z.string().uuid(),
  body: z
    .string()
    .transform((s) => s.replace(/\r\n/g, "\n").trim())
    .pipe(
      z
        .string()
        .min(1, "Write a few words about what you did today.")
        .max(MAX_RESPONSE_CHARS, `Keep it under ${MAX_RESPONSE_CHARS} characters.`),
    ),
});
