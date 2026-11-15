import { day, type DayTask } from "./types";

const CO = "Co-Intelligence — Ethan Mollick";
const PM = "Prediction Machines — Ajay Agrawal, Joshua Gans & Avi Goldfarb";
const HM = "Human + Machine — Paul R. Daugherty & H. James Wilson";
const YL = "You Look Like a Thing and I Love You — Janelle Shane";
const CW = "The Coming Wave — Mustafa Suleyman";
const IM = "Impromptu — Reid Hoffman";

/**
 * 21 days: Prompt Like a Pro (1–7) → Research & Learn (8–14) → Create & Automate (15–21).
 * Any free chat assistant works (ChatGPT, Claude, Gemini, Copilot). Text in
 * “quotes” inside the steps is meant to be typed or pasted into the assistant.
 */
export const aiForEverydayLife: DayTask[] = [
  // ---------------------------------------------------------------- Prompt Like a Pro
  day(
    "Invite AI to one real task",
    "The fastest way to learn what AI can do is to bring it into the work you already do, instead of testing it on toy questions. You are the expert in your own tasks, so you can judge its answers better than anyone. Expect it to be surprisingly good at some things and surprisingly bad at others — the only way to find that uneven edge is to try.",
    `${CO} (Principle 1: always invite AI to the table)`,
    [
      "Open any AI assistant — ChatGPT, Claude or Gemini. The free version is enough for this whole course.",
      "Pick one real thing on your to-do list today: an email to write, a plan to make, a decision to think through.",
      "Describe it the way you would to a helpful colleague. Type: “I need help with [task]. It's for [who]. A good result looks like [what you want]. Here is the background: [2–3 sentences].”",
      "Read the answer, then reply at least once: “Make it shorter”, “That part is wrong because…”, or “Give me two other options.” The second answer is almost always better than the first.",
      "Use it, edit it or throw it away — then note one thing it did well and one thing it got wrong.",
    ],
    "What task did you bring to AI, and where was it better or worse than you expected?",
  ),
  day(
    "Give it a role and an audience",
    "An AI answers as a bland average of everything it has read unless you tell it who to be. Treating it like a person — and saying what kind of person — pulls out a more specific, more useful voice. Telling it who the answer is for matters just as much as telling it who is speaking.",
    `${CO} (Principle 3: treat AI like a person, and tell it what kind of person it is)`,
    [
      "Pick a question you would normally type into a search engine, for example how to plan meals for the week or how to ask for a raise.",
      "Ask it plainly first and keep the answer.",
      "Start a new chat and ask again with a role and an audience: “You are a [specific expert, e.g. a dietitian who works with busy parents]. I am [who you are and your situation]. Explain it for someone who [your level]. Be practical and specific.”",
      "Put the two answers side by side. Mark what changed: the detail, the tone, the assumptions about you.",
      "Save the role line that worked — you will reuse it.",
    ],
    "What role and audience did you give the AI, and what was the biggest difference between the two answers?",
  ),
  day(
    "Catch it being wrong",
    "AI can sound completely confident while being incorrect: it produces what is plausible, not what is checked. That is why the human has to stay in the loop — not to accept or reject AI wholesale, but to verify where it matters. Knowing how it fails is what makes it safe to rely on.",
    `${CO} (Principle 2: be the human in the loop)`,
    [
      "Ask the AI about something you know extremely well: your job, your home town, your hobby, your own field of study.",
      "Ask for specifics that can be checked: “Give me five precise facts with names, dates or numbers.”",
      "Go through the answer line by line and find at least one thing that is wrong, outdated or invented.",
      "Tell it: “This part is incorrect: [quote it]. Why did you say that?” Notice whether it corrects itself or simply agrees with whatever you say.",
      "Write your personal rule: the kinds of facts you will always double-check before using an AI answer.",
    ],
    "What did the AI get wrong, and what is your rule for checking its answers from now on?",
  ),
  day(
    "Write a five-part prompt",
    "Working well with AI looks less like searching and more like briefing a capable new colleague who knows nothing about your situation. The more context and constraints you give, the less it has to guess — and guessing is where generic answers come from. A good brief is the single biggest upgrade to your results.",
    `${CO} (on giving AI context and constraints)`,
    [
      "Choose a task you actually need done this week.",
      "Write your prompt in five labelled parts. ROLE: who the AI should be. CONTEXT: your situation in 2–4 sentences. TASK: exactly what you want. FORMAT: bullets, table, length, tone. CONSTRAINTS: what to avoid and what must be included.",
      "Example: “ROLE: You are an experienced travel planner. CONTEXT: Two adults, 4 days in Lisbon in May, we like food and walking, budget about $150 a day. TASK: Plan the trip day by day. FORMAT: A table with morning, afternoon, evening. CONSTRAINTS: No more than one museum a day, no tourist-trap restaurants.”",
      "Send it. Then send the lazy one-line version of the same request in a new chat and compare.",
      "Save the five headings as a note on your phone. This is your template for the rest of the course.",
    ],
    "Paste your five-part prompt. What did the structured version give you that the one-liner did not?",
  ),
  day(
    "Show it examples",
    "AI works from patterns, so one good example tells it more than a paragraph of description. If you want writing that sounds like you, or output in an exact shape, show it what “right” looks like. People who get consistent results rarely describe what they want — they demonstrate it.",
    `${CO} (on working with AI as a co-writer)`,
    [
      "Find two or three short things you wrote that sound like you: messages, emails, captions, notes.",
      "Type: “Here are examples of how I write. Example 1: [paste]. Example 2: [paste]. Example 3: [paste]. Describe my style in five bullet points.”",
      "Check its description. Correct it: “Not quite — I never use exclamation marks, and I keep sentences short.”",
      "Now ask: “Using exactly that style, write [something you need: a message to a friend, a product description, a post].”",
      "Try the same trick for format: paste one example of a layout you like and say “Give me the answer in this same structure.”",
    ],
    "How did the AI describe your writing style, and how close was its version to something you would really send?",
  ),
  day(
    "Make it think, and make it ask you questions",
    "AI gives better answers when it works through a problem in steps instead of jumping to a conclusion, and when it is missing less information about you. The simplest way to fix both is to ask for its reasoning and to let it interview you first. You stop being someone who types a request and become someone who runs a conversation.",
    `${CO} (on prompting AI to reason step by step)`,
    [
      "Pick a real decision you are facing: a purchase, a move, a job choice, a plan for the month.",
      "Type: “I need to decide [decision]. Before you answer, ask me the five questions you most need answered to give good advice. Ask them one at a time.”",
      "Answer its questions honestly.",
      "Then type: “Now think it through step by step. List the options, the trade-offs of each, and what you are assuming. Give your recommendation only at the end.”",
      "Push back once: “What is the strongest argument against your recommendation?”",
    ],
    "Which question from the AI made you think hardest, and did its final recommendation change your mind?",
  ),
  day(
    "Write a hard email in your own voice",
    "AI works best as an amplifier: it gives you a fast first draft and options you would not have thought of, while you stay the author who decides what is true and what gets sent. The time you save is not in typing — it is in getting past the blank page. Your name is on the message, so the judgment has to be yours.",
    `${IM} (on AI as a co-pilot that amplifies human work)`,
    [
      "Choose an email or message you have been putting off: a complaint, a follow-up, a no, an awkward request.",
      "Give the full brief: “Write an email to [who, and your relationship]. Goal: [what you want to happen]. Facts: [the details]. Tone: [firm but polite / warm / brief]. Keep it under 120 words.”",
      "Paste one of your own emails and add: “Match this writing style.”",
      "Ask for range: “Give me three versions: one direct, one warm, one very short.”",
      "Build your final version from the best lines, then ask: “Read this as the recipient. What could be misunderstood or sound rude?” Fix it.",
      "Check every fact, name and date yourself, then send it.",
    ],
    "What email did you finally send, and which part did you change by hand before sending it?",
  ),

  // ---------------------------------------------------------------- Research & Learn
  day(
    "Research a topic and check the sources",
    "AI makes prediction cheap: it can tell you in seconds what an answer probably is. That makes the parts it cannot do — judging what matters and checking what is true — more valuable, not less. Good research with AI means letting it gather, and keeping the verifying for yourself.",
    PM,
    [
      "Pick something you genuinely want to understand this week: a health question, a purchase, a news story, a skill.",
      "Use an assistant that can search the web (turn on Search or Web in ChatGPT, Gemini, Copilot or Perplexity).",
      "Type: “Research [topic]. Give me a summary in plain language, the three points experts agree on, the two points they disagree on, and a link to a source for every claim.”",
      "Open at least two of the links. Confirm that each page really says what the AI claimed. Note any link that is broken, irrelevant or says something different.",
      "Ask: “What is the best evidence against this summary?” and “Which of these sources is least reliable, and why?”",
    ],
    "What did you research, and did the sources actually say what the AI claimed they said?",
  ),
  day(
    "Compare options in a table and decide",
    "Every decision has two parts: predicting what will happen, and judging what you want. AI is good at the first and has no access to the second unless you supply it. The better you describe what matters to you, the more useful its comparison becomes.",
    PM,
    [
      "Choose a real choice between two to four options: phones, courses, cities, plans, tools.",
      "List your criteria first, in your own words, with weights: “What matters to me: price (most important), battery life, camera, how long it will last.”",
      "Type: “Compare [options] in a table using these criteria: [list]. Score each from 1 to 5 with a one-line reason. Say where you are unsure or where your information may be out of date.”",
      "Challenge it: “What would make the lowest-scoring option the right choice?” and “What have I left out of my criteria?”",
      "Check the two facts that matter most to you (price, a key spec) on the official site, then make the call yourself.",
    ],
    "What did you decide, and which of your own criteria ended up settling it?",
  ),
  day(
    "Turn AI into your tutor",
    "One-to-one tutoring is one of the most effective ways to learn, and until now almost nobody could afford it. AI can explain an idea as many times and in as many ways as you need, at exactly your level, without judging the question. The learning still happens in your head — which means you have to make it test you, not just tell you.",
    `${CO} (AI as a tutor)`,
    [
      "Pick one thing you have always half-understood: compound interest, how vaccines work, a grammar rule, a concept from your job.",
      "Type: “Explain [topic] three times: first for a 10-year-old, then for a high-school student, then for an adult professional.”",
      "Then: “Give me a real-life analogy for it, and one common mistake people make.”",
      "Now make it test you: “Ask me five questions, one at a time, to check I really understand. Start easy and get harder. Do not give me the answer until I have tried.”",
      "For any question you miss, say: “Explain that part a different way.”",
      "Finish by explaining the idea back in your own words and asking: “What did I get wrong or leave out?”",
    ],
    "What did you learn today, and which quiz question showed you that you had not really understood it yet?",
  ),
  day(
    "Summarise a long document — and verify it",
    "AI does not understand a task the way you do; it finds the easiest route to something that looks like a good answer. With a long document that can mean a smooth summary that skips the awkward clause or invents a detail. A summary is a map, and you still need to check it against the territory.",
    YL,
    [
      "Find a long document you have been avoiding: a contract, a report, terms and conditions, a long article or a PDF manual.",
      "Upload the file or paste the text. Leave out anything private, such as account numbers or ID details.",
      "Type: “Summarise this in ten bullet points. Then list: anything that costs me money, any deadline, and anything I must do. Quote the exact sentence for each item.”",
      "Pick three of the quoted sentences and find them in the original. Confirm they exist and mean what the AI said.",
      "Ask the questions you actually care about: “Can I cancel, and how?”, “What happens if I am late?”, “What is unusual here compared with a normal agreement of this type?”",
    ],
    "What document did you summarise, and did all three quotes you checked really appear in it?",
  ),
  day(
    "Rehearse a difficult conversation",
    "Getting better at anything takes practice with feedback, and most of us never get to rehearse the conversations that matter most. AI can play the other person as many times as you like and then step out of the role to coach you. It is a safe room to be clumsy in before it counts.",
    `${CO} (AI as a coach)`,
    [
      "Choose a conversation you are nervous about: asking for a raise, giving feedback, saying no, a tough talk with family.",
      "Set the scene: “Role-play with me. You are [person], who is [their personality and likely reaction]. I am going to [my goal]. Stay in character, push back realistically, and keep your replies short. I will start.”",
      "Have the conversation for at least six turns. If your assistant has voice mode, speak it out loud.",
      "Then type: “Step out of the role. As a communication coach, tell me three things I did well and three things to change, quoting my exact words.”",
      "Run it once more using the feedback, and ask it to play the person in a harder mood.",
    ],
    "What conversation did you rehearse, and what is one sentence you will say differently in the real one?",
  ),
  day(
    "Ask questions of your own data",
    "The biggest gains do not come from machines replacing people or people ignoring machines, but from the two working together in the space between. One of the skills that makes that work is knowing how to question a machine well: asking, probing and asking again until the numbers tell you something useful.",
    `${HM} (the “missing middle” and fusion skills)`,
    [
      "Find a small set of your own numbers: a bank or card export, a step-count history, a budget sheet, sales figures. Remove names and account numbers first.",
      "Upload the spreadsheet or CSV (or paste the rows) and type: “Describe this data. What does each column mean, and is anything missing or odd?”",
      "Ask three questions you actually care about, for example: “Which three categories cost me the most?”, “What changed month to month?”, “What are the five largest single items?”",
      "Ask for a picture: “Make a simple chart of [the most interesting result].”",
      "Recalculate one number yourself with a calculator or a spreadsheet formula to confirm the AI got it right.",
      "Finish with: “Based on this, what are two things I could do differently?”",
    ],
    "What data did you analyse, what did it reveal, and did the number you checked by hand match?",
  ),
  day(
    "Map what AI should and should not do for you",
    "AI's abilities form a jagged frontier: some hard-looking tasks are easy for it and some easy-looking ones are beyond it, and the line is invisible until you test it. People who use it best split their work deliberately — handing over some tasks completely, weaving it into others, and keeping some entirely human. Two weeks in, you have enough experience to draw your own map.",
    `${CO} (the jagged frontier; centaurs and cyborgs)`,
    [
      "List ten tasks you do in a normal week, at work and at home.",
      "Sort each into one of three columns. AI DOES IT (I check the result). WE DO IT TOGETHER (back and forth). ONLY ME (it needs my judgment, my relationships or my values).",
      "Ask the AI for a second opinion: “Here are my weekly tasks: [list]. For each, say how you could help and where you would probably fail.”",
      "Pick the three best prompts you have written so far in this course and save them in one note called “My prompts”, with a line saying when to use each.",
      "Choose one task from the AI DOES IT column and hand it over today.",
    ],
    "What are your three columns, and which task surprised you by landing in “Only me”?",
  ),

  // ---------------------------------------------------------------- Create & Automate
  day(
    "Brainstorm thirty ideas, then pick one",
    "AI is tireless at producing variations, and creativity often comes from sheer volume: the more ideas on the table, the better the best one tends to be. Most of what it suggests will be ordinary. Your job is to be the editor — to spot the two that are interesting and push them further.",
    `${CO} (AI as a creative)`,
    [
      "Choose something that needs ideas: a gift, a name, a side project, content to post, a weekend plan, a way to save money.",
      "Give constraints, because constraints make ideas better: “Give me 30 ideas for [thing]. Constraints: [budget, time, audience, what I have already tried]. Make ten safe, ten unusual and ten slightly ridiculous.”",
      "Pick your favourite three and type: “Combine ideas [numbers] into something new. Give me five variations.”",
      "Stress-test the winner: “You are a sceptical expert. Give me the three biggest reasons this will not work, and how to fix each.”",
      "Turn it into a first step: “What is the smallest version of this I could do in the next 48 hours?”",
    ],
    "What idea did you choose, and what is the 48-hour first step?",
  ),
  day(
    "Create an image from a description",
    "An image model does not know what things are; it knows which patterns tend to appear together. That is why it can produce something beautiful and then get hands, text or simple logic wrong. You get good results by describing precisely and iterating, not by expecting it to understand what you meant.",
    YL,
    [
      "Decide what you need a picture for: a birthday card, a logo idea, a post background, a room makeover idea, a phone wallpaper.",
      "Open an image tool. The image feature inside ChatGPT, Gemini or Copilot works, as does any free image generator.",
      "Describe it in five parts: SUBJECT, STYLE (photo, watercolour, flat illustration), LIGHTING AND COLOUR, COMPOSITION (close-up, wide, from above), and FORMAT (square, tall).",
      "Example: “A cosy reading corner with a green armchair and a tall bookshelf, warm evening light, soft watercolour style, wide view, vertical format, no text.”",
      "Improve it three times, changing one thing each time: “Same image, but make it morning light” or “Remove the lamp.”",
      "Look closely for mistakes (odd hands, garbled letters, impossible objects) and fix them with one more instruction. Do not ask for real people's faces or copy a living artist's style.",
    ],
    "What image did you make, and how many rounds did it take before it matched what was in your head?",
  ),
  day(
    "Build a one-page website by describing it",
    "The tools you are using today are the weakest you will ever use — they improve every few months. That changes what is worth learning: not the syntax of code, but how to describe clearly what you want built and how to judge the result. A year ago this task needed a developer; today it needs a good brief.",
    `${CO} (Principle 4: assume this is the worst AI you will ever use)`,
    [
      "Decide on a simple one-page site: a personal profile, a page for a small business, an event invitation, a portfolio, a link page.",
      "Open an assistant that can build and preview a page inside the chat: Claude (Artifacts), ChatGPT (Canvas) or Gemini (Canvas).",
      "Write the brief: “Build a single-page website for [what]. Sections: a headline, a short description, three key points, a contact button. Style: clean, modern, [two colours], looks good on a phone. Write the real text yourself using these details: [facts about you or the business].”",
      "Look at the preview, then improve it three times with one clear request each: “Make the headline bigger and shorter”, “Add a section with three customer quotes”, “Change the green to navy.”",
      "Test it at phone width. Tell the AI exactly what looks wrong and ask it to fix it.",
      "Use the tool's Share or Publish button to get a link, and send it to one person for feedback.",
    ],
    "What did you build, and what was the most useful change you asked the AI to make?",
  ),
  day(
    "Make a short video with AI",
    "Powerful technologies spread fast because their cost collapses: what once needed a studio and a team becomes something anyone with a phone can do. Video is going through that shift right now. The scarce skill is no longer operating the equipment — it is knowing what is worth saying in thirty seconds.",
    CW,
    [
      "Choose a 20–30 second message: a tip you know well, a product, a thank-you, a book idea, an announcement.",
      "Get a script: “Write a 30-second video script about [topic] for [audience]. Open with a hook in the first three seconds, make one clear point, end with one call to action. About 70 words, spoken language.”",
      "Get a shot list: “Turn this script into a storyboard of five shots. For each: what is on screen, the on-screen text, and how many seconds.”",
      "Make it in a free tool. Easiest route: a video editor with AI features (CapCut, Canva or similar) — paste the script, let it generate captions and a voiceover, and add stock or AI-generated clips for each shot. If you have access to a text-to-video model, generate one or two shots from your storyboard descriptions.",
      "Watch it with the sound off and then on. Fix one thing: the hook, the pace or the captions.",
      "Export it. If you post it and it uses AI-generated footage or voice, say so.",
    ],
    "What was your video about, and which part took longest: the script, the visuals or the editing?",
  ),
  day(
    "Build your own reusable assistant",
    "Getting value from AI over time is less about one clever prompt and more about teaching: people have to train a system in what good looks like, explain its output to others, and keep it on track. A custom assistant is that idea made small — you write the instructions once and it behaves that way every time.",
    `${HM} (humans as trainers, explainers and sustainers of AI)`,
    [
      "Pick a task you repeat every week: planning meals, replying to customers, writing posts, studying, reviewing your spending.",
      "Open the feature that saves instructions: a custom GPT or Project in ChatGPT, a Project in Claude, or a Gem in Gemini. If you have none of these, save the instructions as a note to paste in each time.",
      "Write its instructions in four parts. WHO YOU ARE: its role. WHO I AM: your situation, preferences and constraints. HOW TO ANSWER: format, length, tone. RULES: what it must always do and never do, including “ask me a question if anything is unclear.”",
      "Add knowledge: upload or paste two or three reference items, such as your past examples, your price list or your notes.",
      "Test it with three real requests. After each one, improve the instructions instead of just correcting the answer.",
      "Name it and pin it where you will find it next week.",
    ],
    "What does your assistant do, and what rule did you have to add after testing it?",
  ),
  day(
    "Give an AI agent a multi-step job",
    "The next stage of AI is not systems that talk, but systems that can be given a goal and carry out the steps to reach it with little supervision. That is more useful and more risky at the same time, because an agent acts, not just answers. The skill to practise is delegation with limits: a clear goal, clear boundaries and a check before anything irreversible happens.",
    `${CW} (on increasingly capable, goal-directed AI)`,
    [
      "Choose a job with several steps and low stakes: plan a weekend trip with real options and prices, find the best three products under a budget, or prepare a briefing on a company before an interview.",
      "Use an agent-style feature: Deep Research or Agent mode in ChatGPT, Research in Claude, or Deep Research in Gemini. These browse and work for several minutes on their own.",
      "Write the brief like a manager: “GOAL: [the result]. STEPS I EXPECT: [search, compare, verify, summarise]. LIMITS: only use information from the last 12 months, do not buy or book anything, do not sign up for anything. OUTPUT: a table with links, then your recommendation and what you are unsure about.”",
      "Let it run. Watch what it does: which sites it opens, where it gets stuck, what it skips.",
      "Review the result like a manager, too: open three links, check two facts, and send it back once with corrections.",
      "Write your own rule for agents: what you will let one do alone, and what always needs your approval first (spending money, sending messages, deleting anything).",
    ],
    "What job did you give the agent, and what is your rule about what it may never do without asking you?",
  ),
  day(
    "Write your personal AI playbook",
    "Four habits carry you through whatever comes next: bring AI to everything you do, stay the human in the loop, tell it who to be, and remember that today's tools are the worst you will ever use. Tools will change and prompts will age, but those habits will not. Three weeks of practice means you can now write your own rules instead of borrowing someone else's.",
    `${CO} (the four principles of working with AI)`,
    [
      "Open a new note called “My AI playbook”.",
      "Write section one, WHAT I USE IT FOR: your five best uses from this course, each with the prompt that worked.",
      "Write section two, WHAT I ALWAYS CHECK: facts, numbers, quotes, anything with money or health attached.",
      "Write section three, WHAT STAYS HUMAN: the decisions, relationships and private information you will not hand over.",
      "Set up one weekly routine and put it in your calendar now, for example: every Sunday, ask your custom assistant to plan the week from your to-do list.",
      "Ask the AI to review it: “Here is my AI playbook. What is missing, and what is one advanced skill I should learn next?” Then pick that skill as your next step.",
    ],
    "What are the three rules in your playbook, and which weekly routine did you put in your calendar?",
  ),
];
