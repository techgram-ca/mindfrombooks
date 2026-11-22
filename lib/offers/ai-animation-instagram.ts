import type { WorkshopOfferContent } from "./types";

export const aiAnimationOffer: WorkshopOfferContent = {
  eyebrow: "Self-paced workshop · 8 video lessons · Windows, Mac & Linux",
  headline: ["I grew @mindfrombooks to 35K", "in under a month.", "No video editor."],
  subhead:
    "Every Reel was made by describing it to Claude. This workshop sets up the same AI video studio on your computer and hands you the exact prompts and posting system.",
  heroPoints: [
    "Animated Reels from one prompt",
    "Your own clips cut and captioned for you",
    "Natural AI voiceovers",
    "The 3-a-day posting system",
  ],
  comparison: {
    title: "The old way vs the Claude way",
    intro: "What it takes to post 3 Reels a day — about 90 a month.",
    rows: [
      {
        label: "Time per 30-second Reel",
        editor: "2–3 hours of cutting, captions and exports",
        claude: "About 15–20 minutes: describe, review, tweak",
      },
      {
        label: "Time for 90 Reels a month",
        editor: "180+ hours — a second full-time job",
        claude: "About 25–30 hours, made in batches",
      },
      {
        label: "Skills to learn",
        editor: "Weeks of editing tutorials",
        claude: "Plain English — if you can describe it, you can make it",
      },
      {
        label: "Software",
        editor: "About US$10–70 a month in editing apps",
        claude: "About US$20 a month for Claude Pro; video tools are free",
      },
      {
        label: "Or hire an editor",
        editor: "About US$20–50 per Reel — US$1,800+ for 90",
        claude: "You're the director; Claude does the editing",
      },
      {
        label: "Voiceover",
        editor: "Record yourself again and again",
        claude: "ElevenLabs: free, or about US$5 a month for better voices",
      },
      {
        label: "Fresh styles",
        editor: "Hunt for new templates and plugins",
        claude: "One prompt invents five new looks from your references",
      },
    ],
    footnote:
      "Typical estimates for a beginner. Your times and prices will vary, and growth is never guaranteed — it depends on your content and your consistency.",
  },
  outcomes: [
    {
      title: "Set up your studio",
      body: "Claude Code on your computer, every free video tool installed by one prompt, and your ElevenLabs voice connected. Lessons 1–3.",
    },
    {
      title: "Make videos",
      body: "Animated Reels inspired by styles you like, your own footage edited, voice and music added, and new styles on demand. Lessons 4–7.",
    },
    {
      title: "Grow on Instagram",
      body: "Spot trends, post 3 a day at 9 am, 2 pm and 8 pm, read your numbers and double down on what works. Lesson 8.",
    },
  ],
  peek: {
    lesson: 4,
    label: "From Lesson 4 — your first animated video",
    prompt: `Make a 20–30 second vertical Instagram Reel about: [YOUR IDEA].

Style: inspired by references/style-notes.md — borrow the feel, not the exact design.
Structure:
- Hook in the first 2 seconds as big on-screen text.
- 3–5 scenes, one idea per scene.
- Last scene: "Follow for more".

First show me the on-screen text, a voiceover script and scene timings. Wait for my OK.
Then build it and render to exports/.`,
  },
  costs: [
    {
      item: "This workshop",
      cost: "US$6.99 once",
      note: "Lifetime access. No subscription.",
      required: true,
    },
    {
      item: "Claude Pro",
      cost: "≈ US$20/mo",
      note: "Billed by Anthropic.",
      required: true,
    },
    {
      item: "ElevenLabs",
      cost: "US$0–5/mo",
      note: "Free plan works; paid sounds more natural.",
      required: false,
    },
    {
      item: "Video tools, music, sound",
      cost: "free",
      note: "Installed for you by Claude.",
      required: false,
    },
  ],
  finalCta: {
    title: "Stop editing. Start directing.",
    body: "Every lesson opens the moment you join. Set up once, then make your next Reel by describing it.",
  },
};
