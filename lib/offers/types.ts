/**
 * Long-form "offer page" content for a course. When a course has one, its
 * sales page uses the offer layout instead of the standard one. Everything
 * else (price, days, grace days, sample days, books, testimonials) still comes
 * from the database, so the admin stays the source of truth for those.
 */
export interface OfferQuote {
  text: string;
  author: string;
  source?: string;
}

export interface OfferContent {
  eyebrow: string;
  /** Headline lines. The last one is highlighted. */
  headline: string[];
  subhead: string;
  heroPoints: string[];
  pains: { title: string; body: string }[];
  painsVerdict: string;
  /** One big quote shown on its own between sections. */
  featuredQuote: OfferQuote;
  quotes: OfferQuote[];
  calculator: {
    title: string;
    intro: string;
  };
  transformation: { before: string; after: string }[];
  /** Day numbers to show by title in each phase of the journey. */
  journeyHighlights: number[];
  valueLine: { title: string; body: string };
  forYou: string[];
  notForYou: string[];
  extraFaq: { q: string; a: string }[];
  finalCta: { title: string; body: string };
}
