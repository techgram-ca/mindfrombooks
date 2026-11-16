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
  .object({
    code: couponCodeSchema.optional(),
    // The visitor's timezone, so a course bought before signing up starts on
    // the right local day.
    timezone: z.string().max(64).optional(),
    ...productShape,
  })
  .refine(exactlyOne, "Choose a course or the bundle.");

/** Metadata we put on the Stripe Checkout Session and read back in the webhook. */
export const sessionMetadataSchema = z.object({
  /** Empty for a guest checkout: the account is created after payment. */
  userId: z.string().uuid().or(z.literal("")).optional(),
  timezone: z.string().max(64).optional(),
  attrSource: z.string().max(200).optional(),
  attrMedium: z.string().max(200).optional(),
  attrLanding: z.string().max(200).optional(),
  attrReferrer: z.string().max(200).optional(),
  courseId: z.string().uuid().optional().or(z.literal("")),
  bundleId: z.string().uuid().optional().or(z.literal("")),
  couponId: z.string().uuid().optional().or(z.literal("")),
  utmCampaign: z.string().max(200).optional(),
  priceCents: z.coerce.number().int().min(0),
});
