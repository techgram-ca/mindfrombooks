/** First-touch attribution cookie (set in proxy.ts, read on signup / checkout). */
import { z } from "zod";

export const ATTR_COOKIE = "mfb_attr";
export const ATTR_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const clip = z
  .string()
  .transform((s) => s.slice(0, 200))
  .nullable()
  .catch(null);

export const attributionSchema = z.object({
  source: clip,
  medium: clip,
  campaign: clip,
  landing: clip,
  referrer: clip,
  ts: z.number().catch(0),
});
export type Attribution = z.infer<typeof attributionSchema>;

export function attributionFromUrl(url: URL, referrer: string | null): Attribution | null {
  const p = url.searchParams;
  const source = p.get("utm_source") || p.get("ref");
  const medium = p.get("utm_medium");
  const campaign = p.get("utm_campaign");
  if (!source && !medium && !campaign) return null;
  return attributionSchema.parse({
    source: source || null,
    medium: medium || null,
    campaign: campaign || null,
    landing: url.pathname,
    referrer: referrer || null,
    ts: Date.now(),
  });
}

export function parseAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    return attributionSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
