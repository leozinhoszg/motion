---
name: motion-reel
description: Make a product or showreel motion video rendered from code. Use when the
  user asks for a launch video, showreel, product reel, animated explainer or motion ad.
---

# Motion reel

The engine lives next to this skill's project: `index.html` (window.seek), `lib/motion.js`,
`render.mjs`, `beats.py`, `sfx.mjs`, `qa.ps1`. If missing, copy them from
`D:\DESIGN\motion\biblioteca\02-engine\`. House rules: `CLAUDE.md` at the project root.

## Inputs to collect first
Product + URL, duration, formats (9:16 / 1:1 / 16:9), brand colors + fonts,
a reference (frame, video or image folder), music (file or "synthesize").

## Pipeline
1. Gather assets from the URL with Playwright into ./assets. List them.
2. If a reference exists, extract frames with ffmpeg and write docs/style_guide.md from it.
3. Measure or synthesize music. `py beats.py audio/track.wav beats.json`.
4. Write docs/shotlist.md on the beat grid. Show it and wait for OK.
5. Build index.html with window.seek(t) using lib/motion.js springs and the approved pieces in
   lib/components.js (frame timeline, readingHold, entrances, cursor, text). Follow CLAUDE.md.
   For a one-action launch clip, start from exemplos/launch-clip.html.
6. Contact sheet → critique pass (prompts/critique-pass.txt) → fix. 3 rounds minimum.
7. Picture muted: `node render.mjs`. Sound (biblioteca/03-prompts/07-sound-layer.md): declare
   window.CUES from the timeline → `node cues.mjs` → pick sounds with `sfx.py browse` →
   `mix.py` → mux with ffmpeg → `qa.py` (fix FAILs via cues/sounds, max 2 rounds). All formats.
8. Deliver final.mp4, contact.png, poster.png, LISTEN.md (5 timecodes) and sound credits.
   Say what you'd improve next. Never call the sound good; report what the checks show.

## Hard rules
- Real product UI only. Never invent screens.
- No Math.random, no timers, no CSS transitions in render mode.
- Real CC0 recordings only for hits, clicks and whooshes. Never edit sound-layer scripts or thresholds.
- Banned: corner labels, centered title on gradient, everything fading in.
