import { lesson, type DayTask } from "./types";

/**
 * AI Animation Videos & Instagram Growth — a self-paced workshop.
 * One lesson per explainer video (see docs/explainer-video-prompts.md).
 * Module 1: Set up your studio (1–3) · Module 2: Make videos (4–7) ·
 * Module 3: Grow on Instagram (8).
 *
 * App screens change often; setup lessons say when they were written, and the
 * admin can update any text without a deploy.
 */
const AS_OF =
  "Screens described as of November 2026 — if something has moved, the video for this lesson shows where.";

const STUDIO_RULES = `# Studio rules (Claude reads this file every time)

## Tools
- Animated videos: the studio-hyperframes (HTML + GSAP) or studio-remotion (React) project — pick whichever suits the style.
- Captions and word timings: npx hyperframes transcribe, or openai-whisper.
- Free backup voice: kokoro-onnx (only if I ask, or ElevenLabs isn't set up).

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

const SETUP_PROMPT = `Set up this folder as my AI video studio. Work out which operating system I'm on and use its normal installer (winget on Windows, Homebrew on Mac, apt on Linux). Ask before anything that needs admin rights.

1. Check for these and install any that are missing:
   - FFmpeg (full build)
   - Node.js (LTS) with npm
   - Python 3.12 with pip

2. Install the video frameworks globally with npm:
   - HyperFrames CLI ("hyperframes"): HTML + GSAP scenes rendered to MP4, with check, snapshot and transcribe commands
   - Remotion CLI ("@remotion/cli"): React-based video rendering

3. Install these Python packages with pip:
   - openai-whisper (with torch): free local captions and word timings
   - kokoro-onnx and onnxruntime: free local text-to-speech, as a backup to ElevenLabs
   - soundfile and numpy: audio processing helpers
   - requests: for calling the ElevenLabs voiceover API

4. Create two starter projects for animated vertical videos (1080x1920, 30 fps):
   - "studio-hyperframes": a HyperFrames project (npx hyperframes init), with the CLI version pinned in package.json
   - "studio-remotion": a Remotion project with a 1080x1920, 30 fps composition

5. Render a 5-second test video that says "Studio ready" from each project:
   - exports/test-hyperframes.mp4
   - exports/test-remotion.mp4
   Then run "npx hyperframes transcribe" on one of them to confirm captions work.

6. Finish with a short list of what was installed, what was already there, and anything that failed with the fix.`;

export const aiAnimationInstagram: DayTask[] = [
  // ---------------------------------------------------------------- Module 1: Set up your studio
  lesson(
    "Get Claude Pro, the desktop app — and chat vs Code",
    "Everything in this workshop runs on Claude Code — the part of Claude that can work with files and run programs on your computer. It comes with a paid Claude plan; Pro is the cheapest one that includes it, and it's the only thing you must pay for to follow along. Claude chat is for thinking and writing (ideas, hooks, captions). Claude Code is for doing: it opens a folder, installs tools, runs programs and creates files. A video is a file, so the videos are made in Code.",
    [
      "Go to claude.ai and sign up, or log in if you already have an account.",
      "Upgrade to Claude Pro using the link below. Check the price for your country before you pay — it is billed by Anthropic, not by us.",
      "Download the Claude desktop app for Windows or Mac (link below), install it and log in with the same account.",
      "On Linux there is no desktop app yet: install Claude Code in the terminal with the command below, then run claude inside your studio folder. Every other lesson works the same.",
      "Open the app. Use chat for brainstorming, hooks, captions and planning. Use Code for anything that should end up as a file — videos, voiceovers, images, folders.",
      "Code asks permission before it runs commands on your computer. Read what it wants to do, then allow it.",
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
      {
        kind: "note",
        label: "Rule of thumb",
        content:
          "If the answer should be a file on your computer, use Code. Both use the same Pro plan; long video renders run on your own computer, so they don't use up Claude messages while they render.",
      },
    ],
  ),
  lesson(
    "Set up your studio folder and install everything with one prompt",
    "You don't need to know any video software. You make one folder, open it in Claude Code on your own computer (not the cloud — video files are big and your footage stays private), and paste one prompt. Claude installs the free tools that make video possible and checks they work.",
    [
      "Choose where your studio lives — Documents, Desktop, another drive, anywhere you like. Tip: avoid folders synced by OneDrive, iCloud or Dropbox if you can; big video files sync slowly.",
      "Make a folder called Animation Studio there, with three folders inside: raw, references and exports. Create them by hand, or open a terminal in the place you chose and paste the command for your system below.",
      "In the Claude desktop app, open Code, choose to work locally on your computer (not in the cloud) and select your Animation Studio folder.",
      "Ask Claude: “What folders do you see here?” It should list raw, references and exports.",
      "Paste the setup prompt below. Allow each install when Claude asks — some ask for your computer password, which is normal. It can take 10–20 minutes.",
      "When it finishes, open exports and play test-hyperframes.mp4 and test-remotion.mp4. If you see “Studio ready”, it worked.",
      "Paste the second prompt to save your studio rules. Claude reads that file every time you work in this folder.",
      "If anything fails, copy the error into Claude and ask it to fix it. That works most of the time.",
      AS_OF,
    ],
    [
      {
        kind: "command",
        label: "Create the folders here (Windows PowerShell)",
        os: "windows",
        content:
          'mkdir "Animation Studio\\raw", "Animation Studio\\references", "Animation Studio\\exports"',
      },
      {
        kind: "command",
        label: "Create the folders here (Mac Terminal)",
        os: "mac",
        content: 'mkdir -p "Animation Studio/"{raw,references,exports}',
      },
      {
        kind: "command",
        label: "Create the folders here (Linux terminal)",
        os: "linux",
        content: 'mkdir -p "Animation Studio/"{raw,references,exports}',
      },
      {
        kind: "note",
        label: "Opening a terminal in the right place",
        content:
          "Windows: open the folder in File Explorer, right-click an empty space and choose “Open in Terminal”. Mac: right-click the folder in Finder → Services → “New Terminal at Folder”. Linux: right-click in the folder → “Open in Terminal”. Or type cd followed by the folder's path.",
      },
      {
        kind: "note",
        label: "What each folder is for",
        content:
          "raw = your own footage (you talking, screen recordings). references = videos whose style you like, for study only. exports = finished videos.",
      },
      { kind: "prompt", label: "Setup prompt — install everything", content: SETUP_PROMPT },
      {
        kind: "prompt",
        label: "Save your studio rules",
        content: `Create a file called CLAUDE.md in this folder with exactly this content, then confirm:\n\n${STUDIO_RULES}`,
      },
      {
        kind: "note",
        label: "Licences",
        content:
          "FFmpeg, Node.js, Python, Whisper and Kokoro are free. Remotion is free for individuals and small teams — check remotion.dev/license if you work for a company. Check each tool's licence before commercial use.",
      },
    ],
  ),
  lesson(
    "Connect ElevenLabs for voiceovers",
    "Great voiceovers make AI videos feel finished. ElevenLabs has a free plan, but the voices are more limited and the free plan has usage limits and may not allow commercial use — check their current terms. For better sound, the Starter plan costs about US$5 a month (paid to ElevenLabs). If you'd rather not pay, your studio already has a free backup voice (Kokoro), with lower quality.",
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
    "References and your first animated video",
    "Good creators steal like artists: they collect what they admire, study why it works, and mix it into something of their own. Your references folder is that collection — you never reuse the clips, you learn their style. Then you make your first video: one idea, a strong hook, 20–30 seconds. Claude writes the script, builds the animation and renders the file. You direct.",
    [
      "Find 3–5 short videos whose animation style you love. Save them into references (only where the app allows it, or screen-record them for private study). Never post them, or a copy of them, as your own.",
      "Paste the style-guide prompt. Claude pulls frames from each reference and writes style notes you'll reuse for every video.",
      "Pick one idea you could explain in 30 seconds — for example three lessons from a book or one surprising fact.",
      "Paste the first-video prompt and replace the part in brackets with your idea.",
      "Read the script Claude shows you. Change anything that doesn't sound like you, then say “go ahead and render”.",
      "Watch it on your phone. Ask for changes in plain words: “make scene 2 faster”, “bigger text”, “the hook needs to hit harder”. Three or four small rounds is normal.",
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
Then build it in studio-hyperframes (or studio-remotion if that suits the style better) and render to exports/ following CLAUDE.md.`,
      },
    ],
    "Steal Like an Artist — Austin Kleon",
  ),
  lesson(
    "Edit your own footage (UGC)",
    "If you film yourself, Claude can do the boring parts of editing: cut the pauses and mistakes, pick the best takes, move your strongest line to the start, add captions and punch-in zooms. You don't open an editor.",
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

- Transcribe them (npx hyperframes transcribe or whisper), then remove silences, "um"s and repeated takes. Keep the clearest version of each point.
- Start with the strongest sentence as the hook, even if it was said later.
- Add burned-in captions, 2–4 words at a time, with the current word highlighted.
- Add a subtle zoom-in every 4–6 seconds to keep it moving.
- Even out the audio volume.
Render to exports/ following CLAUDE.md and tell me the length.`,
      },
    ],
  ),
  lesson(
    "Voiceover, free sound and the export checklist",
    "Sound is half of a video. ElevenLabs gives you a natural voice; free music and sound effects do the rest. Your studio rules keep ElevenLabs for the voice only, so you don't spend credits on sounds you can get for free. Then a 30-second checklist catches the mistakes that cost you views.",
    [
      "Paste the voiceover prompt and pick one of the voices Claude suggests.",
      "Listen to the voiceover on its own before it goes into the video. Ask for a slower pace or a different voice if needed.",
      "Paste the music prompt to add quiet background music and a few sound effects from free sources.",
      "Check credits.md — every music and sound file should be listed with its source and licence.",
      "No ElevenLabs plan? Ask Claude to use the free Kokoro voice instead. It works, but sounds less natural.",
      "Before posting anything, run the export checklist below.",
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
      {
        kind: "note",
        label: "Export checklist",
        content:
          "1080x1920 · 30 fps · MP4 · captions on · hook in the first 2 seconds · no text in the top 250 px or bottom 420 px · sound checked on a phone · credits.md updated · a clear cover frame.",
      },
    ],
  ),
  lesson(
    "Invent new styles",
    "Audiences get bored of a look surprisingly fast — what stopped the scroll last month is wallpaper today. When you start seeing a style everywhere, it's about to stop working. The fix is to keep inventing: combine two styles that don't usually meet, add one unexpected twist, and test small before you commit.",
    [
      "Paste the style prompt. Claude invents five new styles from your references.",
      "Pick the two you like and let Claude make a 10-second test of each.",
      "Use the winner for your next three videos, then invent again.",
    ],
    [
      {
        kind: "prompt",
        label: "Invent five new styles",
        content: `Read references/style-notes.md. Invent 5 new animation styles that each combine two different references with one unexpected element (for example paper-cut + neon, chalkboard + 3D type, newspaper collage + glitch).

For each style give: a name, colours (hex), fonts, how things move, and why it would stop someone scrolling.
Then make a 10-second test video of the two strongest styles in exports/style-tests/.`,
      },
    ],
    "Steal Like an Artist — Austin Kleon",
  ),

  // ---------------------------------------------------------------- Module 3: Grow on Instagram
  lesson(
    "Grow on Instagram: trends, 3 a day and your weekly routine",
    "You can make videos now — this is how they grow an account. Spot what's working in your niche, post three a day as a system rather than a scramble, and review your numbers once a week. Results take weeks, not days, and they vary from account to account, but a steady routine is what moves the numbers.",
    [
      "Spot trends: spend 15 minutes a day in Reels and Explore for your niche. Save every reel that stops your thumb and note why — the hook, the style, the length, the audio. Turn your notes into ideas with the trends prompt.",
      "Watch for fatigue: when you see the same style everywhere, it's about to stop working. That's your signal to invent a new one.",
      "Post 3 videos a day at 9 am, 2 pm and 8 pm, in your main audience's timezone. This is the schedule that grew @mindfrombooks — test it and adjust for your audience.",
      "Make videos in batches (6–9 in one sitting) and schedule them with Instagram's built-in scheduling or Meta Business Suite, so posting never depends on remembering.",
      "Every post: a hook in the first 2 seconds, captions on, one idea, a clear cover. Caption: the first line repeats the hook, then 1–3 short lines and 3–5 relevant hashtags.",
      "Reply to comments in the first hour after posting — it shows people the account is alive.",
      "Once a week, check each reel's views, watch time, shares, saves and follows. Shares and saves matter most. Paste the numbers into the weekly review prompt and test one change the next week.",
      "Your week: Sunday — trend notes and plan 21 posts. Two sittings — make and schedule. Every day — reply to comments. Saturday — weekly review and one new style.",
      "Stuck on a step, or something on your computer won't work? Send a message to @mindfrombooks on Instagram.",
    ],
    [
      {
        kind: "prompt",
        label: "Turn trends into ideas",
        content: `Here are notes on reels that stopped me today in my niche ([YOUR NICHE]):
[PASTE NOTES]

Find the patterns: hooks, formats, lengths and styles that repeat. Then give me 10 video ideas that use those patterns in my own way, each with a 1-line hook. Mark the 3 you think are strongest and why.`,
      },
      {
        kind: "prompt",
        label: "Plan a week of posts",
        content: `Plan 21 Instagram Reels for next week (3 a day, at 9 am, 2 pm and 8 pm) for my niche: [YOUR NICHE].
For each: the hook (on-screen, under 8 words), the idea in one sentence, which style from references/style-notes.md to use, and a caption with 3–5 hashtags.
Mix formats so no two posts in a row look the same. Put it in a table I can copy.`,
      },
      {
        kind: "prompt",
        label: "Weekly review",
        content: `Here are my Reels stats for the last 7 days:
[PASTE: title, views, average watch time, shares, saves, follows]

1. Which 3 did best and what do they have in common?
2. Which 3 did worst and why might that be?
3. Give me ONE change to test on every post next week, and 5 ideas that use what worked.`,
      },
      {
        kind: "link",
        label: "Message @mindfrombooks on Instagram",
        content: "https://www.instagram.com/mindfrombooks/",
      },
    ],
    "Contagious — Jonah Berger · Show Your Work! — Austin Kleon",
  ),
];
