import { day, type DayTask } from "./types";

const HW = "How to Win Friends and Influence People — Dale Carnegie";
const NS = "Never Split the Difference — Chris Voss";
const P48 = "The 48 Laws of Power — Robert Greene";

/**
 * 33 days: Carnegie's 30 principles in the book's own order, then 3 negotiation
 * tactics. Make People Like You (1–9) → Win People to Your Thinking (10–21) →
 * Lead & Negotiate (22–33).
 */
export const talkWithConfidence: DayTask[] = [
  // ---------------------------------------------------------------- Make People Like You
  day(
    "Go one day without criticising",
    "Criticism rarely changes anyone — it puts people on the defensive and makes them justify themselves. People respond far better to being understood than to being corrected. Holding back a complaint is the first people-skill, and the hardest.",
    `${HW} (Principle 1: don't criticise, condemn or complain)`,
    [
      "From now until you sleep: no criticising, condemning or complaining about anyone.",
      "When you catch the urge, pause and ask: 'Why might they have done that?'",
      "Keep a tally of how many times you caught yourself.",
    ],
    "How many times did you catch yourself, and what was the hardest moment to stay quiet?",
  ),
  day(
    "Give one honest, specific compliment",
    "Almost everyone is hungry to feel appreciated, and sincere appreciation is different from flattery because it is specific and true. Noticing what someone did well — and saying it — costs nothing and is remembered for a long time.",
    `${HW} (Principle 2: give honest and sincere appreciation)`,
    [
      "Pick one person you'll see or message today.",
      "Find something they genuinely did well. Be specific.",
      "Tell them, without asking for anything afterwards.",
    ],
    "Who did you appreciate, what exactly did you say, and how did they react?",
  ),
  day(
    "Talk about what they want",
    "The only way to influence someone is to talk about what they want and show them how to get it. People act for their own reasons, not yours, so a request framed around your needs is easy to ignore. Before you ask, work out why it would be good for them. An appeal to someone's own interest succeeds where an appeal to gratitude fails.",
    `${HW} (Principle 3: arouse in the other person an eager want) · ${P48} (Law 13)`,
    [
      "Think of one thing you need from someone today.",
      "Before asking, write down what that person wants or worries about.",
      "Rewrite your request so it starts with their benefit, not yours.",
      "Make the request and notice the difference in how it lands.",
    ],
    "What did you ask for, and how did you frame it around what the other person wanted?",
  ),
  day(
    "Be interested instead of interesting",
    "You make more friends in two months by being genuinely interested in other people than in two years of trying to get them interested in you. Curiosity about someone's life is rare enough that people remember who showed it. Interest cannot be faked for long — it has to be real.",
    `${HW} (Principle 4: become genuinely interested in other people)`,
    [
      "Choose one person you usually only exchange small talk with.",
      "Ask a question about something they care about: their work, family, a project, a hobby.",
      "Ask one follow-up question based on their answer.",
      "Say nothing about yourself unless they ask.",
    ],
    "Who did you get curious about, and what did you learn that you didn't know before?",
  ),
  day(
    "Smile first",
    "Actions speak louder than words, and a smile says: I like you, I am glad to see you. It costs nothing and changes how the next thirty seconds of any meeting go. A forced grin fools nobody — think of something you are actually glad about, and it becomes real.",
    `${HW} (Principle 5: smile)`,
    [
      "Before each conversation today, think of one thing you are glad about.",
      "Smile at the first five people you meet or speak to — including on the phone, where it can be heard.",
      "Watch what their face does in return.",
      "Smile at one stranger: a cashier, a neighbour, a driver.",
    ],
    "How did people respond when you smiled first, and which reaction surprised you?",
  ),
  day(
    "Use people's names",
    "A person's name is, to that person, the sweetest and most important sound in any language. Remembering it and using it is a small compliment that most people never bother to pay. Forgetting it, or getting it wrong, tells them they did not matter enough.",
    `${HW} (Principle 6: remember that a person's name is the sweetest sound)`,
    [
      "Learn the name of one person you see regularly but have never addressed by name.",
      "When you hear a new name today, repeat it straight away: “Nice to meet you, [name].”",
      "Use each person's name once at the start and once at the end of a conversation.",
      "Write new names down tonight with one detail about the person.",
    ],
    "Whose name did you learn or use today, and how did they react when you used it?",
  ),
  day(
    "Listen for two full minutes",
    "To be a good conversationalist, be a good listener. Most people are so busy planning what to say next that they never really hear the other person — and everyone can feel the difference. Giving someone your complete attention is one of the highest compliments you can pay. Saying less than necessary also means you learn more than you give away.",
    `${HW} (Principle 7: be a good listener; encourage others to talk about themselves) · ${P48} (Law 4)`,
    [
      "In one conversation today, ask an open question and then stay quiet.",
      "Listen for two full minutes without interrupting, advising or switching to your own story.",
      "Show you are following: nod, and say “go on” or “what happened then?”",
      "Summarise what they said in one sentence before you add anything of your own.",
    ],
    "Who did you listen to, and what did you hear that you would normally have talked over?",
  ),
  day(
    "Talk about their interests",
    "The royal road to a person's heart is to talk about the things they treasure most. A few minutes spent finding out what someone cares about before you meet them changes the whole conversation. People light up when the subject is theirs.",
    `${HW} (Principle 8: talk in terms of the other person's interests)`,
    [
      "Pick someone you will speak with today.",
      "Before you do, find out or recall one thing they love: a team, a hobby, their children, a place.",
      "Bring it up early and let them talk.",
      "Notice how their energy changes when the topic is theirs.",
    ],
    "What interest did you bring up, and how did the person change when you did?",
  ),
  day(
    "Make someone feel important",
    "Almost everyone you meet feels superior to you in some way, and the sure way to their heart is to let them know, sincerely, that you recognise it. The wish to feel important is one of the deepest human hungers. Do it sincerely or not at all.",
    `${HW} (Principle 9: make the other person feel important — and do it sincerely)`,
    [
      "Choose someone whose work usually goes unnoticed: a cleaner, a driver, a junior colleague, a parent.",
      "Find something they do better than you.",
      "Tell them specifically, and ask how they learned to do it.",
      "Use small courtesies all day: “Would you mind…”, “Thank you for…”.",
    ],
    "Who did you make feel important, and what did you ask them to teach you?",
  ),

  // ---------------------------------------------------------------- Win People to Your Thinking
  day(
    "Walk away from an argument",
    "You cannot win an argument. If you lose it, you lose; if you win it, the other person feels smaller, resents the victory and keeps their opinion anyway. The only way to get the best of an argument is to avoid it. Demonstrating a point through what you do convinces people in a way that winning with words never will.",
    `${HW} (Part 3, Principle 1: avoid arguments) · ${P48} (Law 9)`,
    [
      "Notice the first moment today when a disagreement starts heating up.",
      "Stop. Take a breath before you answer.",
      "Say: “You may be right. Let me think about that.”",
      "Look for one thing in what they said that you can honestly agree with, and say it.",
      "If it still matters tomorrow, raise it again calmly.",
    ],
    "What argument did you step away from, and what happened to it afterwards?",
  ),
  day(
    "Never say 'you're wrong'",
    "Telling someone they are wrong strikes at their intelligence, pride and self-respect; it makes them want to strike back, never to change their mind. You get further by admitting you might be mistaken yourself and suggesting you look at the facts together. People will drop almost any opinion they are allowed to drop on their own.",
    `${HW} (Part 3, Principle 2: show respect for the other person's opinions)`,
    [
      "Today, ban three phrases: “You're wrong”, “No, actually…”, “That's not true”.",
      "When you disagree, start with: “I may be wrong — I often am. Can we look at it together?”",
      "Ask a question instead of stating the correction.",
      "Notice whether the other person softens.",
    ],
    "When did you want to say 'you're wrong', what did you say instead, and how did it land?",
  ),
  day(
    "Admit a mistake before anyone points it out",
    "If you know you are going to be criticised anyway, it is far better to say it yourself first. Admitting a mistake quickly and fully takes the fight out of the other person and usually makes them generous in return. Defending yourself is what anyone can do; owning it sets you apart.",
    `${HW} (Part 3, Principle 3: if you are wrong, admit it quickly and emphatically)`,
    [
      "Think of one thing you got wrong recently: something late, forgotten, mishandled or said badly.",
      "Go to the person today and say it plainly: “I got this wrong. Here is what I should have done.”",
      "No excuses and no “but”.",
      "Say what you will do to put it right.",
    ],
    "What did you admit, and how did the other person respond?",
  ),
  day(
    "Begin in a friendly way",
    "A drop of honey catches more flies than a gallon of gall. If someone's heart is set against you, no amount of logic will reach them; friendliness is what opens the door. However tense the subject, the first minute decides the tone.",
    `${HW} (Part 3, Principle 4: begin in a friendly way)`,
    [
      "Pick a conversation you expect to be tense: a complaint, a correction, a request.",
      "Plan your first two sentences so that they are warm and sincere.",
      "Open with something you appreciate or have in common before you raise the issue.",
      "Keep your voice slower and lower than feels natural.",
    ],
    "What were your first two sentences, and how did the tense conversation go?",
  ),
  day(
    "Get a 'yes' early",
    "When someone has said no, their pride demands they stay consistent with it. So begin with what you both agree on, and keep stressing that you want the same end and differ only about the method. Each early yes moves the conversation in a direction that is easier to continue than to reverse.",
    `${HW} (Part 3, Principle 5: get the other person saying “yes, yes” immediately)`,
    [
      "Before a discussion where you want agreement, write three things you both clearly agree on.",
      "Open with those as questions the other person will answer yes to.",
      "Only then raise the point you differ on.",
      "If you hear a no, go back to common ground before continuing.",
    ],
    "What were your three points of agreement, and did starting with them change the outcome?",
  ),
  day(
    "Let the other person do the talking",
    "Most people trying to win others over talk too much themselves. The other person knows more about their own problems and business than you do, so ask and let them tell you. Even our friends would rather tell us about their achievements than listen to ours.",
    `${HW} (Part 3, Principle 6: let the other person do a great deal of the talking)`,
    [
      "In one conversation where you want something, aim to speak for less than a third of the time.",
      "Ask questions that begin with “how” or “what”.",
      "When you disagree, do not interrupt. Let them finish everything they have to say.",
      "Resist telling your own success story today.",
    ],
    "How much of the conversation did you manage not to fill, and what did you learn by staying quiet?",
  ),
  day(
    "Let it be their idea",
    "People have far more faith in ideas they discover for themselves than in ones handed to them. Making suggestions and letting the other person think out the conclusion works better than pushing your view. Whether you get the credit matters less than whether the thing gets done.",
    `${HW} (Part 3, Principle 7: let the other person feel that the idea is theirs)`,
    [
      "Choose one idea you want someone to accept.",
      "Do not present it. Ask for their thoughts on the problem instead.",
      "Guide with questions: “What if we…?”, “What do you think would happen if…?”",
      "When they arrive at something close to your idea, let them own it and say “I like your suggestion.”",
    ],
    "What idea did you let someone else arrive at, and how did it feel not to take the credit?",
  ),
  day(
    "See it from their side",
    "Other people may be completely wrong, but they do not think so. There is a reason they think and act as they do; find that reason and you have the key to their actions. Honestly asking “how would I feel in their place?” saves time and removes most of the irritation.",
    `${HW} (Part 3, Principle 8: try honestly to see things from the other person's point of view)`,
    [
      "Pick someone you disagree with or find difficult.",
      "Write three sentences as if you were them, starting with “I…”. Describe their situation, pressures and wants.",
      "Ask yourself: if I were in their place, would I act any differently?",
      "Start your next conversation with them from that understanding.",
    ],
    "Whose side did you write from, and what did you understand that you had been missing?",
  ),
  day(
    "Say 'I don't blame you for feeling that way'",
    "Most people you meet are hungry for sympathy, and one sentence can stop an argument and create goodwill: “I don't blame you at all for feeling as you do. In your place I would feel the same.” You can say it honestly, because with their history and their circumstances, you would.",
    `${HW} (Part 3, Principle 9: be sympathetic with the other person's ideas and desires)`,
    [
      "Listen today for someone who is upset, annoyed or complaining.",
      "Before solving anything, say: “I don't blame you for feeling that way. In your position I would feel the same.”",
      "Then stay quiet and let them continue.",
      "Only after they have finished, ask: “What would help?”",
    ],
    "Who did you offer sympathy to, and what changed after you said it?",
  ),
  day(
    "Appeal to the better motive",
    "People usually have two reasons for doing something: one that sounds good and the real one. They will think of the real one without your help, so appeal to the nobler one. Most people want to see themselves as honest and fair, and they respond to being treated as if they are.",
    `${HW} (Part 3, Principle 10: appeal to the nobler motives)`,
    [
      "Think of a request you need to make where pressure would be the easy route.",
      "Ask yourself which good quality the person likes to see in themselves: fairness, reliability, generosity, professionalism.",
      "Frame the request around it: “I know you're someone who keeps their word, so I wanted to ask you directly…”",
      "Mean it. This only works if you genuinely believe it of them.",
    ],
    "What motive did you appeal to, and how did the person respond to being seen that way?",
  ),
  day(
    "Show it, don't just say it",
    "Merely stating a truth is not enough. It has to be made vivid, interesting and dramatic — shops, films and advertisers all know this. A demonstration people can see convinces them faster than any amount of explanation.",
    `${HW} (Part 3, Principle 11: dramatise your ideas)`,
    [
      "Pick one point you need to get across today.",
      "Find a way to show it instead of saying it: an object, a picture, a number made physical, a before-and-after, a short story.",
      "Use it in the conversation or message.",
      "Watch the difference in attention.",
    ],
    "What point did you dramatise, how did you show it, and how did people react?",
  ),
  day(
    "Throw down a friendly challenge",
    "What truly motivates people is not money alone but the work itself and the chance to prove their worth. The desire to excel, to win at something, to feel capable, is a powerful spur. A challenge offered in good spirit gets more than an order ever does.",
    `${HW} (Part 3, Principle 12: throw down a challenge)`,
    [
      "Find something that is going slowly: a task at home, a team goal, your own habit.",
      "Turn it into a game with a visible score: a number on a board, a time to beat, a streak.",
      "Offer it as a challenge, not a demand: “Think we can beat yesterday?”",
      "Celebrate the result, whoever wins.",
    ],
    "What challenge did you set, and what did it do to people's energy — or your own?",
  ),

  // ---------------------------------------------------------------- Lead & Negotiate
  day(
    "Start with praise",
    "It is always easier to hear unpleasant things after hearing some praise of your good points. Beginning with honest appreciation works like the dentist's anaesthetic: the drilling still happens, but the pain is dulled. The praise must be true, or it will be heard as a trick.",
    `${HW} (Part 4, Principle 1: begin with praise and honest appreciation)`,
    [
      "Think of someone whose work or behaviour you need to correct.",
      "Write down two things they genuinely do well.",
      "Open the conversation with those, specifically.",
      "Then raise the one thing you would like changed.",
    ],
    "What did you praise first, and how did the person take the correction that followed?",
  ),
  day(
    "Swap 'but' for 'and'",
    "Many people begin criticism with sincere praise, then say 'but' — and the listener immediately doubts the praise. Changing that one word to 'and', and pointing to the mistake indirectly, lets the person correct it without feeling attacked. Indirect works wonders with people who resent direct criticism.",
    `${HW} (Part 4, Principle 2: call attention to people's mistakes indirectly)`,
    [
      "Catch yourself today whenever you say praise followed by “but”.",
      "Replace it with “and”: “You did a great job on this, and if the last section is as clear as the first, it will be excellent.”",
      "Or correct by example: quietly do the thing the right way where they can see it.",
      "Notice how the person reacts compared with a direct correction.",
    ],
    "What 'but' did you turn into an 'and', and what was the reaction?",
  ),
  day(
    "Mention your own mistakes first",
    "It is far easier to listen to a list of your faults if the person criticising begins by humbly admitting that they, too, are far from perfect. Talking about your own errors first lowers the other person's guard and makes the conversation one between equals.",
    `${HW} (Part 4, Principle 3: talk about your own mistakes before criticising the other person)`,
    [
      "Before giving any feedback today, recall a time you made the same or a similar mistake.",
      "Start with it: “I did exactly this when I started, and it took me a while to learn…”",
      "Then make your suggestion.",
      "Keep your own story short and true.",
    ],
    "Which mistake of your own did you share, and how did it change the conversation?",
  ),
  day(
    "Ask instead of ordering",
    "Nobody likes to take orders. Asking questions such as “You might consider this” or “Do you think that would work?” lets people correct their own errors, protects their pride and makes them want to cooperate. People are more likely to carry out a decision they helped to make.",
    `${HW} (Part 4, Principle 4: ask questions instead of giving direct orders)`,
    [
      "Count how many direct orders you give today, at work and at home.",
      "Turn each one into a question: “Could we…?”, “What do you think about…?”, “Is there a way to…?”",
      "Wait for the answer and take it seriously.",
      "Note which requests went more smoothly as questions.",
    ],
    "Which order did you turn into a question, and what did the other person come back with?",
  ),
  day(
    "Let them save face",
    "Even when we are right and the other person is plainly wrong, we only destroy their ego by making them lose face. A few considerate words and a real understanding of their position do far more than a public victory. What matters is not what you think of someone, but what they think of themselves.",
    `${HW} (Part 4, Principle 5: let the other person save face)`,
    [
      "Notice a moment today when someone is wrong in front of others.",
      "Do not correct them publicly. Give them an exit: “That's easy to mix up” or “I may not have explained it well.”",
      "If it needs correcting, do it privately afterwards.",
      "Never make someone admit fault in front of an audience.",
    ],
    "Whose dignity did you protect today, and what did you say to give them a way out?",
  ),
  day(
    "Praise every small improvement",
    "Praise is like sunlight to the human spirit: we cannot grow without it, yet most of us are quick with the cold wind of criticism and slow with warmth. Abilities wither under blame and blossom under encouragement. Be specific, so the praise is believed.",
    `${HW} (Part 4, Principle 6: praise the slightest improvement and praise every improvement)`,
    [
      "Choose one person who is learning or struggling with something.",
      "Watch for any improvement, however slight.",
      "Tell them exactly what was better: not “good job”, but “you explained that more clearly than last time.”",
      "Do it three times today, with three different people if you can.",
    ],
    "What small improvement did you praise, and how specific were you?",
  ),
  day(
    "Give them a reputation to live up to",
    "If you want someone to improve in a certain respect, act as though that trait were already one of their strengths. Give them a fine reputation to live up to, and they will make great efforts not to disappoint you. People rise to what is expected of them.",
    `${HW} (Part 4, Principle 7: give the other person a fine reputation to live up to)`,
    [
      "Think of someone whose reliability, care or attitude has slipped.",
      "Recall a time when they showed exactly the quality you want.",
      "Tell them: “I've always thought of you as someone who [quality], which is why I wanted to give you this.”",
      "Then trust them with it.",
    ],
    "What reputation did you give someone, and what did they do with it?",
  ),
  day(
    "Make the fault seem easy to fix",
    "Tell someone they are stupid at something and have no gift for it, and you have destroyed almost every reason for them to try. Be liberal with encouragement, make the thing seem easy to do, and show your faith in their ability — they will practise until the dawn comes in the window.",
    `${HW} (Part 4, Principle 8: use encouragement; make the fault seem easy to correct)`,
    [
      "Pick a mistake someone keeps making — or one of your own.",
      "Break the fix into one small, obvious step.",
      "Say: “This is an easy one to fix. You already have the hard part. Just try [small step].”",
      "Follow up tomorrow and notice the effort.",
    ],
    "What fault did you make feel fixable, and what small step did you suggest?",
  ),
  day(
    "Make them glad to do it",
    "A good leader makes the other person happy about doing the thing suggested. Be sincere, know exactly what you want, think about what the person really wants, and match the two when you ask. Giving people a role or a title they are proud of often does more than a reward.",
    `${HW} (Part 4, Principle 9: make the other person happy about doing the thing you suggest)`,
    [
      "Choose a task you need someone else to do.",
      "Write down what they would gain from doing it: skill, recognition, trust, a say in how it is done.",
      "Make the request around that benefit, and give them ownership: “Would you take charge of this?”",
      "Thank them for the result afterwards in front of others.",
    ],
    "What task did you hand over, and how did you make the other person glad to take it?",
  ),
  day(
    "Mirror their last three words",
    "People fear what is different and are drawn to what is similar. Repeating the last one to three words someone has said — calmly, as a question — makes them feel heard and prompts them to explain further, without you having to argue or agree. It is the simplest way to keep someone talking and learn what they really want.",
    `${NS} (mirroring)`,
    [
      "In three conversations today, repeat the last one to three words the other person said, with a gentle upward tone.",
      "Example: “…it's just been a difficult month.” — “A difficult month?”",
      "Then stay silent for at least four seconds. Let them fill the gap.",
      "Use a calm, slow voice. Do not overdo it; once or twice per conversation is enough.",
    ],
    "What did you mirror, and what extra information came out after the silence?",
  ),
  day(
    "Label the emotion",
    "Naming what the other person is feeling takes the heat out of it. A label starts with “It seems like…”, “It sounds like…” or “It looks like…”, never with “I”. When someone feels understood, they stop defending and start talking — and that is where agreement becomes possible.",
    `${NS} (labeling and tactical empathy)`,
    [
      "Listen today for someone who is frustrated, worried or hesitant.",
      "Name it without judging: “It sounds like you're worried this will fall on you” or “It seems like this has been frustrating.”",
      "Pause after the label and let them respond. Do not explain it or soften it.",
      "If you got it wrong, they will correct you — that helps too.",
      "Before a hard request, label their likely objections first: “You're probably thinking I'm asking for too much.”",
    ],
    "Which emotion did you label, and how did the person respond once it was named?",
  ),
  day(
    "Ask 'how' and 'what' questions",
    "Open questions that start with “how” or “what” give the other side the feeling of being in control while steering them to solve your problem. “How am I supposed to do that?” is a way of saying no without saying it, and it invites them to offer a better option. Avoid “why”, which sounds like an accusation.",
    `${NS} (calibrated questions)`,
    [
      "Pick one negotiation, however small: a price, a deadline, a chore, a favour.",
      "Prepare three questions: “What is the biggest challenge you face here?”, “How can we solve this together?”, “How am I supposed to do that?”",
      "Ask them calmly and wait for the answer.",
      "Do not use “why” or any question that can be answered with yes or no.",
      "Look back over 33 days and choose the three principles you will keep using every day.",
    ],
    "What did you negotiate, which question worked best, and which three principles are you keeping?",
  ),
];
