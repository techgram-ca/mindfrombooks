import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

/** Pinned so a Stripe API upgrade never changes behaviour without a code change. */
export const STRIPE_API_VERSION = "2026-10-28.endive";

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured: set STRIPE_SECRET_KEY");
  cached = new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
    appInfo: { name: "mindfrombooks" },
    // fetch() instead of a pooled Node agent: on serverless, a pooled socket can
    // go stale while the function is frozen, and the next request then hangs
    // until the timeout (80 s by default, twice with the retry ≈ 3 minutes).
    httpClient: Stripe.createFetchHttpClient(),
    timeout: 20_000,
    maxNetworkRetries: 2,
  });
  return cached;
}

export function stripeDashboardUrl(paymentIntentId: string): string {
  const test = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
  return `https://dashboard.stripe.com/${test ? "test/" : ""}payments/${paymentIntentId}`;
}
