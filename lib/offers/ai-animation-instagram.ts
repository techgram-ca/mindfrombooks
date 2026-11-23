import type { WorkshopOfferContent } from "./types";

export const aiAnimationOffer: WorkshopOfferContent = {
  eyebrow: "The exact system that grew @mindfrombooks to 35K in under a month",
  headline: ["No editing skills.", "No design skills.", "2–3 hours from now, you're a creator."],
  subhead:
    "If you can copy, paste and click, you can do this. You type what you want — Claude makes the video. Set up your studio, make your first Reel and post it, all in one afternoon.",
  heroPoints: [
    "Basic computer skills — that's all you need",
    "Your first Reel posted in 2–3 hours",
    "No camera, no face, no editing app",
    "Grow an audience brands pay to reach",
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
  needs: {
    yes: [
      "A Windows, Mac or Linux computer",
      "Basic skills: copy, paste, click",
      "A Claude Pro plan",
      "An afternoon to set up",
    ],
    no: [
      "Video editing skills or software",
      "Design or animation skills",
      "Coding — Claude writes every line",
      "A camera, a studio or showing your face",
    ],
  },
  timeline: {
    title: "From zero to content creator in one afternoon",
    intro: "Follow the 8 video lessons in order. Copy each prompt, paste it, press enter.",
    steps: [
      {
        when: "Hour 1",
        title: "Your studio is ready",
        body: "Claude Pro set up, one prompt installs every free video tool, your voice is connected. Lessons 1–3.",
      },
      {
        when: "Hour 2",
        title: "Your first Reel is made",
        body: "Pick a style you love, describe one idea, and get a finished animated Reel with voice and music. Lessons 4–6.",
      },
      {
        when: "Hour 3",
        title: "You're posting like a pro",
        body: "Fresh styles on demand and a 3-a-day posting plan for your whole week. Lessons 7–8.",
      },
    ],
  },
  money: {
    title: "Followers are an asset. Brands pay to reach them.",
    intro:
      "Every Reel you post is another chance to be found. Once you've built an engaged audience, brands pay creators to promote their products — and bigger accounts earn thousands a month from deals like these.",
    points: [
      {
        title: "Sponsored Reels",
        body: "Brands pay you to feature their product in a video — made in minutes with your studio.",
      },
      {
        title: "Paid promotions",
        body: "Shoutouts and story posts for pages and businesses that want your audience.",
      },
      {
        title: "Affiliate links",
        body: "Earn a cut every time a follower buys something you recommend.",
      },
      {
        title: "Your own offers",
        body: "Sell your own products, services or courses to people who already trust you.",
      },
    ],
    disclaimer:
      "No income or follower numbers are promised. Earnings depend on your niche, your audience, your engagement and the work you put in — most creators earn nothing from deals until they've built a real audience.",
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
    title: "Every day you wait is 3 Reels you didn't post.",
    body: "Start this afternoon. In 2–3 hours your studio is set up and your first Reel is live — no skills, no editor, no excuses.",
  },
};
