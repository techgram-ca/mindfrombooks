import { z } from "zod";

const productShape = {
  courseId: z.string().uuid().optional(),
  bundleId: z.string().uuid().optional(),
};

const exactlyOne = (v: { courseId?: string; bundleId?: string }) =>
  Boolean(v.courseId) !== Boolean(v.bundleId);

export const couponCodeSchema = z
  .string()
  .trim()
  .min(2, "Enter a code.")
  .max(40, "That code is too long.")
  .transform((s) => s.toUpperCase());

export const validateCouponSchema = z
  .object({ code: couponCodeSchema, ...productShape })
  .refine(exactlyOne, "Choose a course or the bundle.");

export const checkoutSchema = z
  .object({ code: couponCodeSchema.optional(), ...productShape })
  .refine(exactlyOne, "Choose a course or the bundle.");

/** Metadata we put on the Stripe Checkout Session and read back in the webhook. */
export const sessionMetadataSchema = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid().optional().or(z.literal("")),
  bundleId: z.string().uuid().optional().or(z.literal("")),
  couponId: z.string().uuid().optional().or(z.literal("")),
  utmCampaign: z.string().max(200).optional(),
  priceCents: z.coerce.number().int().min(0),
});
