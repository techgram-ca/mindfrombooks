import { aiAnimationOffer } from "./ai-animation-instagram";
import { fixYourMoneyOffer } from "./fix-your-money";
import type { OfferContent, WorkshopOfferContent } from "./types";

const OFFERS: Record<string, OfferContent> = {
  "fix-your-money": fixYourMoneyOffer,
};

/** Long-form offer content for a course, if it has one. */
export function getOffer(slug: string): OfferContent | null {
  return OFFERS[slug] ?? null;
}

const WORKSHOP_OFFERS: Record<string, WorkshopOfferContent> = {
  "ai-animation-instagram": aiAnimationOffer,
};

/** Long-form offer content for a self-paced workshop, if it has one. */
export function getWorkshopOffer(slug: string): WorkshopOfferContent | null {
  return WORKSHOP_OFFERS[slug] ?? null;
}

export type { OfferContent, OfferQuote, WorkshopOfferContent } from "./types";
