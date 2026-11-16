"use client";
/**
 * One place for product analytics. Today this forwards to Vercel Web
 * Analytics; to add PostHog later, call it here too and nothing else changes.
 */
import { track as vercelTrack } from "@vercel/analytics";

export type TrackEvent =
  | "course_viewed"
  | "coupon_applied"
  | "signup_completed"
  | "checkout_started"
  | "purchase_completed"
  | "task_submitted"
  | "course_completed"
  | "refund_requested"
  | "certificate_shared"
  | "course_rated";

export type TrackProps = Record<string, string | number | boolean | null>;

/** Flip to a real consent check if a cookie banner is ever needed. */
function hasConsent(): boolean {
  return true;
}

export function track(event: TrackEvent, props?: TrackProps): void {
  if (!hasConsent()) return;
  try {
    vercelTrack(event, props);
  } catch {
    // Analytics must never break the product.
  }
}
