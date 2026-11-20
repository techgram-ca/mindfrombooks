import { fixYourMoneyOffer } from "./fix-your-money";
import type { OfferContent } from "./types";

const OFFERS: Record<string, OfferContent> = {
  "fix-your-money": fixYourMoneyOffer,
};

/** Long-form offer content for a course, if it has one. */
export function getOffer(slug: string): OfferContent | null {
  return OFFERS[slug] ?? null;
}

export type { OfferContent, OfferQuote } from "./types";
