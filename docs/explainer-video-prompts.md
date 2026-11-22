# Explainer video prompts — AI Animation & Instagram Growth workshop

Eight prompts to paste into **Claude Code**, in your Animation Studio folder, to make the
workshop's explainer videos — the same way the course teaches.

**Before you start**

- Each prompt makes one **16:9, 1920×1080** video (it plays inside the lesson page), **light
  background**, **1–4 minutes**, with an ElevenLabs voiceover and burned-in captions.
- Where a scene says **SCREEN**, record that part of your own screen first (Windows: Win+Alt+R or
  OBS · Mac: Cmd+Shift+5 · Linux: OBS) and save it in `raw/` with the file name given. If a
  recording is missing, Claude draws a simple, clean mock-up instead — it must not invent
  buttons or menu names you didn't describe.
- The voiceover scripts are written out in full. Edit any line that doesn't sound like you before
  you send the prompt.
- When a video is ready, upload it to YouTube as **Unlisted**, then paste its link into the lesson
  in **Admin → Courses → AI Animation Videos & Instagram Growth → Lessons**.

| #   | Video                                       | Lesson | Length   |
| --- | ------------------------------------------- | ------ | -------- |
| 1   | Welcome, Claude Pro, chat vs Code           | 1      | ~3 min   |
| 2   | Studio folder, local mode, one-prompt setup | 2      | ~3 min   |
| 3   | ElevenLabs key on Windows, Mac and Linux    | 3      | ~2.5 min |
| 4   | References and your first animation         | 4      | ~3.5 min |
| 5   | Editing your own footage                    | 5      | ~2 min   |
| 6   | Voiceover, free sound, export checklist     | 6      | ~3 min   |
| 7   | Inventing new styles                        | 7      | ~2 min   |
| 8   | Growing on Instagram                        | 8      | ~4 min   |

One video per lesson: video 1 goes on Lesson 1, video 2 on Lesson 2, and so on.

---

## 1 · Welcome, Claude Pro and chat vs Code (~3 min)

```text
Make an explainer video for my course. Follow CLAUDE.md, but this video is HORIZONTAL 1920x1080, 30 fps, not vertical.

STYLE
- Light, calm background #FBF7F0 (warm off-white). Text colour #172033 (deep ink). Accent #A8336A (magenta) for highlights, #C8892B (amber) sparingly.
- Headings in a serif like Fraunces or Playfair Display; body text in Inter or a clean sans-serif. Large, readable text.
- Gentle motion only: fades, slides, soft zooms. Numbered steps appear one at a time, in sync with the voiceover.
- Burned-in captions at the bottom, 2 lines max, ink text on a light panel.
- Opening title card (2 s): "AI Animation & Instagram Growth" + the video title. Closing card (3 s): "Next: <next video title>".

AUDIO
- Voiceover with ElevenLabs only (key in ELEVENLABS_API_KEY, never print it). Calm, friendly, clear voice; normal speaking pace. Tell me the character count before generating and suggest 3 voices.
- Quiet, upbeat background music from a free royalty-free source, well under the voice. Log it in credits.md.

SCREEN RECORDINGS (use if present in raw/, otherwise draw a simple clean mock-up — don't invent menu names):
- raw/01-upgrade.mp4 — claude.ai upgrade page
- raw/01-download.mp4 — downloading and opening the desktop app
- raw/01-chat-vs-code.mp4 — switching between chat and Code in the app

SCENES AND VOICEOVER
1. Title card. VO: "Welcome. In the next three minutes you'll get the one tool this whole workshop runs on."
2. Big text "35K followers. Zero video editor." VO: "Every video on @mindfrombooks was made by describing it to Claude. No editing software. You're going to set up the same thing."
3. Text "What you need: Claude Pro". VO: "Claude Code — the part of Claude that can work with files on your computer — comes with a paid Claude plan. Pro is the cheapest one that includes it. It's billed by Anthropic, so check the price for your country."
4. SCREEN raw/01-upgrade.mp4. VO: "Go to claude.ai, log in, and upgrade to Pro. The link is under this video."
5. SCREEN raw/01-download.mp4. VO: "Then download the Claude desktop app for Windows or Mac, install it and log in with the same account. On Linux, there's a one-line install for Claude Code in the lesson."
6. Split screen: left "Chat — thinking & writing", right "Code — doing & making files". VO: "Inside the app there are two ways to work. Chat is for thinking and writing: ideas, hooks, captions. Code is for doing: it opens a folder on your computer, installs tools, runs programs and creates files."
7. Big rule card: "If the answer should be a file → use Code." VO: "Here's the rule: if the answer should be a file on your computer, use Code. A video is a file, so our videos are made in Code."
8. SCREEN raw/01-chat-vs-code.mp4 with a small note "Code asks before it runs anything". VO: "Code asks your permission before it runs commands. Read what it wants to do, then allow it."
9. Closing card "Next: Set up your studio". VO: "That's it for setup step one. Next, we build your studio folder."

Show me the scene plan with timings first and wait for my OK. Then render to exports/explainers/01-welcome-claude.mp4 and tell me the length.
```

---

## 2 · Studio folder, local mode and one-prompt setup (~3 min)

```text
Make an explainer video for my course. Follow CLAUDE.md, but this video is HORIZONTAL 1920x1080, 30 fps.

STYLE: light background #FBF7F0, ink text #172033, accent #A8336A, amber #C8892B sparingly. Serif headings (Fraunces/Playfair), Inter body. Gentle fades and slides; numbered steps appear in sync with the voice. Burned-in captions, 2 lines max. Title card (2 s) "AI Animation & Instagram Growth" + video title; closing card (3 s) "Next: <next video>".

AUDIO: ElevenLabs voiceover only (key from ELEVENLABS_API_KEY, never print it; tell me the character count first; same voice as video 1). Quiet free royalty-free music under the voice, logged in credits.md.

SCREEN RECORDINGS (use if present in raw/, otherwise a clean mock-up, no invented menu names):
- raw/02-folders.mp4 — creating the Animation Studio folder with raw, references, exports
- raw/02-local.mp4 — choosing local mode in Code and picking the folder
- raw/02-setup-prompt.mp4 — pasting the setup prompt and Claude installing tools
- raw/02-test-video.mp4 — opening exports/test.mp4

SCENES AND VOICEOVER
1. Title card. VO: "Now let's build your studio. You'll do this once."
2. Animated folder diagram: "Animation Studio" with three folders appearing: raw, references, exports. VO: "Make a folder called Animation Studio in Documents, with three folders inside. Raw is your own footage. References are videos whose style you like — for studying only, never reposting. Exports is where finished videos land."
3. SCREEN raw/02-folders.mp4. VO: "You can make them by hand, or paste the one-line command for your computer from the lesson."
4. Text "Local, not cloud" with a laptop icon vs a cloud icon. VO: "In Claude Code, choose to work locally on your computer, not in the cloud. Video files are big, and you want the finished files on your own machine."
5. SCREEN raw/02-local.mp4. VO: "Pick your Animation Studio folder. To check, ask Claude what folders it sees — it should list all three."
6. Text "One prompt installs everything" with icons: ffmpeg, Node.js, Remotion, Python. VO: "Now the magic part. You don't learn any video software. You paste one prompt, and Claude installs the free tools that make video possible."
7. SCREEN raw/02-setup-prompt.mp4. VO: "It will ask permission before installing things, and sometimes your computer password. That's normal — read it, then allow it."
8. SCREEN raw/02-test-video.mp4. VO: "When it's done, open exports and play test dot M P 4. If you see 'Studio ready', it worked."
9. Card "CLAUDE.md = your studio rules" with 3 bullets: vertical 1080x1920 · ElevenLabs for voice only · never reuse references. VO: "Last, paste the second prompt. It saves your studio rules in a file Claude reads every time — so every video follows them without you repeating yourself."
10. Tip card: "Something failed? Paste the error back into Claude." VO: "If anything fails, copy the error into Claude and ask it to fix it. That works most of the time."
11. Closing card "Next: Connect ElevenLabs".

Show me the scene plan with timings first and wait for my OK. Then render to exports/explainers/02-studio-setup.mp4.
```

---

## 3 · ElevenLabs key on Windows, Mac and Linux (~2.5 min)

```text
Make an explainer video for my course. Follow CLAUDE.md, but this video is HORIZONTAL 1920x1080, 30 fps.

STYLE: light background #FBF7F0, ink #172033, accent #A8336A, amber #C8892B sparingly. Serif headings, Inter body, gentle motion, burned-in captions. Show commands in a dark rounded code panel (#172033 background, light monospace text) so they're easy to read. Blur or replace any real API key with "paste-your-key-here" — never show a real key. Title and closing cards as in the other videos.

AUDIO: ElevenLabs voiceover only (key from ELEVENLABS_API_KEY, never print it; character count first; same voice). Quiet free music logged in credits.md.

SCREEN RECORDINGS (use if present in raw/, otherwise clean mock-ups; KEY MUST BE BLURRED):
- raw/03-elevenlabs-key.mp4 — creating an API key on elevenlabs.io
- raw/03-windows.mp4 — running the PowerShell command
- raw/03-mac.mp4 — running the Terminal commands
- raw/03-check.mp4 — the "check the key" prompt answering yes

SCENES AND VOICEOVER
1. Title card. VO: "Let's give your videos a real voice."
2. Two cards side by side: "Free plan — works, lower quality, limits" / "Starter — about $5 a month, far more natural". Small note: "Check ElevenLabs' current terms for commercial use." VO: "ElevenLabs has a free plan. It works, but it sounds less natural and has limits — check their terms if you earn from your account. For much better voices, the Starter plan is about five dollars a month."
3. SCREEN raw/03-elevenlabs-key.mp4. VO: "Sign up at elevenlabs dot io, open API keys, create a new key and copy it."
4. Big warning card: "Never paste your key into a chat or prompt." VO: "One rule: never paste this key into a chat or a prompt. It goes into your computer's settings instead."
5. Tabbed panel, Windows tab active, showing: [Environment]::SetEnvironmentVariable('ELEVENLABS_API_KEY', 'paste-your-key-here', 'User') — then SCREEN raw/03-windows.mp4. VO: "On Windows, open PowerShell and paste this line, with your key between the quotes."
6. Mac tab: echo 'export ELEVENLABS_API_KEY="paste-your-key-here"' >> ~/.zshrc and launchctl setenv ELEVENLABS_API_KEY "paste-your-key-here" — then SCREEN raw/03-mac.mp4. VO: "On a Mac, open Terminal and paste these two lines. The second one lets the desktop app see the key — run it again after you restart your Mac."
7. Linux tab: echo 'export ELEVENLABS_API_KEY="paste-your-key-here"' >> ~/.bashrc and source ~/.bashrc. VO: "On Linux, add it to your bash settings with these two lines."
8. Card "Quit Claude completely, then reopen". VO: "Now fully quit Claude — not just the window — and open it again so it picks up the key."
9. SCREEN raw/03-check.mp4. VO: "Paste the check prompt. Claude should simply say yes, without showing the key. If it leaked anywhere, delete it in ElevenLabs and make a new one."
10. Closing card "Next: Your first animation".

Show me the scene plan first and wait for my OK. Render to exports/explainers/03-elevenlabs.mp4.
```

---

## 4 · References and your first animation (~3.5 min)

```text
Make an explainer video for my course. Follow CLAUDE.md, but this video is HORIZONTAL 1920x1080, 30 fps.

STYLE: light background #FBF7F0, ink #172033, accent #A8336A, amber #C8892B sparingly. Serif headings, Inter body, gentle motion, burned-in captions. When showing a finished vertical Reel, place it in a phone frame on the right side of the 16:9 canvas with notes on the left. Title and closing cards as in the other videos.

AUDIO: ElevenLabs voiceover only (character count first; same voice). Quiet free music logged in credits.md.

SCREEN RECORDINGS (use if present in raw/, otherwise clean mock-ups):
- raw/04-references.mp4 — dropping 3–5 reference videos into references/
- raw/04-style-notes.mp4 — the style-notes prompt and the style-notes.md file
- raw/04-first-prompt.mp4 — pasting the first-video prompt, the script Claude proposes, saying "go ahead"
- raw/04-result.mp4 — my finished first video (vertical)
- raw/04-changes.mp4 — asking for changes ("make scene 2 faster")

SCENES AND VOICEOVER
1. Title card. VO: "Time to make your first video."
2. Quote-style card: "Collect what you admire. Learn why it works. Make it your own." VO: "Good creators collect what they admire, study why it works, and mix it into something new. That's what your references folder is for."
3. SCREEN raw/04-references.mp4. VO: "Save three to five short videos whose style you love into references. Study them — never repost them."
4. SCREEN raw/04-style-notes.mp4 with callouts: colours · motion · pacing · hook. VO: "Paste the style-guide prompt. Claude pulls frames from each video and writes down the colours, the motion, the pacing and the hook. You'll reuse this file for every video."
5. Card "One idea. Strong hook. 20–30 seconds." VO: "Your first video should be simple: one idea, a strong hook, twenty to thirty seconds."
6. SCREEN raw/04-first-prompt.mp4. VO: "Paste the first-video prompt and replace the bracket with your idea. Claude shows you the on-screen text, a voiceover script and the timings before it builds anything. Change what doesn't sound like you, then say go ahead."
7. Phone frame playing raw/04-result.mp4 (with its own audio ducked under the VO). VO: "A few minutes later, it's in exports. Watch it on your phone — that's how your audience will see it."
8. SCREEN raw/04-changes.mp4 with a list appearing: "make scene 2 faster · bigger text · stronger hook". VO: "Then direct. Ask for changes in plain words. Small changes, three or four rounds — that's normal, and it's still faster than opening an editor."
9. Closing card "Next: Edit your own footage".

Show me the scene plan first and wait for my OK. Render to exports/explainers/04-first-animation.mp4.
```

---

## 5 · Editing your own footage (~2 min)

```text
Make an explainer video for my course. Follow CLAUDE.md, but this video is HORIZONTAL 1920x1080, 30 fps.

STYLE: light background #FBF7F0, ink #172033, accent #A8336A, amber #C8892B sparingly. Serif headings, Inter body, gentle motion, burned-in captions. Show before/after as two phone frames side by side. Title and closing cards as in the other videos.

AUDIO: ElevenLabs voiceover only (character count first; same voice). Quiet free music logged in credits.md.

SCREEN RECORDINGS (use if present in raw/, otherwise clean mock-ups):
- raw/05-raw-clip.mp4 — a short unedited clip of me talking (vertical)
- raw/05-prompt.mp4 — pasting the edit prompt
- raw/05-edited.mp4 — the edited result (vertical)

SCENES AND VOICEOVER
1. Title card. VO: "If you film yourself, Claude can do the boring part of editing."
2. Phone frame playing a few seconds of raw/05-raw-clip.mp4, label "Before: pauses, ums, retakes". VO: "Here's a normal phone clip: pauses, 'ums', a couple of retakes."
3. SCREEN raw/05-prompt.mp4. VO: "Put your clips in the raw folder and paste the edit prompt."
4. Checklist animating in: "cuts silences & ums · keeps the best take · hook first · word-by-word captions · punch-in zooms · even volume". VO: "Claude transcribes it, cuts the silences and mistakes, keeps your best take, moves your strongest line to the start, adds word-by-word captions and gentle zooms, and evens out the sound."
5. Side-by-side phones: raw/05-raw-clip.mp4 vs raw/05-edited.mp4, label "After". VO: "Same footage. Very different video."
6. Tip card "Tell Claude the timestamp: 'at 0:12 you cut my sentence'". VO: "If a cut feels wrong, just tell it the timestamp. And ask for a second version with a different hook — then keep the better one."
7. Closing card "Next: Voice, music and sound".

Show me the scene plan first and wait for my OK. Render to exports/explainers/05-ugc-editing.mp4.
```

---

## 6 · Voiceover, free sound and the export checklist (~3 min)

```text
Make an explainer video for my course. Follow CLAUDE.md, but this video is HORIZONTAL 1920x1080, 30 fps.

STYLE: light background #FBF7F0, ink #172033, accent #A8336A, amber #C8892B sparingly. Serif headings, Inter body, gentle motion, burned-in captions. Show an animated audio waveform when talking about voice. Title and closing cards as in the other videos.

AUDIO: ElevenLabs voiceover only (character count first; same voice). Quiet free music logged in credits.md. In scene 5, briefly play a 3-second sample of each kind of sound.

SCREEN RECORDINGS (use if present in raw/, otherwise clean mock-ups):
- raw/06-voice-prompt.mp4 — the voiceover prompt and choosing a voice
- raw/06-music-prompt.mp4 — the music prompt
- raw/06-credits.mp4 — the credits.md file

SCENES AND VOICEOVER
1. Title card. VO: "Sound is half of a video. Let's get it right."
2. Waveform animation. VO: "First, the voiceover. Paste the voiceover prompt. Claude tells you how many characters it will use, suggests three voices, and waits for you to choose."
3. SCREEN raw/06-voice-prompt.mp4. VO: "Listen to the voice on its own before it goes into the video. Too fast? Ask for slower. Wrong feel? Try another voice."
4. Rule card: "ElevenLabs = voice only. Everything else = free sources." VO: "Your studio rules keep ElevenLabs for the voice only, so you don't spend credits on sounds you can get for free."
5. SCREEN raw/06-music-prompt.mp4 with three labels: "music under the voice · a pop for text · a whoosh for transitions". VO: "The music prompt adds quiet background music and a few sound effects from free, royalty-free libraries — only where something happens on screen."
6. SCREEN raw/06-credits.mp4. VO: "Every track is written into credits dot md with its source and licence. That's your proof if anyone ever asks."
7. Card "No ElevenLabs plan?" VO: "No paid plan? Ask Claude to use a free text-to-speech option instead. It works — it just sounds less natural."
8. Export checklist card, items ticking in one by one: "1080×1920 · 30 fps · MP4 · captions on · hook in 2 seconds · no text in top & bottom edges · checked on a phone · credits updated · clear cover frame". VO: "Before you post anything, run this checklist. It takes thirty seconds and catches the mistakes that cost you views."
9. Closing card "Next: Invent new styles".

Show me the scene plan first and wait for my OK. Render to exports/explainers/06-voice-sound-export.mp4.
```

---

## 7 · Inventing new styles (~2 min)

```text
Make an explainer video for my course. Follow CLAUDE.md, but this video is HORIZONTAL 1920x1080, 30 fps.

STYLE: light background #FBF7F0, ink #172033, accent #A8336A, amber #C8892B sparingly. Serif headings, Inter body, gentle motion, burned-in captions. Show style combinations as "+" equations (Style A + Style B + twist = new style) with small preview swatches. Title and closing cards as in the other videos.

AUDIO: ElevenLabs voiceover only (character count first; same voice). Quiet free music logged in credits.md.

SCREEN RECORDINGS (use if present in raw/, otherwise clean mock-ups):
- raw/07-style-prompt.mp4 — the invent-styles prompt and Claude's 5 styles
- raw/07-style-tests.mp4 — the two 10-second test videos (vertical)

SCENES AND VOICEOVER
1. Title card. VO: "Here's the part that keeps an account growing."
2. Card "What stopped the scroll last month is wallpaper today." VO: "Audiences get bored of a look surprisingly fast. When you start seeing a style everywhere, it's about to stop working."
3. Equations animating in: "paper-cut + neon", "chalkboard + 3D type", "newspaper collage + glitch". VO: "So keep inventing. Combine two styles that don't usually meet, and add one unexpected twist."
4. SCREEN raw/07-style-prompt.mp4. VO: "The style prompt reads your style notes and invents five new looks, each with colours, fonts, motion rules — and why it should stop the scroll."
5. Two phone frames playing raw/07-style-tests.mp4. VO: "Pick the two you like. Claude makes a ten-second test of each, so you see them before you commit."
6. Card "Use the winner for 3 videos → invent again." VO: "Use the winner for your next three videos, then invent again. That rhythm is how you stay ahead of the feed."
7. Closing card "Next: Grow on Instagram".

Show me the scene plan first and wait for my OK. Render to exports/explainers/07-new-styles.mp4.
```

---

## 8 · Growing on Instagram (~4 min)

```text
Make an explainer video for my course. Follow CLAUDE.md, but this video is HORIZONTAL 1920x1080, 30 fps.

STYLE: light background #FBF7F0, ink #172033, accent #A8336A, amber #C8892B sparingly. Serif headings, Inter body, gentle motion, burned-in captions. Use a simple day timeline (morning, afternoon, evening) and a simple weekly calendar graphic. Title and closing cards as in the other videos. The closing card says "Stuck? Message @mindfrombooks on Instagram".

AUDIO: ElevenLabs voiceover only (character count first; same voice). Quiet free music logged in credits.md.

SCREEN RECORDINGS (use if present in raw/, otherwise clean mock-ups; blur any other accounts' names and faces):
- raw/08-trend-notes.mp4 — scrolling Reels and saving ones that stop me
- raw/08-plan-prompt.mp4 — the weekly planning prompt and its table
- raw/08-schedule.mp4 — scheduling posts
- raw/08-insights.mp4 — a reel's insights screen

SCENES AND VOICEOVER
1. Title card. VO: "You can make videos now. Let's make them grow an account."
2. Card "15 minutes a day. Scroll with intent." VO: "Spend fifteen minutes a day in Reels and Explore for your niche — scrolling with intent. Save every reel that stops your thumb, and note why: the hook, the style, the length, the audio."
3. SCREEN raw/08-trend-notes.mp4. VO: "Paste those notes into Claude chat and it turns the patterns into ten video ideas for your own account."
4. Day timeline with three markers: 9 am · 2 pm · 8 pm. VO: "Then post three a day — nine in the morning, two in the afternoon, eight at night, in your audience's timezone. That's the schedule that grew @mindfrombooks. Test it and adjust for your audience."
5. Card "Batch → schedule → never post in a panic." + SCREEN raw/08-plan-prompt.mp4 and raw/08-schedule.mp4. VO: "Three a day only works as a system. Plan the week with one prompt, make the videos in batches, and schedule them so posting never depends on remembering."
6. Checklist: "hook in 2 seconds · captions on · one idea · clear cover · caption's first line = the hook · 3–5 hashtags · reply to comments in the first hour". VO: "Every post: a hook in the first two seconds, captions on, one idea, a clear cover. Reply to comments in the first hour — it shows the account is alive."
7. SCREEN raw/08-insights.mp4 with highlights on shares and saves. VO: "Once a week, look at views, watch time, shares, saves and follows. Shares and saves matter most — they mean people found it worth passing on. Paste the numbers into Claude and test one change the next week."
8. Weekly calendar: Sunday plan · two batch days · daily replies · Saturday review + new style. VO: "Put it together and you get a routine you can keep. Results take weeks, not days, and every account is different — but a steady routine is what moves the numbers."
9. Closing card "Stuck? Message @mindfrombooks on Instagram". VO: "If you get stuck on any step, message @mindfrombooks on Instagram. Now go make your first week of videos."

Show me the scene plan first and wait for my OK. Render to exports/explainers/08-grow-instagram.mp4.
```
