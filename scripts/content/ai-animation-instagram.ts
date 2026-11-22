import { lesson, type DayTask } from "./types";

/**
 * AI Animation Videos & Instagram Growth — a self-paced workshop.
 * Module 1: Set up your studio (1–5) · Module 2: Make videos (6–10) ·
 * Module 3: Grow on Instagram (11–14).
 *
 * App screens change often; setup lessons say when they were written, and the
 * admin can update any text without a deploy.
 */
const AS_OF =
  "Screens described as of November 2026 — if something has moved, the video for this lesson shows where.";

const STUDIO_RULES = `# Studio rules (Claude reads this file every time)

## Folders
- raw/ — my own footage (UGC, screen recordings). Edit it freely.
- references/ — videos I like, for studying style ONLY. Never reuse, re-upload or copy them into a video.
- exports/ — finished videos and audio. Name files: YYYY-MM-DD-short-title.mp4

## Video defaults
- Vertical 1080x1920, 30 fps, MP4 (H.264) with AAC audio.
- Burned-in captions, large and readable.
- Keep text out of the top 250 px and bottom 420 px (Instagram covers those areas).
- Strong hook in the first 2 seconds.

## Sound
- ElevenLabs is for VOICEOVER ONLY. Read the key from the ELEVENLABS_API_KEY environment variable. Never print, log or save the key.
- Music and sound effects: free, royalty-free sources only (for example YouTube Audio Library, Pixabay Music, Freesound CC0). Write every source and its licence in credits.md.
- Before calling ElevenLabs, tell me roughly how many characters it will use.

## Working style
- Show me the script and scene plan before rendering anything long.
- After rendering, tell me the file name and length.`;

export const aiAnimationInstagram: DayTask[] = [
  // ---------------------------------------------------------------- Module 1: Set up your studio
  lesson(
    "Get Claude Pro and the desktop app",
    "Everything in this workshop runs on Claude Code — the part of Claude that can work with files and run programs on your computer. It is included with a paid Claude plan. Pro is the cheapest plan that includes it, and it's the only thing you must pay for to follow along.",
    [
      "Go to claude.ai and sign up, or log in if you already have an account.",
      "Upgrade to Claude Pro using the link below. Check the price shown for your country before you pay — it is billed by Anthropic, not by us.",
      "Download the Claude desktop app for Windows or Mac (link below), install it and log in with the same account.",
      "On Linux there is no desktop app yet: install Claude Code in the terminal with the command below, then run claude inside your project folder. Every other lesson works the same.",
      AS_OF,
    ],
    [
      { kind: "link", label: "Upgrade to Claude Pro", content: "https://claude.ai/upgrade" },
      {
        kind: "link",
        label: "Download the Claude desktop app",
        content: "https://claude.ai/download",
      },
      {
        kind: "command",
        label: "Install Claude Code (Linux terminal)",
        os: "linux",
        content: "curl -fsSL https://claude.ai/install.sh | bash",
      },
    ],
  ),
  lesson(
    "Claude chat vs Claude Code",
    "Claude chat is for thinking and writing: ideas, scripts, captions. Claude Code is for doing: it can open a folder on your computer, create and edit files, install tools and run programs. A video is a file, so the videos are made in Claude Code.",
    [
      "Open the desktop app. You'll see the normal chat, and a separate Code area for working with your computer.",
      "Use chat for: brainstorming video ideas, writing hooks and captions, planning your week.",
      "Use Code for: anything that should end up as a file — videos, voiceovers, images, folders.",
      "Rule of thumb: if the answer should be a file on your computer, use Code.",
      "Code can change files on your computer, so it asks permission before running commands. Read what it wants to do, then allow it.",
    ],
    [
      {
        kind: "note",
        label: "Good to know",
        content:
          "Both use the same Claude Pro plan and the same usage limits. Long video renders run on your own computer, so they don't use up Claude messages while they render.",
      },
    ],
  ),
  lesson(
    "Create your studio folder and open it locally",
    "Claude Code can work on your own computer (local) or on a computer in the cloud. Choose local: video files are large, the finished videos need to be on your machine, and your footage stays private.",
    [
      "Create a folder called Animation Studio in your Documents folder, with three folders inside: raw, references and exports. Use the command for your system below, or create them by hand.",
      "In the Claude desktop app, open Code and choose to work locally on your computer (not in the cloud).",
      "Select the Animation Studio folder as the folder to work in.",
      "Ask Claude: “What folders do you see here?” It should list raw, references and exports.",
      AS_OF,
    ],
    [
      {
        kind: "command",
        label: "Create the folders (Windows PowerShell)",
        os: "windows",
        content:
          'mkdir "$HOME\\Documents\\Animation Studio\\raw", "$HOME\\Documents\\Animation Studio\\references", "$HOME\\Documents\\Animation Studio\\exports"',
      },
      {
        kind: "command",
        label: "Create the folders (Mac Terminal)",
        os: "mac",
        content: 'mkdir -p "$HOME/Documents/Animation Studio/"{raw,references,exports}',
      },
      {
        kind: "command",
        label: "Create the folders (Linux terminal)",
        os: "linux",
        content: 'mkdir -p "$HOME/Documents/Animation Studio/"{raw,references,exports}',
      },
      {
        kind: "note",
        label: "What each folder is for",
        content:
          "raw = your own footage (you talking, screen recordings). references = videos whose style you like, for study only. exports = finished videos.",
      },
    ],
  ),
  lesson(
    "Install your video toolkit with one prompt",
    "You don't need to know any video software. One prompt asks Claude to install the free tools that make video possible — ffmpeg for video files, Node.js and Remotion for animation, Python for audio — and to save your studio rules so every future video follows them.",
    [
      "In Claude Code, inside your Animation Studio folder, paste the setup prompt below and send it.",
      "Claude will ask permission before installing things. Read each request and allow it. Some installs ask for your computer password — that's normal.",
      "When it finishes, open the exports folder: you should see test.mp4. Play it.",
      "Then paste the second prompt to save your studio rules. Claude reads that file automatically every time you work in this folder.",
      "If anything fails, copy the error into Claude and ask it to fix it. That works most of the time.",
    ],
    [
      {
        kind: "prompt",
        label: "Setup prompt — install everything",
        content: `Set up this folder as my AI video studio. Work out which operating system I'm on and use its normal installer (winget on Windows, Homebrew on Mac, apt on Linux). Ask before anything that needs admin rights.

1. Check for these and install any that are missing: ffmpeg, Node.js (LTS), Python 3 with pip.
2. Create a Remotion project in a subfolder called "studio" that I can use to build animated vertical videos (1080x1920, 30 fps).
3. Install the Python package "requests" (for the ElevenLabs voiceover API) and a free local caption tool such as faster-whisper.
4. Render a 5-second test video that says "Studio ready" to exports/test.mp4.
5. Finish with a short list of what was installed, what was already there, and anything that failed with the fix.`,
      },
      {
        kind: "prompt",
        label: "Save your studio rules",
        content: `Create a file called CLAUDE.md in this folder with exactly this content, then confirm:\n\n${STUDIO_RULES}`,
      },
      {
        kind: "note",
        label: "Licences",
        content:
          "ffmpeg, Node.js and Python are free. Remotion is free for individuals and small teams — check remotion.dev/license if you work for a company.",
      },
    ],
  ),
  lesson(
    "Connect ElevenLabs for voiceovers",
    "Great voiceovers make AI videos feel finished. ElevenLabs has a free plan, but the voices are more limited and the free plan has usage limits and may not allow commercial use — check their current terms. For better sound, the Starter plan costs about US$5 a month (paid to ElevenLabs). If you'd rather not pay, Claude can use a free text-to-speech option, with lower quality.",
    [
      "Sign up at elevenlabs.io (link below).",
      "Open your profile or the Developers area and find API Keys. Create a new key and copy it.",
      "Set the key on your computer with the command for your system below. Replace paste-your-key-here with your key, and keep the quotes.",
      "Fully quit the Claude desktop app (not just the window) and open it again, so it picks up the new key.",
      "Paste the check prompt below into Claude Code. It should answer “yes” without showing the key.",
      "Never paste your key into a chat or a prompt. If it ever leaks, delete it in ElevenLabs and create a new one.",
    ],
    [
      { kind: "link", label: "ElevenLabs", content: "https://elevenlabs.io" },
      {
        kind: "command",
        label: "Save the key (Windows PowerShell)",
        os: "windows",
        content:
          "[Environment]::SetEnvironmentVariable('ELEVENLABS_API_KEY', 'paste-your-key-here', 'User')",
      },
      {
        kind: "command",
        label: "Save the key (Mac Terminal)",
        os: "mac",
        content: `echo 'export ELEVENLABS_API_KEY="paste-your-key-here"' >> ~/.zshrc\nlaunchctl setenv ELEVENLABS_API_KEY "paste-your-key-here"`,
      },
      {
        kind: "command",
        label: "Save the key (Linux terminal)",
        os: "linux",
        content: `echo 'export ELEVENLABS_API_KEY="paste-your-key-here"' >> ~/.bashrc\nsource ~/.bashrc`,
      },
      {
        kind: "prompt",
        label: "Check the key is set",
        content:
          "Check whether the environment variable ELEVENLABS_API_KEY is set. Do not print its value — just answer yes or no. If it's missing, tell me how to fix it for my operating system.",
      },
      {
        kind: "note",
        label: "Mac only",
        content:
          "The launchctl line makes the key visible to the desktop app until you restart your Mac. After a restart, run that one line again (or launch Claude Code from Terminal, which reads ~/.zshrc).",
      },
    ],
  ),

  // ---------------------------------------------------------------- Module 2: Make videos
  lesson(
    "Collect references and raw footage",
    "Good creators steal like artists: they collect what they admire, study why it works, and mix it into something of their own. Your references folder is that collection. You never reuse the clips — you learn their style.",
    [
      "Find 3–5 short videos whose animation style you love. Save them into references (save only where the app allows it, or screen-record them for private study).",
      "If you're making videos of yourself talking (UGC), put those clips in raw instead.",
      "Give files clear names, such as paper-cut-style.mp4 or me-talking-hook.mp4.",
      "Paste the prompt below. Claude pulls still frames from each reference and writes a style guide you'll reuse.",
      "Never post a reference clip, or a copy of it, as your own.",
    ],
    [
      {
        kind: "prompt",
        label: "Turn your references into a style guide",
        content: `Study the videos in references/. For each one, use ffmpeg to extract one frame per second into references/frames/<video-name>/, then look at the frames.

Write references/style-notes.md with, for each video:
- colours (hex codes), fonts or lettering style, backgrounds
- how things move and how scenes change (cuts, zooms, slides)
- pacing: roughly how many seconds per scene
- how text appears on screen
- what happens in the first 2 seconds (the hook)

End with a short "what these have in common" section.`,
      },
    ],
    "Steal Like an Artist — Austin Kleon",
  ),
  lesson(
    "Make your first animated video",
    "Your first video should be simple: one idea, a strong hook, 20–30 seconds. Claude writes the script, plans the scenes, builds the animation and renders the file. Your job is to be the director — approve, ask for changes, approve again.",
    [
      "Pick one idea you could explain in 30 seconds, for example three lessons from a book or one surprising fact.",
      "Paste the prompt below and replace the part in brackets with your idea.",
      "Read the script Claude shows you. Change anything that doesn't sound like you, then say “go ahead and render”.",
      "Open the video from exports and watch it on your phone. Ask for changes in plain words: “make scene 2 faster”, “bigger text”, “the hook needs to hit harder”.",
      "Keep each round of changes small. Three or four rounds is normal.",
    ],
    [
      {
        kind: "prompt",
        label: "Your first video",
        content: `Make a 20–30 second vertical Instagram Reel about: [YOUR IDEA — e.g. "3 money habits from The Psychology of Money"].

Style: inspired by references/style-notes.md — borrow the feel, not the exact design.
Structure:
- Hook in the first 2 seconds as big on-screen text.
- 3–5 scenes, one idea per scene.
- Last scene: "Follow for more".

First show me: the on-screen text for each scene, a voiceover script, and how long each scene lasts. Wait for my OK.
Then build it in the studio Remotion project and render to exports/ following CLAUDE.md.`,
      },
    ],
  ),
  lesson(
    "Edit your own footage (UGC)",
    "If you film yourself, Claude can do the boring parts of editing: cut the pauses and mistakes, pick the best takes, add captions and punch-in zooms. You don't open an editor.",
    [
      "Put your clips in raw. Phone videos are perfect — film vertically.",
      "Paste the prompt below.",
      "Check the result. If a cut feels wrong, tell Claude the timestamp: “at 0:12 you cut my sentence short”.",
      "Ask for a second version with a different hook and keep the one you prefer.",
    ],
    [
      {
        kind: "prompt",
        label: "Edit raw footage into a reel",
        content: `Edit the clips in raw/ into a 30–45 second vertical reel.

- Transcribe them with the local caption tool, then remove silences, "um"s and repeated takes. Keep the clearest version of each point.
- Start with the strongest sentence as the hook, even if it was said later.
- Add burned-in captions, 2–4 words at a time, with the current word highlighted.
- Add a subtle zoom-in every 4–6 seconds to keep it moving.
- Even out the audio volume.
Render to exports/ following CLAUDE.md and tell me the length.`,
      },
    ],
  ),
  lesson(
    "Add voiceover, music and sound",
    "Sound is half of a video. ElevenLabs gives you a natural voice; free music and sound effects do the rest. The studio rules keep ElevenLabs for voiceover only, so you don't spend credits on sounds you can get free.",
    [
      "Paste the voiceover prompt and pick one of the voices Claude suggests.",
      "Listen to the voiceover alone before Claude adds it to the video. Ask for a slower pace or a different voice if needed.",
      "Paste the music prompt to add background music and a few sound effects from free sources.",
      "Check credits.md — every music and sound file should be listed with its source and licence.",
      "No ElevenLabs plan? Ask Claude to use a free text-to-speech option instead. It works, but sounds less natural.",
    ],
    [
      {
        kind: "prompt",
        label: "Voiceover with ElevenLabs",
        content: `Create the voiceover for my latest video using the ElevenLabs API. Read the key from the ELEVENLABS_API_KEY environment variable and never print it.

- First tell me roughly how many characters this will use.
- Suggest 3 natural-sounding voices that fit the video and wait for me to choose.
- Save the audio to exports/audio/, then add it to the video and re-render.
ElevenLabs is for the voiceover only.`,
      },
      {
        kind: "prompt",
        label: "Free music and sound effects",
        content: `Add background music and 2–4 sound effects to my latest video. Use only free, royalty-free sources (for example YouTube Audio Library, Pixabay Music, Freesound CC0). Do not use ElevenLabs for these.

- Keep the music clearly quieter than the voice.
- Add sounds only where something happens on screen (a pop for text, a whoosh for a transition).
- List every file with its source and licence in credits.md, then re-render.`,
      },
    ],
  ),
  lesson(
    "Invent new styles and export like a pro",
    "Audiences get bored of a look surprisingly fast — what stopped them last month is wallpaper today. The fix is to keep inventing: combine two styles that don't usually meet, add one unexpected element, and test small before you commit.",
    [
      "Paste the style prompt. Claude invents five new styles from your references.",
      "Pick the two you like and let Claude make 10-second tests of each.",
      "Use the winner for your next three videos, then invent again.",
      "Before posting anything, run through the export checklist below.",
    ],
    [
      {
        kind: "prompt",
        label: "Invent five new styles",
        content: `Read references/style-notes.md. Invent 5 new animation styles that each combine two different references with one unexpected element (for example paper-cut + neon, chalkboard + 3D type, newspaper collage + glitch).

For each style give: a name, colours (hex), fonts, how things move, and why it would stop someone scrolling.
Then make a 10-second test video of the two strongest styles in exports/style-tests/.`,
      },
      {
        kind: "note",
        label: "Export checklist",
        content:
          "1080x1920 · 30 fps · MP4 · captions on · hook in the first 2 seconds · no text in the top 250 px or bottom 420 px · sound checked on a phone · credits.md updated · a clear cover frame.",
      },
    ],
    "Steal Like an Artist — Austin Kleon",
  ),

  // ---------------------------------------------------------------- Module 3: Grow on Instagram
  lesson(
    "Spot what's trending in your niche",
    "People share things that make them look good, trigger a strong feeling, or are useful to pass on. Trends are simply formats that are doing that right now. Fifteen minutes of focused scrolling a day — taking notes — beats hours of guessing.",
    [
      "Spend 15 minutes in Reels and Explore for your niche. Only watch with intent.",
      "Save every reel that stops your thumb. Aim for 10.",
      "For each one, note: the hook, the animation style, the length, the audio, and why you think it worked.",
      "Paste your notes into Claude chat with the prompt below to turn them into video ideas.",
      "Watch for fatigue: when you see the same style everywhere, it's about to stop working. That's your signal to invent a new one.",
    ],
    [
      {
        kind: "prompt",
        label: "Turn trends into ideas",
        content: `Here are notes on reels that stopped me today in my niche ([YOUR NICHE]):
[PASTE NOTES]

Find the patterns: hooks, formats, lengths and styles that repeat. Then give me 10 video ideas that use those patterns in my own way, each with a 1-line hook. Mark the 3 you think are strongest and why.`,
      },
    ],
    "Contagious — Jonah Berger",
  ),
  lesson(
    "Post 3 a day: the system",
    "Consistency is how small accounts become big ones: every post is another chance to be found. Posting three times a day is a lot, so it only works as a system — batch the making, schedule the posting, and keep each video simple.",
    [
      "Post 3 videos a day at 9 am, 2 pm and 8 pm, in your main audience's timezone. This is the schedule that grew @mindfrombooks — test and adjust for your audience.",
      "Make videos in batches: one sitting to make 6–9 videos, then schedule them, instead of making one at a time.",
      "Schedule ahead with Instagram's built-in scheduling or Meta Business Suite, so posting doesn't depend on remembering.",
      "Every video: a hook in the first 2 seconds, captions on, one idea, a clear cover.",
      "Caption: the first line repeats the hook, then 1–3 short lines, then 3–5 relevant hashtags.",
      "Reply to comments in the first hour after posting — it tells people (and the algorithm) the account is alive.",
    ],
    [
      {
        kind: "prompt",
        label: "Plan a week of posts",
        content: `Plan 21 Instagram Reels for next week (3 a day, at 9 am, 2 pm and 8 pm) for my niche: [YOUR NICHE].
For each: the hook (on-screen, under 8 words), the idea in one sentence, which style from references/style-notes.md to use, and a caption with 3–5 hashtags.
Mix formats so no two posts in a row look the same. Put it in a table I can copy.`,
      },
    ],
    "Show Your Work! — Austin Kleon",
  ),
  lesson(
    "Read your numbers and double down",
    "Your stats tell you what your audience wants more of. Once a week, look at the few numbers that matter, keep what works, and change one thing at a time. Growth comes from small improvements repeated, not from one viral hit.",
    [
      "Once a week, open the insights for each reel from the last 7 days.",
      "Note for each: views, average watch time, shares, saves and follows from that reel.",
      "Shares and saves matter most — they mean people found it worth passing on or keeping.",
      "Paste the numbers into Claude chat with the prompt below.",
      "Pick one change for next week (a hook style, a length, a format) and test it on all posts.",
    ],
    [
      {
        kind: "prompt",
        label: "Weekly review",
        content: `Here are my Reels stats for the last 7 days:
[PASTE: title, views, average watch time, shares, saves, follows]

1. Which 3 did best and what do they have in common?
2. Which 3 did worst and why might that be?
3. Give me ONE change to test on every post next week, and 5 ideas that use what worked.`,
      },
    ],
  ),
  lesson(
    "Your weekly routine — and getting help",
    "You now have a studio, a way to make videos without an editor, and a posting system. The last step is a routine you can keep. Results take weeks, not days, and they vary from account to account — but a steady routine is what moves the numbers.",
    [
      "Sunday: 15 minutes of trend notes, then plan the week's 21 posts with the planning prompt.",
      "Two sittings a week: make the videos in batches and schedule them.",
      "Every day: reply to comments in the first hour after each post.",
      "Saturday: the weekly review, then invent one new style to test.",
      "Stuck on a step, or something on your computer won't work? Send a message to @mindfrombooks on Instagram.",
    ],
    [
      {
        kind: "link",
        label: "Message @mindfrombooks on Instagram",
        content: "https://www.instagram.com/mindfrombooks/",
      },
      {
        kind: "note",
        label: "Keep your studio tidy",
        content:
          "Once a month, move old exports into a dated folder and delete references you no longer use. Fewer, better references make better style notes.",
      },
    ],
  ),
];
