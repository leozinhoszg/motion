# Motion studio rules

<!-- Curso Movez, seção 02. Copie para a raiz de cada projeto de vídeo; o Claude Code lê este arquivo em toda execução.
     Ajuste a seção Look para a nossa marca (fontes, cor de destaque). -->

## Render contract
- Every film is a pure function of time: `window.seek(t)` paints frame t.
- No CSS transitions, no setTimeout, no requestAnimationFrame in render mode,
  no state carried between frames. Seeded noise only (mulberry32), never Math.random.
- Motion helpers live in `lib/motion.js` (spring, track, indicator, swapAlpha, loopT, rng).
- Render with `node render.mjs`, encode H.264 yuv420p, CRF 16.
- Scenes are written against W/H/U (layout function), never fixed pixels, so 9:16, 1:1 and 16:9
  render from the same timeline (`--w --h`). Reframe type per format, never crop.

## Look
- Banned defaults: centered title on gradient, everything fading in,
  corner labels and frame borders, glow on UI chrome, generic particle bursts.
- One display face, one UI face. One accent color unless the brief says otherwise.
- Every 2 to 4 seconds something new must happen on screen.
- Never use will-change on anything the camera scales (blurry text).

## Timing
- Key events live in a frame table (`Comp.timeline(fps, {...})`): reveal, press, result, hold, cut.
  Timing fixes change the table, not the scene code. Express timing changes in frames.
- Reading window: every text stays fully readable for `Comp.readingHold(text)` (min 1.2 s).
  Derive the cut from the hold; never guess it.
- Result appears within 15 frames of the action that causes it.
- 300-600 ms of stillness before a big reveal. No dead time over 0.5 s outside reading holds.
- 9:16: nothing critical in the bottom 18% or top 11% (platform UI). First frame works as a thumbnail.
- Reuse approved pieces from `lib/components.js` (entrance, drawText/drawLines, cursor/drawCursor)
  before writing new ones. Promote new approved pieces into it.

## Sound (opus-sound-layer — see biblioteca/03-prompts/07-sound-layer.md)
- You can't hear. Use real CC0 recordings from the shared kit (biblioteca/som/kit), pick each one
  yourself with `sfx.py browse` and LOOK at the sheet. Never synthesize hits, clicks or whooshes.
- Cues come from the picture's own timing: declare `window.CUES` from the frame table and
  `Comp.springPeakSpeed` / `Comp.springSettle`, export with `node cues.mjs`. Never type frames.
- Sound only on real actions, tagged cut / move / land / appear. One hero per ~4 s, with stop_before.
- Cues >= 0.15 s apart. One sonic family per film; vary repeats.
- Music: the supplied track or a CC0 loop (biblioteca/som/musica). Energy punchy = -14 LUFS.
- Never edit the sound-layer scripts or loosen a threshold. Fix every qa.py FAIL by changing cues
  or sounds, at most 2 rounds. Deliver LISTEN.md (5 timecodes) and credits; never call the sound good.
- Fallback without internet only: `node sfx.mjs` (synthesized, Movez course).

## Environment (Windows)
- Python is `py`, not `python`. Write JSON to a file argument, never via `>` redirection.
- ffmpeg lives in %LOCALAPPDATA%\Microsoft\WinGet\Links if it is not on PATH.
- API keys live in .env (ELEVENLABS_API_KEY, FAL_KEY). Never print them.

## Loop before you show me anything
1. Render one frame per beat as a contact sheet and LOOK at it (`.\qa.ps1`).
2. Score it 1-10 on: hook in first 2s, readability at phone size,
   motion quality, variety, brand accuracy, sound sync.
3. Fix the 3 worst problems. Repeat until every score is 8+. Log rounds in docs/review_log.md.
   When I ask for a review only, do not rewrite anything: list P0/P1/P2 issues with frame numbers.
4. Export named review frames (`.\qa.ps1 -Frames 'opening=…,product=…,closing=…'`), including
   transition midpoints, and a cover (`-Cover`). Look at them.
5. Only then do the full render.
