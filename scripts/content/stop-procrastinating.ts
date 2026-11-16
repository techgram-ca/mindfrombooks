import { day, type DayTask } from "./types";

const ETF = "Eat That Frog! — Brian Tracy";
const DW = "Deep Work — Cal Newport";
const FTW = "Four Thousand Weeks — Oliver Burkeman";
const SH = "The 7 Habits of Highly Effective People — Stephen R. Covey";
const GTD = "Getting Things Done — David Allen";
const NH = "The Now Habit — Neil Fiore";
const ESS = "Essentialism — Greg McKeown";
const ONE = "The ONE Thing — Gary Keller & Jay Papasan";

/** 24 days: See Your Time (1–8) → Take Control (9–16) → Protect Your Focus (17–24). */
export const stopProcrastinating: DayTask[] = [
  // ---------------------------------------------------------------- See Your Time
  day(
    "Name your frog",
    "The task you're most likely to put off is usually the one that would make the biggest difference. If you do that one first, the rest of the day gets lighter. Naming it clearly is half the battle — vague tasks are easy to avoid.",
    ETF,
    [
      "Write down the one task you've been avoiding the longest.",
      "Write the very first physical step (open the file, find the number, write one line).",
      "Do only that first step today. Stop there if you want.",
    ],
    "What is your frog, and what happened when you did the first step?",
  ),
  day(
    "Count your weeks",
    "A human life is short — roughly four thousand weeks. You will never get everything done, and accepting that is freeing: it lets you choose a few things that matter instead of drowning in all of them. Time management starts with admitting the limit.",
    FTW,
    [
      "Multiply your age by 52. Subtract it from 4,000.",
      "Look at the number for a minute.",
      "Write down three things you'd regret never starting.",
      "Circle the one you would start this week.",
    ],
    "What did you circle, and what have you been doing instead of it?",
  ),
  day(
    "Sort urgent from important",
    "Urgent things shout; important things wait quietly. Most of what moves a life forward is important but not urgent, so it gets pushed aside by whatever is loudest. Putting first things first means scheduling the quiet ones on purpose.",
    `${SH} (Habit 3: put first things first)`,
    [
      "List everything on your plate today.",
      "Mark each item: urgent, important, both or neither.",
      "Choose one item that is important but NOT urgent.",
      "Give it 20 minutes today, before the urgent things.",
    ],
    "Which important-but-not-urgent thing did you give 20 minutes to, and what got in the way?",
  ),
  day(
    "Empty your head onto paper",
    "Your mind is for having ideas, not for holding them. Every unfinished commitment you keep in your head nags at you at the wrong moments and makes everything feel bigger than it is. Getting all of it into one trusted place outside your head is where calm starts.",
    `${GTD} (capture)`,
    [
      "Set a timer for 15 minutes.",
      "Write down everything that has your attention: tasks, errands, worries, promises, ideas. One per line.",
      "Do not organise or judge. Keep going until nothing more comes.",
      "Count the items. Keep the list — you will use it all week.",
    ],
    "How many items came out of your head, and how did you feel when the list was finished?",
  ),
  day(
    "Catch yourself procrastinating",
    "Procrastination is not laziness; it is a way of coping with the anxiety a task brings up — fear of failing, of being judged, of it not being perfect. You can only change a pattern you can see. Noting when you put something off and what you felt just before shows you what you are really avoiding.",
    `${NH} (the procrastination log)`,
    [
      "Keep a note open all day.",
      "Each time you put something off, write: the task, the time, what you did instead, and what you were feeling.",
      "Do not try to fix it today. Only notice.",
      "Tonight, look for the pattern: which type of task, which time of day, which feeling.",
    ],
    "What pattern did you see — which kind of task do you avoid, and what feeling comes just before?",
  ),
  day(
    "Begin with the end in mind",
    "Everything is created twice: first in the mind, then in reality. If you do not decide what your life is for, the demands of other people will decide it for you, and you can be very busy climbing a ladder that is leaning against the wrong wall. Knowing the end gives every day a direction.",
    `${SH} (Habit 2: begin with the end in mind)`,
    [
      "Imagine your 80th birthday. Four people speak: someone from your family, a friend, someone from your work, someone from your community.",
      "Write one sentence you would want each of them to say about you.",
      "Underline the words that repeat.",
      "Write one thing you did this week that fits those words, and one that does not.",
    ],
    "What do you want to be said about you, and what did you do this week that doesn't fit?",
  ),
  day(
    "Find your vital 20 percent",
    "A small share of what you do produces most of your results. Of ten tasks, two will usually be worth more than the other eight put together — and those two are often the hardest, which is why they get put off. Being busy with the low-value eight feels productive and changes nothing.",
    `${ETF} (apply the 80/20 rule to everything)`,
    [
      "Take your list from Day 4.",
      "Pick the ten items most related to your work or main goal.",
      "Ask of each: if this were the only thing I finished this month, how much would it matter?",
      "Star the two with the biggest payoff.",
      "Spend your first 30 working minutes today on one of them.",
    ],
    "Which two tasks are your vital 20 percent, and what did 30 minutes on one of them achieve?",
  ),
  day(
    "Decide what you will fail at",
    "Because your time is finite, you are guaranteed to fall short somewhere. The choice is only whether you pick those areas in advance or let them be picked for you by exhaustion. Choosing to do some things badly, on purpose, is what makes it possible to do a few things well.",
    `${FTW} (strategic underachievement)`,
    [
      "List the areas of your life that demand effort right now: work, home, fitness, friends, a side project, and so on.",
      "Choose two that get your best energy for the next month.",
      "Choose two where 'good enough' is your official standard for now.",
      "Write down what 'good enough' looks like in each.",
      "Tell one person affected by it, so it is a decision and not a secret.",
    ],
    "What are you choosing to be mediocre at this month, and what did that free you to focus on?",
  ),

  // ---------------------------------------------------------------- Take Control
  day(
    "Rank your list with ABCDE",
    "A list without priorities invites you to do the easiest thing first. Marking each task by the consequence of not doing it — and refusing to start a lower letter while a higher one is unfinished — forces the important work to the front. Thinking on paper for two minutes saves hours of drifting.",
    `${ETF} (the ABCDE method)`,
    [
      "Write today's task list.",
      "Mark each one: A = serious consequences if not done, B = mild consequences, C = nice to do, D = delegate, E = eliminate.",
      "Number the A tasks: A-1, A-2, A-3.",
      "Start A-1 immediately and stay with it until it is finished or you reach a real stopping point.",
      "Cross out every E.",
    ],
    "What was your A-1 task, and how far did you get before touching anything else?",
  ),
  day(
    "Turn projects into next actions",
    "You cannot do a project; you can only do the next physical action. Items like 'sort out taxes' sit on a list for months because they are not actions — they are problems. Deciding the very next visible step turns something you avoid into something you can begin.",
    `${GTD} (the next-action decision)`,
    [
      "Pick the three items on your list that have been stuck longest.",
      "For each, write the outcome: “This is done when…”",
      "Then write the next physical action, starting with a verb: call, email, open, draft, buy.",
      "Make it small enough to start within two minutes.",
      "Do the next action for one of the three right now.",
    ],
    "What were your three stuck items, and what next action did you write for each?",
  ),
  day(
    "Clear everything that takes two minutes",
    "If an action takes less than two minutes, do it the moment you notice it. Storing it, tracking it and remembering it later costs more time than simply finishing it. A surprising share of what weighs on you is made of things this small.",
    `${GTD} (the two-minute rule)`,
    [
      "Go through your list and mark every item that would take two minutes or less.",
      "Set a timer for 30 minutes.",
      "Do them one after another: the reply, the form, the booking, the payment.",
      "Count how many you cleared.",
      "From now on, do two-minute tasks the moment they appear.",
    ],
    "How many two-minute tasks did you clear in half an hour, and which one had been waiting longest?",
  ),
  day(
    "Slice the task thin",
    "A big task is intimidating whole and harmless in slices. You can start by committing to one thin slice, or by working on it for a short fixed time and then stopping. Finishing a piece creates the urge to finish the next one.",
    `${ETF} (slice and dice the task)`,
    [
      "Take your biggest unfinished task.",
      "Break it into slices small enough to finish in 10–15 minutes each. Write them as a list.",
      "Do the first slice now.",
      "If you want to continue, do the second. If not, stop — you kept the promise.",
      "Put the next slice in your calendar for tomorrow.",
    ],
    "How many slices did your task become, and how many did you finish today?",
  ),
  day(
    "Say 'I choose to' and start for 30 minutes",
    "The language of pressure — 'I have to', 'I should' — makes you feel like a victim and invites rebellion in the form of delay. Replacing it with 'I choose to' and asking only 'when can I start?' takes away the dread of finishing. Thirty minutes of real work, followed by a reward you planned in advance, is enough to break the pattern.",
    `${NH} (the language of the producer; the Unschedule)`,
    [
      "First put something enjoyable in today's schedule: a walk, a show, time with a friend. It is your guaranteed reward.",
      "Choose the task you are resisting most.",
      "Say out loud: “I choose to start on [task] at [time] for 30 minutes.”",
      "Work for exactly 30 minutes without interruption. You are only starting, not finishing.",
      "Stop, note the 30 minutes as a win, and take the reward without guilt.",
    ],
    "What did you choose to start, and how did 'I choose to' feel compared with 'I have to'?",
  ),
  day(
    "Ask the focusing question",
    "Not everything matters equally. Extraordinary results come from narrowing your focus to the single action that makes the others easier or unnecessary, like the first domino that knocks down the rest. One question, asked honestly, finds it.",
    ONE,
    [
      "Pick your most important goal for the next three months.",
      "Ask: “What is the one thing I can do this week such that, by doing it, everything else becomes easier or unnecessary?”",
      "Ask it again for today.",
      "Block time for that one thing before anything else.",
      "Do it, or at least start it, before you open your messages.",
    ],
    "What was your one thing for today, and did you do it before opening your messages?",
  ),
  day(
    "Plan your week around the big rocks",
    "If you fill a jar with sand first, the big rocks will not fit; put the rocks in first and the sand settles around them. A week works the same way. Planning weekly, not daily, lets you place your most important commitments before the small things flood in.",
    `${SH} (Habit 3: weekly planning)`,
    [
      "Write your main roles: for example parent, partner, professional, friend, yourself.",
      "For each role, write one result that would matter this week. These are your big rocks.",
      "Open your calendar and give each big rock a specific day and time.",
      "Only then add everything else around them.",
      "Tonight, check tomorrow's big rock.",
    ],
    "What are your big rocks for this week, and when exactly is each one scheduled?",
  ),
  day(
    "Say no to something good",
    "The undisciplined pursuit of more is why capable people end up stretched thin and making little progress in any direction. The alternative is fewer things done better: if something is not a clear yes, treat it as a no. Every yes to something minor is a no to something that matters.",
    `${ESS} (the 90 percent rule)`,
    [
      "List your current commitments and open requests.",
      "Score each from 0 to 100 on how much it matters to you.",
      "Anything under 90 is a candidate to drop, delay or hand over.",
      "Pick one and say no today. Use a clear, kind sentence: “Thank you for thinking of me. I can't take this on right now.”",
      "Notice what actually happens after you say it.",
    ],
    "What did you say no to, and what did it free up?",
  ),

  // ---------------------------------------------------------------- Protect Your Focus
  day(
    "Give every hour a job",
    "A day without a plan gets spent reacting to whatever arrives. Deciding in advance what each block of time is for means you make the decision once, with a clear head, instead of dozens of times while tired. The plan will change — what matters is that you re-plan instead of drifting.",
    `${DW} (schedule every minute of your day)`,
    [
      "Take a sheet of paper and write the hours of your working day down the side.",
      "Divide the day into blocks of at least 30 minutes and give each one a job.",
      "Group small tasks into one block. Leave one block empty for overflow.",
      "When something knocks you off the plan, take a minute and redraw the remaining blocks.",
      "Tonight, check how close reality came to the plan.",
    ],
    "How closely did your day follow your blocks, and where did it break down?",
  ),
  day(
    "Do one block of deep work",
    "The ability to concentrate without distraction on a demanding task is becoming rare at exactly the moment it is becoming most valuable. An hour of unbroken focus produces more than a morning of interrupted effort, because every switch leaves part of your attention behind. Depth is a skill, and it has to be trained.",
    DW,
    [
      "Choose one demanding task that would really benefit from full attention.",
      "Pick a 60–90 minute slot and a place where you will not be interrupted.",
      "Put your phone in another room. Close email, chat and every unneeded tab.",
      "Write what you intend to produce by the end of the session.",
      "Work until the time is up. If your mind wanders, bring it back — no checking anything.",
    ],
    "What did you produce in your deep-work block, and how many times did you want to check your phone?",
  ),
  day(
    "Let yourself be bored",
    "If you reach for your phone at every idle moment, you train your brain to demand novelty — and it will demand it during hard work, too. Concentration is built in the gaps: waiting, walking, standing in line. Tolerating boredom there is what makes focus possible later.",
    `${DW} (embrace boredom)`,
    [
      "Choose three everyday gaps today: a queue, a commute, waiting for the kettle, a walk.",
      "During each one, keep your phone in your pocket. No music or podcast either.",
      "Just let your mind wander, or think through one problem.",
      "Notice the urge to reach for the phone. Do not act on it.",
      "Tonight, write what your mind came up with when it was left alone.",
    ],
    "What did your mind do during the gaps, and how strong was the pull of the phone?",
  ),
  day(
    "End your workday with a shutdown ritual",
    "Unfinished tasks keep running in the back of your mind all evening unless you have a plan for them that you trust. A short end-of-day routine — check what is open, decide the next step for each, then deliberately stop — lets your brain let go. Rest is not the opposite of good work; it is what makes it possible.",
    `${DW} (the shutdown ritual)`,
    [
      "Fifteen minutes before you finish, check your inbox and task list one last time.",
      "For anything unfinished, write down its next step and when you will do it.",
      "Look at tomorrow's calendar and choose your first task.",
      "Close everything and say a phrase out loud to mark the end, such as “Shutdown complete.”",
      "No work email or work thoughts after that. If one appears, remind yourself it is already captured.",
    ],
    "What was your shutdown phrase, and how was your evening different once work was properly closed?",
  ),
  day(
    "Limit your work in progress to three",
    "When everything is started and nothing is finished, each new difficulty tempts you to jump to another project. A hard limit on how many things you allow in progress at once forces you either to finish or to consciously abandon. Nothing new comes in until something goes out.",
    `${FTW} (limit your work in progress)`,
    [
      "List everything you have started and not finished.",
      "Choose three. These are your only active projects.",
      "Move everything else to a 'waiting' list. It is not cancelled — it is not allowed in yet.",
      "Work only on the three until one is complete.",
      "Only then pull one item in from the waiting list.",
    ],
    "Which three projects made the cut, and what was hardest to put on the waiting list?",
  ),
  day(
    "Batch the shallow work",
    "Email, messages and small admin tasks feel like work and fill the whole day if you let them. Confining them to a few fixed windows protects the rest of your time for what actually creates value. If a tool takes more of your attention than it gives back, it does not deserve a place in your day.",
    `${DW} (drain the shallows)`,
    [
      "Pick two or three fixed times today for email and messages, for example 11:30 and 16:30.",
      "Outside those windows, close your inbox and turn off notifications.",
      "Deal with every message in one pass when the window opens.",
      "Choose one app that eats your attention and remove it from your phone's home screen for a week.",
      "At the end of the day, note what you got done in the protected time.",
    ],
    "Which windows did you set, and what did you do with the time you protected?",
  ),
  day(
    "Sharpen the saw",
    "Someone sawing with a blunt blade for hours insists they are too busy to stop and sharpen it. You are the tool everything else depends on, and it wears down without regular renewal — of body, mind, relationships and purpose. Looking after yourself is not time taken from the work; it is what keeps the work possible.",
    `${SH} (Habit 7: sharpen the saw)`,
    [
      "Rate your current state from 1 to 10 in four areas: body, mind, relationships, sense of purpose.",
      "Pick the lowest.",
      "Do one 30-minute act of renewal for it today: a walk, a book, a real conversation, quiet time.",
      "Put a repeating weekly slot in your calendar for that area.",
    ],
    "Which area scored lowest, and what did you do today to renew it?",
  ),
  day(
    "Run your first weekly review",
    "A system only stays trustworthy if you look at all of it regularly. Once a week, clear your head, check every open commitment and decide what next week is for. That hour is what keeps everything from the last 24 days working instead of fading.",
    `${GTD} (the weekly review)`,
    [
      "Set aside 45 minutes.",
      "Empty your head again, as on Day 4. Add everything new to your list.",
      "Check each project: is there a next action written down?",
      "Look at the past week: what went well, what you avoided, and why.",
      "Choose next week's big rocks and schedule them.",
      "Put this review in your calendar as a repeating weekly appointment.",
    ],
    "What are next week's big rocks, and which habit from this course will you keep?",
  ),
];
