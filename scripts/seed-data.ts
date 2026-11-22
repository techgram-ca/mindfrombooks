/**
 * Seed content. Everything here lands in the database and is editable from
 * the admin portal afterwards. Book ideas are paraphrased in our own words —
 * never quoted — and courses are "inspired by" the books, not endorsed.
 *
 * The day-by-day tasks live in scripts/content/, one file per course.
 */
import { aiAnimationInstagram } from "./content/ai-animation-instagram";
import { aiForEverydayLife } from "./content/ai-for-everyday-life";
import { buildDiscipline } from "./content/build-discipline";
import { fixYourMoney } from "./content/fix-your-money";
import { getFitStayHealthy } from "./content/get-fit-stay-healthy";
import { stopProcrastinating } from "./content/stop-procrastinating";
import { talkWithConfidence } from "./content/talk-with-confidence";
import type { DayTask } from "./content/types";

export type SeedTask = DayTask;

export interface SeedCourse {
  slug: string;
  name: string;
  category: string;
  emoji: string;
  accent_color: string;
  short_description: string;
  description: string;
  number_reason: string;
  outcomes: string[];
  notice: string | null;
  days: number;
  price_cents: number;
  books: { title: string; author: string }[];
  phases: { name: string; start_day: number; end_day: number }[];
  faq: { q: string; a: string }[];
  /** One task per day (daily courses) or one lesson each (workshops). */
  tasks: SeedTask[];
  /** Workshops: every lesson open at once. Defaults to "daily". */
  format?: "daily" | "self_paced";
  /** Defaults to true. Workshops can be sold without the refund guarantee. */
  hasGuarantee?: boolean;
}

/**
 * Refund-guarantee grace days and public sample days, by course length:
 *   under 25 days → 2 grace, 2 samples
 *   25 to 50 days → 3 grace, 3 samples
 *   over 50 days  → 4 grace, 3 samples
 */
export function courseAllowances(days: number): { graceDays: number; sampleDays: number } {
  if (days < 25) return { graceDays: 2, sampleDays: 2 };
  if (days <= 50) return { graceDays: 3, sampleDays: 3 };
  return { graceDays: 4, sampleDays: 3 };
}

const commonFaq = [
  {
    q: "How much time does each day take?",
    a: "Most tasks take 5–15 minutes. Each day you do one small action and answer one question about it.",
  },
  {
    q: "What if I miss a day?",
    a: "Each day's task is only open that day, in your timezone, and a missed day can't be redone. The refund guarantee allows a few missed days (the grace days shown on this page); beyond that it no longer applies, but you can still finish the course.",
  },
  {
    q: "Do I need to read the books first?",
    a: "No. Each task gives you the one idea you need, in plain language. If a book grabs you, read it alongside.",
  },
];

export const COURSES: SeedCourse[] = [
  {
    slug: "fix-your-money",
    name: "Fix Your Money",
    category: "Money",
    emoji: "💰",
    accent_color: "#2F7D57",
    short_description: "31 small money moves. See where it goes, take control, start growing it.",
    description:
      "Most money advice fails because it asks you to change everything at once. This course gives you one small money action a day for a full month, so every bill, subscription and payday passes through your hands once. By the end you know your numbers, you've plugged your leaks and you have a simple system that runs without willpower.",
    number_reason: "One full money cycle — every bill, subscription and payday shows up once",
    outcomes: [
      "Know exactly where your money went this month",
      "Cancel the spending you don't actually value",
      "Set up automatic saving that happens before you can spend",
      "A simple plan for debt, an emergency fund and your first investments",
    ],
    notice: null,
    days: 31,
    price_cents: 999,
    books: [
      { title: "The Psychology of Money", author: "Morgan Housel" },
      { title: "I Will Teach You to Be Rich", author: "Ramit Sethi" },
      { title: "The Richest Man in Babylon", author: "George S. Clason" },
      { title: "Your Money or Your Life", author: "Vicki Robin & Joe Dominguez" },
      { title: "The Total Money Makeover", author: "Dave Ramsey" },
      { title: "The Simple Path to Wealth", author: "JL Collins" },
      { title: "The Millionaire Next Door", author: "Thomas J. Stanley & William D. Danko" },
      { title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki" },
    ],
    phases: [
      { name: "Awareness", start_day: 1, end_day: 10 },
      { name: "Control", start_day: 11, end_day: 21 },
      { name: "Growth", start_day: 22, end_day: 31 },
    ],
    faq: [
      ...commonFaq,
      {
        q: "Is this financial advice?",
        a: "No. It's general education and daily practice. For decisions about your own situation, talk to a licensed professional.",
      },
    ],
    tasks: fixYourMoney,
  },
  {
    slug: "build-discipline",
    name: "Build Discipline",
    category: "Habits",
    emoji: "🔥",
    accent_color: "#B04A26",
    short_description:
      "66 days to make one habit automatic — and prove you can keep a promise to yourself.",
    description:
      "Discipline isn't a personality trait. It's what's left after you make the right thing easy and repeat it until it stops needing effort. Over 66 days you'll pick one keystone habit, shrink it until it's impossible to skip, and build the evidence — one day at a time — that you are someone who shows up.",
    number_reason:
      "The real time it takes to build a habit (UCL study, Lally et al. 2009: 66 days on average)",
    outcomes: [
      "One habit that runs on autopilot",
      "A system for starting when you don't feel like it",
      "66 written entries proving you kept your word",
      "The tools to build your next habit without a course",
    ],
    notice: null,
    days: 66,
    price_cents: 1299,
    books: [
      { title: "Atomic Habits", author: "James Clear" },
      { title: "Can't Hurt Me", author: "David Goggins" },
      { title: "The Power of Habit", author: "Charles Duhigg" },
      { title: "Tiny Habits", author: "BJ Fogg" },
      { title: "The Willpower Instinct", author: "Kelly McGonigal" },
      { title: "Grit", author: "Angela Duckworth" },
      { title: "Mindset", author: "Carol S. Dweck" },
      { title: "Discipline Equals Freedom", author: "Jocko Willink" },
      { title: "The Compound Effect", author: "Darren Hardy" },
    ],
    phases: [
      { name: "Foundation", start_day: 1, end_day: 22 },
      { name: "Momentum", start_day: 23, end_day: 44 },
      { name: "Automatic", start_day: 45, end_day: 66 },
    ],
    faq: [
      ...commonFaq,
      {
        q: "66 days is long. What if I fall off?",
        a: "That's exactly what the course trains. The daily response is the habit. Showing up for two minutes on a bad day counts.",
      },
    ],
    tasks: buildDiscipline,
  },
  {
    slug: "ai-for-everyday-life",
    name: "AI for Everyday Life",
    category: "AI",
    emoji: "🤖",
    accent_color: "#2F5FB3",
    short_description:
      "21 practical AI skills in 21 days — from your first good prompt to emails, research, websites, video and agents.",
    description:
      "You don't need to understand how AI works to get real value from it. You need practice. Each day you do one concrete thing with step-by-step instructions: write prompts that actually work, draft hard emails in your own voice, research with sources you check, learn anything with an AI tutor, then build a website, make a short video, create your own assistant and hand a real job to an AI agent. Three weeks later you know what AI is good at, where it fails, and how to use it without handing over your judgment.",
    number_reason: "3 weeks, 21 skills — Prompting → Research → Creating & Agents",
    outcomes: [
      "Write prompts that get useful answers the first time",
      "Handle emails, research and decisions faster — and know what to double-check",
      "Build a simple website, an image and a short video by describing them",
      "Set up your own reusable assistant and delegate a multi-step job to an AI agent",
    ],
    notice: null,
    days: 21,
    price_cents: 799,
    books: [
      { title: "Co-Intelligence", author: "Ethan Mollick" },
      { title: "Prediction Machines", author: "Ajay Agrawal, Joshua Gans & Avi Goldfarb" },
      { title: "Human + Machine", author: "Paul R. Daugherty & H. James Wilson" },
      { title: "You Look Like a Thing and I Love You", author: "Janelle Shane" },
      { title: "The Coming Wave", author: "Mustafa Suleyman" },
      { title: "Impromptu", author: "Reid Hoffman" },
    ],
    phases: [
      { name: "Prompt Like a Pro", start_day: 1, end_day: 7 },
      { name: "Research & Learn", start_day: 8, end_day: 14 },
      { name: "Create & Automate", start_day: 15, end_day: 21 },
    ],
    faq: [
      ...commonFaq,
      {
        q: "Which AI tool do I need?",
        a: "Any free chat assistant works — ChatGPT, Claude, Gemini or Copilot. No paid plan is needed. A few days suggest optional features (web search, a page preview, a video editor); each has a free route.",
      },
    ],
    tasks: aiForEverydayLife,
  },
  {
    slug: "get-fit-stay-healthy",
    name: "Get Fit, Stay Healthy",
    category: "Health",
    emoji: "🏃",
    accent_color: "#177272",
    short_description:
      "42 days of walking, sleep, mobility and bodyweight basics. No gym, no extremes.",
    description:
      "Health isn't built in a brutal month — it's built from boring basics done most days. For six weeks you'll do one small thing daily: move a little, sleep a little better, get a little stronger. Nothing here needs equipment or a gym. It's the foundation that everything else sits on.",
    number_reason: "6 weeks to feel the change",
    outcomes: [
      "A daily walking habit you actually keep",
      "A calmer evening routine and more consistent sleep",
      "Basic strength and mobility you can do at home",
      "Energy you can feel by the end of week six",
    ],
    notice: "Not medical advice — check with a doctor before starting new exercise.",
    days: 42,
    price_cents: 999,
    books: [
      { title: "Outlive", author: "Peter Attia" },
      { title: "Why We Sleep", author: "Matthew Walker" },
      { title: "Atomic Habits", author: "James Clear" },
      { title: "Built to Move", author: "Kelly Starrett & Juliet Starrett" },
      { title: "Breath", author: "James Nestor" },
      { title: "In Defense of Food", author: "Michael Pollan" },
      { title: "Spark", author: "John J. Ratey" },
    ],
    phases: [
      { name: "Move", start_day: 1, end_day: 14 },
      { name: "Sleep & Fuel", start_day: 15, end_day: 28 },
      { name: "Strength", start_day: 29, end_day: 42 },
    ],
    faq: [
      ...commonFaq,
      {
        q: "Do I need a gym or equipment?",
        a: "No. Everything is walking, sleep, mobility and bodyweight basics you can do at home.",
      },
      {
        q: "Is this medical advice?",
        a: "No. It's general wellness education. Check with a doctor before starting new exercise, especially if you have a health condition.",
      },
    ],
    tasks: getFitStayHealthy,
  },
  {
    slug: "stop-procrastinating",
    name: "Time Management - Stop Procrastination",
    category: "Productivity",
    emoji: "⏳",
    accent_color: "#7A4FB5",
    short_description:
      "24 days to see your time clearly, take control of it and protect your focus.",
    description:
      "Procrastination isn't laziness — it's avoiding a feeling. This course gives you one small action a day to face the thing you're avoiding, choose what actually matters and build blocks of real focus. Twenty-four days, one for every hour you have.",
    number_reason: "One day for every hour you have",
    outcomes: [
      "Start your hardest task first, without the dread",
      "A weekly plan built around what matters most",
      "Daily blocks of distraction-free focus",
      "Peace with the fact that you can't do everything",
    ],
    notice: null,
    days: 24,
    price_cents: 799,
    books: [
      { title: "Eat That Frog!", author: "Brian Tracy" },
      { title: "Deep Work", author: "Cal Newport" },
      { title: "Four Thousand Weeks", author: "Oliver Burkeman" },
      { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey" },
      { title: "Getting Things Done", author: "David Allen" },
      { title: "The Now Habit", author: "Neil Fiore" },
      { title: "Essentialism", author: "Greg McKeown" },
      { title: "The ONE Thing", author: "Gary Keller & Jay Papasan" },
    ],
    phases: [
      { name: "See Your Time", start_day: 1, end_day: 8 },
      { name: "Take Control", start_day: 9, end_day: 16 },
      { name: "Protect Your Focus", start_day: 17, end_day: 24 },
    ],
    faq: commonFaq,
    tasks: stopProcrastinating,
  },
  {
    slug: "talk-with-confidence",
    name: "Talk with Confidence",
    category: "Communication",
    emoji: "🗣️",
    accent_color: "#8F5A0E",
    short_description:
      "33 people-skills, one a day. Be liked, be heard and hold your ground kindly.",
    description:
      "Good communicators aren't born charming — they practise a small set of principles until they're natural. Each day you'll try one in a real conversation: at work, at home, with a stranger. Thirty-three days later, talking to people feels less like a risk and more like a skill.",
    number_reason: "33 principles, one a day (30 from How to Win Friends + 3 negotiation tactics)",
    outcomes: [
      "Start conversations without overthinking",
      "Make people feel heard — and get heard in return",
      "Disagree and give feedback without a fight",
      "Negotiate calmly using simple, ethical tactics",
    ],
    notice: null,
    days: 33,
    price_cents: 999,
    books: [
      { title: "How to Win Friends and Influence People", author: "Dale Carnegie" },
      { title: "Never Split the Difference", author: "Chris Voss" },
      { title: "The 48 Laws of Power (ethical lessons only)", author: "Robert Greene" },
    ],
    phases: [
      { name: "Make People Like You", start_day: 1, end_day: 9 },
      { name: "Win People to Your Thinking", start_day: 10, end_day: 21 },
      { name: "Lead & Negotiate", start_day: 22, end_day: 33 },
    ],
    faq: [
      ...commonFaq,
      {
        q: "Is this about manipulating people?",
        a: "No. We only use principles that work when the other person knows exactly what you're doing: listening, honesty, respect.",
      },
    ],
    tasks: talkWithConfidence,
  },
];

/**
 * Self-paced workshops. Sold on their own — never part of the All Access bundle.
 * `days` is the number of lessons.
 */
export const WORKSHOPS: SeedCourse[] = [
  {
    slug: "ai-animation-instagram",
    name: "AI Animation Videos & Instagram Growth",
    category: "Creator",
    emoji: "🎬",
    accent_color: "#A8336A",
    short_description:
      "Make scroll-stopping animated Reels with Claude — no video editor — and the exact posting system that grew @mindfrombooks to 35K.",
    description:
      "A self-paced workshop. You set up a small AI video studio on your own computer, then make animated videos, edit your own footage and add voiceovers by describing what you want to Claude. The last module is the posting and growth system behind @mindfrombooks. Everything unlocks at once; work through it at your own pace.",
    number_reason: "8 lessons, one video each — set up once, then create and grow",
    outcomes: [
      "A working AI video studio on your computer (Windows, Mac or Linux)",
      "Animated Reels made from a prompt — no editing software",
      "Natural voiceovers with ElevenLabs, plus free music and sound effects",
      "A 3-a-day posting system and a weekly routine to grow on Instagram",
    ],
    notice:
      "You'll need a paid Claude Pro plan (about US$20 a month, billed by Anthropic). ElevenLabs is optional: its free plan works but sounds less natural and has limits; better voices cost about US$5 a month. These are separate from this course.",
    days: 8,
    price_cents: 699,
    format: "self_paced",
    hasGuarantee: false,
    books: [
      { title: "Steal Like an Artist", author: "Austin Kleon" },
      { title: "Show Your Work!", author: "Austin Kleon" },
      { title: "Contagious", author: "Jonah Berger" },
    ],
    phases: [
      { name: "Set up your studio", start_day: 1, end_day: 3 },
      { name: "Make videos", start_day: 4, end_day: 7 },
      { name: "Grow on Instagram", start_day: 8, end_day: 8 },
    ],
    faq: [
      {
        q: "Do I need any video editing experience?",
        a: "No. You describe what you want; Claude builds and edits the video. The course shows every click.",
      },
      {
        q: "What does it cost beyond the course?",
        a: "A Claude Pro plan is required (about US$20 a month, paid to Anthropic). ElevenLabs is optional — free with lower quality and limits, or about US$5 a month for better voices.",
      },
      {
        q: "Does it work on my computer?",
        a: "Yes — Windows, Mac and Linux. Every command is given for each system.",
      },
      {
        q: "Is there a refund guarantee?",
        a: "No. This workshop opens in full the moment you buy, so it isn't covered by our daily-course refund guarantee.",
      },
      {
        q: "Will I get 35K followers too?",
        a: "We can't promise numbers — results depend on your niche, consistency and content. You get the exact system that grew @mindfrombooks.",
      },
    ],
    tasks: aiAnimationInstagram,
  },
];

/** Every course, daily and self-paced. */
export const ALL_COURSES: SeedCourse[] = [...COURSES, ...WORKSHOPS];

/** Public sample lessons for a workshop (the first two). */
export const WORKSHOP_SAMPLE_LESSONS = 2;

export const BUNDLE = {
  slug: "all-access",
  name: "All Access",
  description: "All six courses. Start each one whenever you're ready.",
  price_cents: 3900,
};

export const TEST_COUPON = {
  code: "TEST100",
  percent_off: 100,
  max_redemptions: 5,
  source_label: "internal-testing",
};
