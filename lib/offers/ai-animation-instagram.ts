import type { WorkshopOfferContent } from "./types";

export const aiAnimationOffer: WorkshopOfferContent = {
  eyebrow: "Self-paced workshop · 14 lessons · Windows, Mac & Linux",
  headline: [
    "I grew @mindfrombooks to 35K",
    "without opening a video editor.",
    "Here's exactly how.",
  ],
  subhead:
    "Every Reel on the account was made by describing it to Claude — no timelines, no keyframes, no editing software. This workshop sets up the same AI video studio on your computer, then gives you the prompts, the voiceover setup and the posting system behind the growth.",
  heroPoints: [
    "Animated Reels from a single prompt",
    "Your own footage edited and captioned for you",
    "Natural voiceovers with ElevenLabs",
    "The 3-a-day posting system that grew the account",
  ],
  story: {
    title: "35K followers. Zero hours in a video editor.",
    paragraphs: [
      "When I started @mindfrombooks I knew what I wanted to say, but not how to make videos look good. Learning editing software felt like a second job.",
      "So I stopped trying. I set up Claude on my computer, gave it a folder of videos whose style I liked, and described what I wanted. It wrote the script, built the animation, added the voice and exported the file. I directed; it edited.",
      "Then I posted — three times a day, every day — and kept inventing new styles whenever the old ones stopped working. That's the whole system, and it's what this workshop teaches, step by step.",
    ],
    signoff: "— the creator of @mindfrombooks",
  },
  pains: [
    {
      title: "Editing eats your evenings",
      body: "One 30-second Reel shouldn't take three hours of cutting, captioning and exporting.",
    },
    {
      title: "Templates all look the same",
      body: "Everyone uses the same five app templates, so nothing you post stands out.",
    },
    {
      title: "Inconsistent posting",
      body: "You post a few days in a row, run out of time, and the account goes quiet for weeks.",
    },
    {
      title: "Voiceovers feel awkward",
      body: "Recording your own voice ten times to get one clean take — or skipping voice altogether.",
    },
  ],
  outcomes: [
    {
      title: "Your AI video studio",
      body: "Claude Code on your computer with every free video tool installed by one prompt, and rules it follows every time.",
    },
    {
      title: "Animation from a prompt",
      body: "Describe an idea; get a finished vertical Reel with on-screen text, motion and captions.",
    },
    {
      title: "Your footage, edited",
      body: "Drop raw clips in a folder; get them cut, captioned and punched-in.",
    },
    {
      title: "Voice and sound",
      body: "Natural ElevenLabs voiceovers, plus free music and sound effects with the licences tracked.",
    },
    {
      title: "Styles that don't go stale",
      body: "A prompt that invents new looks from your references when the old ones stop working.",
    },
    {
      title: "A growth system",
      body: "What to post, when to post it, and how to read your numbers each week.",
    },
  ],
  peek: {
    lesson: 7,
    label: "From Lesson 7 — your first animated video",
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
      note: "Lifetime access, no subscription.",
      required: true,
    },
    {
      item: "Claude Pro",
      cost: "about US$20/month",
      note: "Required — Claude Code comes with a paid Claude plan. Billed by Anthropic.",
      required: true,
    },
    {
      item: "ElevenLabs voices",
      cost: "free, or about US$5/month",
      note: "Optional. The free plan works with lower quality and limits; the paid plan sounds far more natural.",
      required: false,
    },
    {
      item: "Video tools, music, sound effects",
      cost: "free",
      note: "Installed by Claude for you; free sound libraries.",
      required: false,
    },
  ],
  system: {
    title: "The posting system behind the growth",
    points: [
      "3 Reels a day — 9 am, 2 pm and 8 pm in your audience's timezone",
      "Make them in batches, schedule them, and never post in a panic",
      "A hook in the first 2 seconds, captions always on",
      "A new style whenever the old one starts to feel familiar",
      "A 10-minute weekly review of what got shared and saved",
    ],
  },
  forYou: [
    "You want to post Reels but hate editing",
    "You run a page, a small business or a personal brand",
    "You're happy to follow steps on your own computer",
    "You can spend about an hour on setup, then 20–30 minutes per batch of videos",
  ],
  notForYou: [
    "You won't pay for Claude Pro — it's required",
    "You want a guaranteed number of followers (nobody can honestly promise that)",
    "You're looking for traditional editing-software training",
  ],
  finalCta: {
    title: "Your next 30 Reels could be made without opening an editor.",
    body: "Set up the studio once, then make videos by describing them. Every lesson is open the moment you join.",
  },
};
