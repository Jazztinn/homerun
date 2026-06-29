# Recording kit — capture a clean pitch video

The point of this step is a **legible, well-paced recording** with **good audio**. Bad audio
sinks more hackathon videos than bad visuals. Do audio first.

## 0. Decide the capture model

Pick one — simplest that fits:
- **Screen + voiceover (most common):** record screen capture, narrate over it (live or added
  after). Lowest stress, easiest to cut to length.
- **Screen + face-cam corner:** adds presence; only if your camera/lighting is decent.
- **Talking-head intro + screen demo:** face for hook/close, screen for the demo.

Recommend voiceover-over-screen for most teams: you can re-record narration without re-doing the
demo, and editing to length is trivial.

## 1. Audio (do this first)

- **Mic:** any external mic or earbud mic beats a laptop's built-in. Get the mic close
  (~15-20cm), off-axis to avoid plosives.
- **Room:** smallest, softest room you have. Soft furnishings kill echo. Turn off fans/AC.
- **Levels:** speak at a consistent distance; aim for a healthy level without clipping
  (peaks not hitting 0 dB). Do a 10s test and listen back on headphones before the real take.
- **Record narration as its own track** if possible — easiest to clean (noise reduction,
  normalize) and to re-time against the visuals.
- If narration is rough, a quiet re-record of just the voice over the same screen footage is
  usually faster than salvaging bad audio.

## 2. Screen capture

- **Resolution/format:** record at 1080p (1920×1080), 30fps, MP4/H.264. Don't deliver 4K — it's
  big and judges don't need it.
- **Tools:** macOS — QuickTime (Cmd-Shift-5) or OBS; Windows/Linux — OBS; quick web demos —
  Loom. OBS if you want separate audio/video tracks and a face-cam overlay.
- **Legibility — the big one:**
  - Zoom the UI / browser to ~150% so text is readable on a phone screen.
  - Hide clutter: close extra tabs, silence notifications (Do Not Disturb / Focus), clean the
    desktop/menu bar.
  - Use a larger cursor and, if the tool supports it, click-highlighting.
- **Pre-stage everything:** accounts logged in, sample data loaded, the happy path tested twice.
  Judges should never watch you wait for a build or fix a typo.

## 3. Lighting + camera (only if on-camera)

- Face a window or soft light; never have the bright light behind you.
- Camera at eye level, framed chest-up, eyes in the upper third.
- Stable shot — prop the phone/laptop, don't hand-hold.

## 4. Rehearse, then record the demo last

- Read the script aloud and **time it** against the budget. Trim until it fits with slack.
- Dry-run the live demo end to end at least twice. Note where it's fragile.
- Record the demo segment **last**, when the build is most stable, and **capture a backup take**
  of the demo you can fall back to if a live attempt breaks.
- Record in beat-sized chunks, not one continuous take — far easier to re-do one beat than all.

## 5. Edit

- **Cut to the script.** Remove dead air, long loads, "umm"s, and any beat over budget.
- **Captions/subtitles:** add them. Many judges watch muted or in noise, and captions are an
  accessibility + Design/UX signal. Auto-caption then fix the product/jargon words.
- **On-screen text:** put the one-liner on the hook, the key metric near the demo, and the
  repo/live link on the close. Keep text big and on screen long enough to read aloud twice.
- **Pace:** speed up or jump-cut anything that drags. Better to end at 2:40 than pad to 3:00.
- **Music (optional):** low, royalty-free, never competing with narration. Often better with none.
- **Export:** 1080p H.264 MP4. Watch the whole thing once start to finish before you call it done.

## 6. Hand off to the checklist

Run `submission_checklist.md` before you upload. It's the gate.
