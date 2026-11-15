import { day, type DayTask } from "./types";

const POM = "The Psychology of Money — Morgan Housel";
const IWT = "I Will Teach You to Be Rich — Ramit Sethi";
const RMB = "The Richest Man in Babylon — George S. Clason";
const YMYL = "Your Money or Your Life — Vicki Robin & Joe Dominguez";
const TMM = "The Total Money Makeover — Dave Ramsey";
const SPW = "The Simple Path to Wealth — JL Collins";
const MND = "The Millionaire Next Door — Thomas J. Stanley & William D. Danko";
const RDPD = "Rich Dad Poor Dad — Robert T. Kiyosaki";

/** 31 days: Awareness (1–10) → Control (11–21) → Growth (22–31). */
export const fixYourMoney: DayTask[] = [
  // ---------------------------------------------------------------- Awareness
  day(
    "Write down your real number",
    "How we handle money has less to do with what we know and more to do with how we behave — and behaviour starts with seeing clearly. Most people carry a vague feeling about their finances instead of an actual number. A feeling can't be improved; a number can.",
    POM,
    [
      "Open every account you have: chequing, savings, credit cards, loans.",
      "Add up what you own in cash and savings. Add up what you owe.",
      "Subtract what you owe from what you own. That is today's number.",
      "Don't judge it. Today is only about looking.",
    ],
    "What did it feel like to see your real number? What surprised you most? (You don't have to share the number itself.)",
  ),
  day(
    "Track every dollar for one day",
    "A conscious spending plan begins with knowing what you spend now, not what you imagine you spend. Small, automatic purchases are the ones we forget, and they add up quietly. One honest day of tracking shows you more than a month of guessing.",
    IWT,
    [
      "From the moment you read this, write down every purchase today — even a coffee.",
      "Use your phone notes. Amount and what it was. Nothing else.",
      "Tonight, mark each one: needed it, loved it, or didn't notice it.",
    ],
    "What did you spend money on today, and which purchase would you not miss if it disappeared?",
  ),
  day(
    "Pay yourself first — even $5",
    "One of the oldest money rules is to keep a part of everything you earn before you spend the rest. The amount matters less than the order: saving first makes it a habit, saving what's left makes it an accident. Wealth is mostly what you don't spend.",
    `${RMB} (the first cure: start thy purse to fattening)`,
    [
      "Pick an amount you will not miss. $5 is enough to start.",
      "Move it into a savings account right now.",
      "If your bank allows it, set this up as an automatic transfer on payday.",
    ],
    "How much did you move, and what will you set as your automatic 'pay yourself first' amount?",
  ),
  day(
    "Work out your real hourly wage",
    "Money is something you trade your life energy for: every purchase costs hours of your life, not just dollars. Your true hourly wage is lower than the number on your contract once you subtract the time and money the job itself costs you. Knowing that number changes how expensive things look.",
    YMYL,
    [
      "Write down your take-home pay for a normal week.",
      "Add the hours the job really takes: commuting, getting ready, unwinding afterwards, overtime.",
      "Subtract what the job costs you each week: transport, work clothes, lunches bought, childcare.",
      "Divide what is left by the real hours. That is your real hourly wage.",
      "Take one recent purchase and convert it into hours of your life.",
    ],
    "What is your real hourly wage, and how many hours of your life did that one purchase cost?",
  ),
  day(
    "List every recurring charge",
    "Subscriptions are designed to be forgotten: a small monthly amount that renews without asking. Seeing them all in one list, with their yearly cost, turns a dozen invisible leaks into one visible number. You can only choose what to keep once you can see everything.",
    IWT,
    [
      "Open your last two months of bank and card statements.",
      "List every charge that repeats: streaming, apps, memberships, storage, software, insurance.",
      "Next to each, write the yearly cost (monthly amount × 12).",
      "Mark each one: use it weekly, use it sometimes, forgot I had it.",
      "Add up the total. Don't cancel anything yet — that is Day 12.",
    ],
    "How many recurring charges did you find, and what do they add up to per year?",
  ),
  day(
    "Sort last month into four buckets",
    "A spending plan does not need dozens of categories. Four are enough: fixed costs, investments, savings goals and guilt-free spending. Once you know the size of each bucket, you can stop feeling guilty about every purchase and start managing the proportions.",
    `${IWT} (the Conscious Spending Plan)`,
    [
      "Take last month's spending from your statements.",
      "Put every item into one of four buckets: FIXED COSTS (rent, bills, groceries, debt payments), INVESTMENTS, SAVINGS, GUILT-FREE SPENDING (eating out, fun, shopping).",
      "Work out each bucket as a percentage of your take-home pay.",
      "Compare with the rough guide: fixed costs 50–60%, investments 10%, savings 5–10%, guilt-free 20–35%.",
    ],
    "What are your four percentages, and which bucket is furthest from where you want it?",
  ),
  day(
    "Find the story behind your money habits",
    "Nobody is crazy with money: people make decisions that make sense given what they lived through. The economy you grew up in and what your family did with money shaped your instincts long before you earned anything. Naming that story is the first step to deciding whether it still serves you.",
    `${POM} (No One's Crazy)`,
    [
      "Write down your earliest memory involving money.",
      "Finish three sentences: “In my family, money was…”, “Rich people are…”, “Spending on myself feels…”.",
      "Circle one belief that is helping you and one that is costing you.",
      "Rewrite the costly belief as a sentence you would rather live by.",
    ],
    "Which money belief did you inherit, and what sentence did you replace it with?",
  ),
  day(
    "Define what 'enough' means for you",
    "The hardest financial skill is getting the goalpost to stop moving. Without a definition of enough, every raise is absorbed by a new want and comparison never ends. Past a certain point, more spending adds very little to how fulfilled you feel — knowing where that point is makes you free.",
    `${POM} (Never Enough) · ${YMYL}`,
    [
      "List the five things you spend on that genuinely make your life better.",
      "List three things you bought mainly because others have them.",
      "Write a monthly number that would cover a life you would be content with.",
      "Write one sentence starting: “For me, enough is…”",
    ],
    "How did you finish the sentence “For me, enough is…”?",
  ),
  day(
    "Sort what you own: asset or liability?",
    "A simple test separates what builds wealth from what drains it: an asset puts money into your pocket, a liability takes money out. Many things people proudly call assets fail that test. The habit of asking which column something belongs in changes what you choose to buy.",
    RDPD,
    [
      "Draw two columns: PUTS MONEY IN MY POCKET and TAKES MONEY OUT.",
      "List the ten most valuable things you own or pay for, and place each one in a column.",
      "For anything in the second column, write what it costs you each month.",
      "Write one thing you could add to the first column in the next year, however small.",
    ],
    "What surprised you in the “takes money out” column, and what could you add to the other one?",
  ),
  day(
    "Spot your 'look rich' spending",
    "Wealth is what you don't see: it is the money that was not spent on the car, the clothes or the upgrade. Research on real millionaires found most of them live well below their means and look unremarkable. Spending to look rich is the fastest way to have less.",
    `${MND} · ${POM} (Wealth Is What You Don't See)`,
    [
      "Look back at the last three months of spending.",
      "Mark anything bought mainly for how it looks to other people.",
      "Add up those items.",
      "Choose one of them you will not repeat, and decide where that money goes instead.",
    ],
    "What did your 'look rich' spending add up to, and where will that money go now?",
  ),

  // ---------------------------------------------------------------- Control
  day(
    "Choose your money dials",
    "Being good with money is not about cutting everything. Spend extravagantly on the few things you love and cut costs mercilessly on the things you don't. Deciding what your personal 'dials' are makes saving feel like a choice instead of a punishment.",
    IWT,
    [
      "Write the two or three things you would happily spend more on (travel, food, health, learning, convenience).",
      "Write the five things you spend on but honestly do not care about.",
      "Pick one from the second list and cut or downgrade it this week.",
      "Decide which 'love' category that freed money now belongs to.",
    ],
    "What are your money dials, and what did you cut to feed them?",
  ),
  day(
    "Cancel one subscription you barely use",
    "A subscription you rarely use still charges you every month for a version of yourself that does not exist. A better approach is to cancel and buy the thing only when you actually want it. You can always subscribe again — most people never do.",
    `${IWT} (the à la carte method)`,
    [
      "Open your Day 5 list of recurring charges.",
      "Pick the one marked “forgot I had it” or “use it sometimes”.",
      "Cancel it now, while you are thinking about it. Screenshot the confirmation.",
      "Work out what you will save in a year.",
      "Set up a transfer of the same monthly amount into savings.",
    ],
    "Which subscription did you cancel, and how much will you save per year?",
  ),
  day(
    "Ask for a lower bill or a waived fee",
    "Companies expect most customers never to ask. A five-minute, polite call to request a lower rate or the removal of a fee works far more often than people assume, especially for long-standing customers. The worst answer you can get is no.",
    IWT,
    [
      "Pick one bill: phone, internet, insurance, a bank fee, a credit-card interest rate.",
      "Look up a competitor's current price so you have a number to quote.",
      "Call or use the chat and say: “I've been a customer for [X] years. I've seen [competitor] at [price]. What can you do to keep me?”",
      "If the first person says no, ask politely to speak with the retention team.",
      "Write down what you were offered, even if you did not take it.",
    ],
    "Which bill did you negotiate, and what happened when you asked?",
  ),
  day(
    "Start a starter emergency fund",
    "The first step out of money stress is a small cash buffer, built quickly. A modest starter fund means the next flat tyre or broken phone is an inconvenience instead of a new debt. It is not an investment — it is insurance against life.",
    `${TMM} (Baby Step 1)`,
    [
      "Open a separate savings account, with no card attached, and name it “Emergency”.",
      "Set a starter target you can reach within a few months. One month of bare essentials is a good first goal.",
      "Move something into it today, even a small amount.",
      "List three things you could sell or pause to reach the target faster.",
    ],
    "What is your starter target, and what did you move in today?",
  ),
  day(
    "Line up your debts for a snowball",
    "Paying off debt is more about behaviour than arithmetic. Listing debts from smallest to largest balance and attacking the smallest first gives you a quick win, and each debt you clear frees its payment for the next. Momentum keeps people going when maths alone does not.",
    `${TMM} (the debt snowball)`,
    [
      "List every debt except a mortgage: balance, interest rate, minimum payment.",
      "Order them from smallest balance to largest.",
      "Commit to minimums on all of them, plus every spare dollar on the smallest.",
      "Work out when the smallest one will be gone.",
      "If you have no debt, list your next three savings goals in the same way.",
    ],
    "What is your smallest debt, and when will it be paid off at your new pace?",
  ),
  day(
    "Try the 70–20–10 split",
    "An old tale tells of a man deep in debt who climbed out by dividing every coin he earned: most to live on, a part kept for himself, and a part paid faithfully to those he owed. A fixed split takes the daily decision out of your hands. You stop asking what you can afford and simply follow the rule.",
    `${RMB} (the clay tablets from Babylon)`,
    [
      "Take your monthly take-home pay.",
      "Work out three numbers: 70% to live on, 10% to keep for yourself, 20% for debts (or extra savings if you have none).",
      "Compare with what you actually do now.",
      "Choose one change that moves you closer to the split this month.",
    ],
    "What are your three numbers, and what one change will you make this month?",
  ),
  day(
    "Automate one transfer",
    "Willpower is unreliable; a system is not. When money moves automatically on payday — to savings, investments and bills — the right thing happens whether or not you feel motivated. Building it once does more than a year of good intentions.",
    `${IWT} (automating your money)`,
    [
      "Log in to your main bank account.",
      "Set up a standing transfer for the day after payday.",
      "Send it to savings, your emergency fund or a debt — whichever is your priority right now.",
      "Start with an amount that feels almost too easy. You can raise it later.",
    ],
    "What transfer did you automate, for how much, and on which day does it run?",
  ),
  day(
    "Separate needs from desires",
    "What each of us calls 'necessary expenses' always grows to match our income unless we push back. Everyone has more desires than their earnings can satisfy, so the skill is choosing which ones are worth the money. A budget is not a cage; it protects your most valued wishes from your passing ones.",
    `${RMB} (the second cure: control thy expenditures)`,
    [
      "List everything you plan to spend on this coming week.",
      "Mark each item N (truly necessary) or D (a desire).",
      "Challenge every N: could you live a month without it?",
      "Rank your D items and keep only those worth more to you than the saving.",
    ],
    "Which 'need' turned out to be a desire, and which desire did you decide was worth keeping?",
  ),
  day(
    "Use cash for one category",
    "Handing over physical cash hurts in a way that tapping a card does not, and that small pain makes people spend less. Putting a fixed amount of cash in an envelope for one category means that when it is empty, you stop. It is a simple brake you can feel.",
    `${TMM} (the envelope system)`,
    [
      "Pick the category you overspend on most: eating out, groceries or fun.",
      "Decide a weekly limit for it.",
      "Withdraw that amount in cash and put it in a labelled envelope.",
      "Pay for that category with cash only for the next seven days.",
    ],
    "Which category did you choose, what limit did you set, and how did paying in cash feel?",
  ),
  day(
    "Build in room for error",
    "The most important part of every plan is planning for the plan not going to plan. A margin of safety — spare cash, lower fixed costs, conservative assumptions — lets you survive bad luck long enough for good luck to work. You don't have to predict what goes wrong, only leave room for it.",
    `${POM} (Room for Error)`,
    [
      "Write the three money shocks most likely to hit you: job loss, a repair, illness, a rent increase.",
      "For each one, write how many weeks you could cope today.",
      "Choose the one that worries you most.",
      "Take one action to widen the margin: add to your emergency fund, lower one fixed cost or review one insurance policy.",
    ],
    "Which shock worries you most, and what did you do today to leave more room for it?",
  ),
  day(
    "Write your one-page spending plan",
    "A plan you can keep on one page is a plan you will follow. Decide the percentages once, automate them, and you no longer need to track every coffee. The aim is to spend without guilt because the important things have already been taken care of.",
    `${IWT} (the Conscious Spending Plan)`,
    [
      "Take your four buckets from Day 6.",
      "Write a target percentage for each that you can realistically hit within three months.",
      "Turn each percentage into a monthly dollar amount.",
      "Next to each bucket, write how the money gets there: an automatic transfer, a separate account or cash.",
      "Put the page where you will see it.",
    ],
    "What are your four target percentages, and which one will be hardest to hit?",
  ),

  // ---------------------------------------------------------------- Growth
  day(
    "See compounding with your own numbers",
    "The most powerful force in money is not a high return; it is a decent return left alone for a very long time. Most of the growth arrives in the later years, which is why starting early and not interrupting it matters more than picking the perfect investment. Time is the ingredient nobody can buy back.",
    `${POM} (Confounding Compounding)`,
    [
      "Open any free online compound-interest calculator.",
      "Enter an amount you could invest monthly and a moderate yearly return, for 10 years.",
      "Run it again for 20, 30 and 40 years, changing nothing else.",
      "Note how much of the final figure is growth, not your own deposits.",
    ],
    "What did your monthly amount grow to after 10 years and after 40 — and what does that tell you about waiting?",
  ),
  day(
    "Learn what an index fund costs",
    "For most people the simplest route works best: own a broad, low-cost index fund that holds the whole market, keep adding to it, and leave it alone. Fees look tiny as a percentage and are enormous over decades. Complexity usually benefits the person selling it.",
    SPW,
    [
      "Search for a broad market index fund available in your country.",
      "Find its yearly fee (called the expense ratio or MER).",
      "Compare it with the fee on any fund you already own, or a typical actively managed fund.",
      "Work out what a 1% difference costs per year on $10,000.",
      "This is learning, not advice — write down any questions for a licensed adviser.",
    ],
    "What fee did you find on the index fund, and how does it compare with what you pay now?",
  ),
  day(
    "Claim any free money on offer",
    "Before anything clever, take the guaranteed wins. If your employer matches retirement contributions, that match is an instant return you cannot get anywhere else. Leaving it unclaimed is turning down part of your salary.",
    `${IWT} (the ladder of personal finance)`,
    [
      "Find out whether your employer offers a retirement match or any savings plan.",
      "Check what you contribute now and how much of the match you receive.",
      "If you are not getting the full match, write the exact step to change it (a form, a portal, an email to HR).",
      "Do that step today, or book a time this week.",
      "No employer plan? Look up the tax-advantaged account available in your country and write down its yearly limit.",
    ],
    "What free money or tax advantage is available to you, and what did you do about it today?",
  ),
  day(
    "Put your savings to work",
    "Money kept idle only buys what it buys today. The old lesson is that each coin saved should be put to labour, so that it earns more coins and those coins earn in turn. Wealth is not the pile you hold but the stream it produces.",
    `${RMB} (the third cure: make thy gold multiply)`,
    [
      "Look at where your savings sit right now.",
      "Find the interest rate each account pays.",
      "Compare with one better option: a high-interest savings account, or the index fund from Day 23.",
      "Decide how much of your savings beyond the emergency fund could work harder.",
      "Write the next step, even if it is only “open an account”.",
    ],
    "How much is your money earning now, and what is your next step to make it earn more?",
  ),
  day(
    "Check one 'opportunity' for the catch",
    "The first rule of investing is not to lose the principal. Promises of unusually high returns attract people precisely because they sound good, and the wise check with those who truly know before parting with money. If you cannot explain how it makes money, you are the product.",
    `${RMB} (the fourth cure: guard thy treasures from loss)`,
    [
      "Think of one investment or scheme you have been pitched or tempted by.",
      "Write the promised return and who benefits if you buy.",
      "Answer three questions: How does it actually make money? What could make me lose all of it? Who with real experience have I asked?",
      "If you cannot answer all three, write “not yet” beside it.",
    ],
    "What opportunity did you examine, and which of the three questions could you not answer?",
  ),
  day(
    "Increase your ability to earn",
    "There is a limit to how much you can cut, but not to how much you can learn to earn. The person who steadily improves their skill is paid more, and asking for a raise works best when you arrive with evidence. Your earning power is your largest asset.",
    `${RMB} (the seventh cure: increase thy ability to earn) · ${IWT}`,
    [
      "Write down three results you delivered in the past year, with numbers where possible.",
      "Look up what others in your role are paid.",
      "Name one skill that would make you worth more within six months.",
      "Take one step today: book a conversation with your manager, enrol in something, or start a side-income idea.",
    ],
    "What skill will raise your income, and what step did you take towards it today?",
  ),
  day(
    "Plan to stay wealthy, not just get wealthy",
    "Getting money and keeping money are different skills. Getting it takes optimism and risk; keeping it takes humility and a fear that what you made can be taken away. The investors who win are rarely the smartest — they are the ones who manage never to be wiped out.",
    `${POM} (Getting Wealthy vs. Staying Wealthy)`,
    [
      "Write the single financial mistake that could set you back five years.",
      "List what you are doing now that makes it more likely: too much debt, one income, everything in one place.",
      "Write one rule that protects you from it.",
      "Tell someone you trust that rule, so they can hold you to it.",
    ],
    "What is your 'never get wiped out' rule?",
  ),
  day(
    "Protect your future income",
    "A sensible person provides in advance for the years when they can no longer earn, and for the family that depends on them. Small, regular provision made early is far lighter than a large one attempted late. Protection is the unexciting half of wealth.",
    `${RMB} (the sixth cure: insure a future income)`,
    [
      "List who depends on your income.",
      "Check what protection you already have: insurance through work, life or disability cover, a pension.",
      "Check that the beneficiaries named on your accounts and policies are correct.",
      "Write down one gap, and the name of the person or company you will ask about it.",
    ],
    "What gap did you find in your protection, and who will you ask about it?",
  ),
  day(
    "Decide what freedom looks like",
    "The highest dividend money pays is control over your time: the ability to do what you want, when you want, with whom you want. Savings buy options, and options are a form of wealth that never shows on a statement. Knowing what you would do with that freedom tells you what you are saving for.",
    `${POM} (Freedom) · ${SPW}`,
    [
      "Describe an ordinary weekday in a life where you control your time.",
      "Estimate what that life would cost per month.",
      "Work out how many months of that life your current savings would buy.",
      "Write the number of months you want to reach, and by when.",
    ],
    "What does a free weekday look like for you, and how many months of it could you afford today?",
  ),
  day(
    "Write your money rules",
    "The best financial plan is not the one that is mathematically perfect; it is the one you can stick with when things get difficult. A few reasonable rules you actually follow beat an optimal strategy you abandon. You have spent a month building the pieces — now put them on one page.",
    `${POM} (Reasonable > Rational)`,
    [
      "Write five rules in your own words. For example: I pay myself first. I keep [X] months of expenses. I spend freely on [your dials]. I never buy an investment I cannot explain.",
      "Look at your Day 1 number and work out today's.",
      "Put a 20-minute money check-in in your calendar, repeating monthly.",
      "Choose the one habit from this course you will keep no matter what.",
    ],
    "What are your five money rules, and how has your number changed since Day 1?",
  ),
];
