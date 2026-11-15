/**
 * Seed content. Everything here lands in the database and is editable from
 * the admin portal afterwards. Book ideas are paraphrased in our own words —
 * never quoted — and courses are "inspired by" the books, not endorsed.
 */

export interface SeedTask {
  title: string;
  book_insight: string;
  book_reference: string;
  instructions: string[];
  response_prompt: string;
}

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
  tasks: SeedTask[]; // real content for days 1..n; the rest are placeholders
}

const commonFaq = [
  {
    q: "How much time does each day take?",
    a: "Most tasks take 5–15 minutes. Each day you do one small action and answer one question about it.",
  },
  {
    q: "What if I miss a day?",
    a: "Each day's task is only open that day, in your timezone. A missed day can't be redone, and the refund guarantee needs you to respond on every day (minus any grace days shown on this page). You can still finish the course.",
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
    tasks: [
      {
        title: "Write down your real number",
        book_insight:
          "How we handle money has less to do with what we know and more to do with how we behave — and behaviour starts with seeing clearly. Most people carry a vague feeling about their finances instead of an actual number. A feeling can't be improved; a number can.",
        book_reference: "The Psychology of Money — Morgan Housel",
        instructions: [
          "Open every account you have: chequing, savings, credit cards, loans.",
          "Add up what you own in cash and savings. Add up what you owe.",
          "Subtract what you owe from what you own. That is today's number.",
          "Don't judge it. Today is only about looking.",
        ],
        response_prompt:
          "What did it feel like to see your real number? What surprised you most? (You don't have to share the number itself.)",
      },
      {
        title: "Track every dollar for one day",
        book_insight:
          "A conscious spending plan begins with knowing what you spend now, not what you imagine you spend. Small, automatic purchases are the ones we forget, and they add up quietly. One honest day of tracking shows you more than a month of guessing.",
        book_reference: "I Will Teach You to Be Rich — Ramit Sethi",
        instructions: [
          "From the moment you read this, write down every purchase today — even a coffee.",
          "Use your phone notes. Amount and what it was. Nothing else.",
          "Tonight, mark each one: needed it, loved it, or didn't notice it.",
        ],
        response_prompt:
          "What did you spend money on today, and which purchase would you not miss if it disappeared?",
      },
      {
        title: "Pay yourself first — even $5",
        book_insight:
          "One of the oldest money rules is to keep a part of everything you earn before you spend the rest. The amount matters less than the order: saving first makes it a habit, saving what's left makes it an accident. Wealth is mostly what you don't spend.",
        book_reference: "The Richest Man in Babylon — George S. Clason",
        instructions: [
          "Pick an amount you will not miss. $5 is enough to start.",
          "Move it into a savings account right now.",
          "If your bank allows it, set this up as an automatic transfer on payday.",
        ],
        response_prompt:
          "How much did you move, and what will you set as your automatic 'pay yourself first' amount?",
      },
    ],
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
    tasks: [
      {
        title: "Choose the person, not the goal",
        book_insight:
          "Lasting change comes from deciding who you want to be, then proving it to yourself with small wins. Every action is a vote for a type of person. You don't need a perfect record — you need a majority of votes.",
        book_reference: "Atomic Habits — James Clear",
        instructions: [
          "Finish this sentence: 'I am the kind of person who…'",
          "Pick ONE habit that person would do every day.",
          "Make it small enough to do in two minutes.",
          "Do it once today, right after you finish this task.",
        ],
        response_prompt: "Who are you becoming, and what is the two-minute habit you chose?",
      },
      {
        title: "Find your cue",
        book_insight:
          "Every habit runs on a loop: a cue, a routine and a reward. Habits don't stick because we want them to — they stick when something in the day reliably triggers them. Tie a new routine to a cue that already happens every day.",
        book_reference: "The Power of Habit — Charles Duhigg",
        instructions: [
          "List three things you already do every single day (coffee, brushing teeth, opening your laptop).",
          "Pick one as your cue.",
          "Write your plan: 'After I [cue], I will [habit].'",
          "Run it once today.",
        ],
        response_prompt: "What is your 'After I…, I will…' sentence, and did you run it today?",
      },
      {
        title: "Do it when you don't feel like it",
        book_insight:
          "Most of us stop long before we are actually done — the mind asks to quit well before the body has to. Discipline grows in the moments you'd rather not, because those are the only moments that train it. Small voluntary discomfort makes the big ones easier.",
        book_reference: "Can't Hurt Me — David Goggins",
        instructions: [
          "Pick the moment today when you least want to do your habit.",
          "Do it then, on purpose.",
          "Notice the excuse your mind offers. Write it down word for word.",
        ],
        response_prompt: "What excuse did your mind give you today, and what did you do anyway?",
      },
    ],
  },
  {
    slug: "ai-for-everyday-life",
    name: "AI for Everyday Life",
    category: "AI",
    emoji: "🤖",
    accent_color: "#2F5FB3",
    short_description:
      "21 practical AI skills in 21 days — for work, for learning and for making things.",
    description:
      "You don't need to understand how AI works to get real value from it. You need practice. Each day you'll try one concrete use — on your own work, your own questions, your own projects — and write down what happened. Three weeks later you'll know what AI is good at, where it fails, and how to use it without handing over your judgment.",
    number_reason: "3 weeks, 21 skills — Work → Learning → Creating",
    outcomes: [
      "Use AI confidently for writing, planning and research",
      "Learn anything faster with AI as a patient tutor",
      "Know when not to trust the answer",
      "A personal list of prompts that actually work for you",
    ],
    notice: null,
    days: 21,
    price_cents: 799,
    books: [{ title: "Co-Intelligence", author: "Ethan Mollick" }],
    phases: [
      { name: "AI for Work", start_day: 1, end_day: 7 },
      { name: "AI for Learning", start_day: 8, end_day: 14 },
      { name: "AI for Creating", start_day: 15, end_day: 21 },
    ],
    faq: [
      ...commonFaq,
      {
        q: "Which AI tool do I need?",
        a: "Any free chat assistant works — ChatGPT, Claude, Gemini or Copilot. No paid plan is needed.",
      },
    ],
    tasks: [
      {
        title: "Invite AI to one real task",
        book_insight:
          "The fastest way to learn what AI can do is to bring it into the work you already do, instead of testing it on toy questions. You are the expert in your own tasks, so you can judge its answers better than anyone. Expect it to be surprisingly good at some things and surprisingly bad at others.",
        book_reference: "Co-Intelligence — Ethan Mollick",
        instructions: [
          "Pick one real thing on your to-do list today: an email, a plan, a decision.",
          "Open any AI chat tool and ask for help with exactly that.",
          "Give it context: who it's for, what you want, what good looks like.",
          "Use, edit or throw away the result — your call.",
        ],
        response_prompt:
          "What task did you bring to AI, and was the result better or worse than you expected?",
      },
      {
        title: "Give it a role",
        book_insight:
          "AI answers improve when you tell it who to be and who it is talking to. Treating it like a capable colleague — with a role, a goal and constraints — works better than typing a search query. The more specific the person, the more useful the answer.",
        book_reference: "Co-Intelligence — Ethan Mollick",
        instructions: [
          "Take a question you'd normally search for.",
          "Ask it plainly first and save the answer.",
          "Ask again, starting with: 'You are a [specific expert]. I am a [who you are]. Help me…'",
          "Compare the two answers.",
        ],
        response_prompt:
          "What role did you give the AI, and how did the second answer differ from the first?",
      },
      {
        title: "Catch it being wrong",
        book_insight:
          "AI can sound completely confident while being incorrect, so the human has to stay in the loop. Your job is not to accept or reject AI — it's to check it where it matters. Knowing how it fails is what makes it safe to use.",
        book_reference: "Co-Intelligence — Ethan Mollick",
        instructions: [
          "Ask AI about something you know very well: your job, your city, your hobby.",
          "Read the answer carefully and look for one thing that is wrong or made up.",
          "Tell the AI what it got wrong and see how it responds.",
        ],
        response_prompt: "What did the AI get wrong, and how will that change the way you use it?",
      },
    ],
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
    tasks: [
      {
        title: "Take a 10-minute walk",
        book_insight:
          "Staying able to move well for decades matters more than any short burst of fitness, and regular easy movement is the base that makes it possible. The best exercise is the one you'll still be doing next year. Starting small is not a compromise — it's the strategy.",
        book_reference: "Outlive — Peter Attia",
        instructions: [
          "Not medical advice — check with a doctor before starting new exercise.",
          "Walk for 10 minutes today at a comfortable pace. Outside if you can.",
          "Leave your headphones off for the first two minutes and just notice how you feel.",
          "Pick the time you'll walk tomorrow.",
        ],
        response_prompt:
          "When did you walk, how did you feel afterwards, and what time will you walk tomorrow?",
      },
      {
        title: "Set a fixed wake-up time",
        book_insight:
          "Sleep works best on a regular rhythm. Waking at the same time every day — weekends included — anchors your body clock more than almost anything else you can do. Consistency matters more than any single long night.",
        book_reference: "Why We Sleep — Matthew Walker",
        instructions: [
          "Choose one wake-up time you can keep all seven days.",
          "Set a repeating alarm for it now.",
          "Count back 8 hours: that is your target time to be in bed.",
          "Take today's 10-minute walk.",
        ],
        response_prompt:
          "What wake-up time did you choose, and what will you change tonight to make it easier?",
      },
      {
        title: "Attach your walk to something you already do",
        book_insight:
          "New habits stick best when they are stacked onto ones you already have. Instead of relying on motivation, give the habit a fixed place in your day. The clearer the trigger, the less you have to decide.",
        book_reference: "Atomic Habits — James Clear",
        instructions: [
          "Pick a daily anchor: after lunch, after work, after dinner.",
          "Say it out loud: 'After I [anchor], I walk for 10 minutes.'",
          "Put your shoes where you will see them at that time.",
          "Do today's walk at that moment.",
        ],
        response_prompt:
          "What is your anchor, and did the walk feel easier when it had a fixed place in your day?",
      },
    ],
  },
  {
    slug: "stop-procrastinating",
    name: "Stop Procrastinating",
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
    ],
    phases: [
      { name: "See Your Time", start_day: 1, end_day: 8 },
      { name: "Take Control", start_day: 9, end_day: 16 },
      { name: "Protect Your Focus", start_day: 17, end_day: 24 },
    ],
    faq: commonFaq,
    tasks: [
      {
        title: "Name your frog",
        book_insight:
          "The task you're most likely to put off is usually the one that would make the biggest difference. If you do that one first, the rest of the day gets lighter. Naming it clearly is half the battle — vague tasks are easy to avoid.",
        book_reference: "Eat That Frog! — Brian Tracy",
        instructions: [
          "Write down the one task you've been avoiding the longest.",
          "Write the very first physical step (open the file, find the number, write one line).",
          "Do only that first step today. Stop there if you want.",
        ],
        response_prompt: "What is your frog, and what happened when you did the first step?",
      },
      {
        title: "Count your weeks",
        book_insight:
          "A human life is short — roughly four thousand weeks. You will never get everything done, and accepting that is freeing: it lets you choose a few things that matter instead of drowning in all of them. Time management starts with admitting the limit.",
        book_reference: "Four Thousand Weeks — Oliver Burkeman",
        instructions: [
          "Multiply your age by 52. Subtract it from 4,000.",
          "Look at the number for a minute.",
          "Write down three things you'd regret never starting.",
          "Circle the one you would start this week.",
        ],
        response_prompt: "What did you circle, and what have you been doing instead of it?",
      },
      {
        title: "Sort urgent from important",
        book_insight:
          "Urgent things shout; important things wait quietly. Most of what moves a life forward is important but not urgent, so it gets pushed aside by whatever is loudest. Putting first things first means scheduling the quiet ones on purpose.",
        book_reference: "The 7 Habits of Highly Effective People — Stephen R. Covey",
        instructions: [
          "List everything on your plate today.",
          "Mark each item: urgent, important, both or neither.",
          "Choose one item that is important but NOT urgent.",
          "Give it 20 minutes today, before the urgent things.",
        ],
        response_prompt:
          "Which important-but-not-urgent thing did you give 20 minutes to, and what got in the way?",
      },
    ],
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
      { name: "Make People Like You", start_day: 1, end_day: 11 },
      { name: "Win People to Your Thinking", start_day: 12, end_day: 22 },
      { name: "Lead & Negotiate", start_day: 23, end_day: 33 },
    ],
    faq: [
      ...commonFaq,
      {
        q: "Is this about manipulating people?",
        a: "No. We only use principles that work when the other person knows exactly what you're doing: listening, honesty, respect.",
      },
    ],
    tasks: [
      {
        title: "Go one day without criticising",
        book_insight:
          "Criticism rarely changes anyone — it puts people on the defensive and makes them justify themselves. People respond far better to being understood than to being corrected. Holding back a complaint is the first people-skill, and the hardest.",
        book_reference: "How to Win Friends and Influence People — Dale Carnegie",
        instructions: [
          "From now until you sleep: no criticising, condemning or complaining about anyone.",
          "When you catch the urge, pause and ask: 'Why might they have done that?'",
          "Keep a tally of how many times you caught yourself.",
        ],
        response_prompt:
          "How many times did you catch yourself, and what was the hardest moment to stay quiet?",
      },
      {
        title: "Give one honest, specific compliment",
        book_insight:
          "Almost everyone is hungry to feel appreciated, and sincere appreciation is different from flattery because it is specific and true. Noticing what someone did well — and saying it — costs nothing and is remembered for a long time.",
        book_reference: "How to Win Friends and Influence People — Dale Carnegie",
        instructions: [
          "Pick one person you'll see or message today.",
          "Find something they genuinely did well. Be specific.",
          "Tell them, without asking for anything afterwards.",
        ],
        response_prompt:
          "Who did you appreciate, what exactly did you say, and how did they react?",
      },
      {
        title: "Ask, then listen for two minutes",
        book_insight:
          "The way to be interesting is to be interested. People enjoy talking with someone who is curious about them, and you learn far more by asking than by telling. Real attention is rare enough to feel like a gift.",
        book_reference: "How to Win Friends and Influence People — Dale Carnegie",
        instructions: [
          "In one conversation today, ask a question about something the other person cares about.",
          "Listen for two full minutes without bringing it back to yourself.",
          "Ask one follow-up question based on what they said.",
        ],
        response_prompt: "What did you ask, and what did you learn that you didn't know before?",
      },
    ],
  },
];

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
