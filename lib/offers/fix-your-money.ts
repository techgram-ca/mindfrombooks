import type { OfferContent } from "./types";

/**
 * Fix Your Money — offer page copy. Quotes are short, attributed lines from
 * the named people and books; nothing here is a customer claim.
 */
export const fixYourMoneyOffer: OfferContent = {
  eyebrow: "The 31-day money reset · inspired by 8 money classics",
  headline: [
    "Your salary arrives on payday.",
    "By the 20th, it's gone.",
    "Let's fix that in 31 days.",
  ],
  subhead:
    "One small money action a day — about 10 minutes — drawn from the best money books ever written. No finance degree, no spreadsheet marathon, no guilt. Just a month of doing the few things that actually change your bank balance.",
  heroPoints: [
    "See exactly where your salary goes",
    "Plug the leaks you don't notice",
    "Save automatically, before you can spend it",
    "A clear plan for debt, an emergency fund and investing",
  ],

  pains: [
    {
      title: "The payday-to-payday loop",
      body: "The first week after salary feels great. The last week is cheap dinners and checking your balance before every purchase.",
    },
    {
      title: "The raise that disappeared",
      body: "You earn more than you did three years ago. Somehow you don't have more. The new phone, the bigger rent, the nicer weekends quietly ate it.",
    },
    {
      title: "Tap, swipe, gone",
      body: "Food delivery, one-tap checkout, instant payments. Spending is so easy now that you never actually feel it leave.",
    },
    {
      title: "Subscriptions on autopilot",
      body: "Streaming, apps, cloud storage, a gym you went to twice. Each one is small. Together they cost you a weekend trip every month.",
    },
    {
      title: "Saving “whatever's left”",
      body: "The plan is to save what's left at the end of the month. There is never anything left at the end of the month.",
    },
    {
      title: "Investing is always “someday”",
      body: "You know you should invest. You'll start once you understand it properly. That was two years ago.",
    },
    {
      title: "One surprise away from the credit card",
      body: "A car repair, a wedding gift, a medical bill — and it goes on the card, with interest, again.",
    },
    {
      title: "The quiet money guilt",
      body: "You feel slightly guilty about almost every purchase, yet you still don't know if you're actually doing okay.",
    },
  ],
  painsVerdict:
    "None of this is a willpower problem. It's a system problem. And a system can be built in a month — one small step a day.",

  featuredQuote: {
    text: "Beware of little expenses; a small leak will sink a great ship.",
    author: "Benjamin Franklin",
    source: "The Way to Wealth",
  },
  quotes: [
    {
      text: "Doing well with money has a little to do with how smart you are and a lot to do with how you behave.",
      author: "Morgan Housel",
      source: "The Psychology of Money",
    },
    {
      text: "A part of all you earn is yours to keep.",
      author: "George S. Clason",
      source: "The Richest Man in Babylon",
    },
    {
      text: "Habits are the compound interest of self-improvement.",
      author: "James Clear",
      source: "Atomic Habits",
    },
    {
      text: "You do not rise to the level of your goals. You fall to the level of your systems.",
      author: "James Clear",
      source: "Atomic Habits",
    },
    {
      text: "Spend extravagantly on the things you love, and cut costs mercilessly on the things you don't.",
      author: "Ramit Sethi",
      source: "I Will Teach You to Be Rich",
    },
  ],

  calculator: {
    title: "Small amounts. Long time. Serious money.",
    intro:
      "Compounding is the quiet engine behind almost every wealthy household — and it works on small, boring, regular amounts. Move the sliders and see what yours could become.",
  },

  transformation: [
    { before: "“Where did my salary go?”", after: "You know your real number and every leak" },
    {
      before: "Saving whatever is left (nothing)",
      after: "Paying yourself first, automatically, on payday",
    },
    { before: "Subscriptions renewing on autopilot", after: "Only the ones you actually use" },
    {
      before: "One surprise away from the credit card",
      after: "A starter emergency fund with a real target",
    },
    { before: "Debt that never seems to shrink", after: "A debt snowball with a date it ends" },
    {
      before: "Investing is “someday”",
      after: "You know what an index fund costs and your next step",
    },
    { before: "Guilt about every purchase", after: "Guilt-free spending on the things you love" },
  ],

  journeyHighlights: [1, 4, 5, 7, 12, 13, 14, 17, 22, 23, 27, 31],

  valueLine: {
    title: "Less than one forgotten subscription",
    body: "Day 12 is cancelling one subscription you barely use. If it finds just one, the course has paid for itself — and that saving repeats every month after.",
  },

  forYou: [
    "You earn a steady salary but rarely see it grow",
    "You've tried budgeting apps and quit them within a month",
    "You want to start investing but don't know where to begin",
    "You like small, practical steps more than long lectures",
    "You can spare about 10 minutes a day for a month",
  ],
  notForYou: [
    "You want stock tips or a get-rich-quick plan",
    "You're looking for personalised financial, tax or legal advice",
    "You won't do the daily task — the whole course is doing",
  ],

  extraFaq: [
    {
      q: "I'm bad with money. Is this too advanced for me?",
      a: "It's built for exactly that. Day 1 is simply writing down one number. Each day is one small step, explained in plain language.",
    },
    {
      q: "Will you ask for my bank details or connect to my accounts?",
      a: "Never. You look at your own accounts yourself. You never have to share a balance or a number with us — your responses are about what you did and noticed.",
    },
    {
      q: "Does it work outside the US — in India, Canada, the UK?",
      a: "Yes. The habits (seeing your number, paying yourself first, cutting leaks, an emergency fund, low-cost investing) work in any currency. Where a step depends on your country, the task says so.",
    },
    {
      q: "Do I need a budgeting app or spreadsheet?",
      a: "No. Your phone's notes app and your bank statements are enough.",
    },
  ],

  finalCta: {
    title:
      "A month from now, you'll either have a system — or another month of wondering where it went.",
    body: "Ten minutes a day. One small action. And if you do all of it and still aren't happy, you get your money back with one click.",
  },
};
