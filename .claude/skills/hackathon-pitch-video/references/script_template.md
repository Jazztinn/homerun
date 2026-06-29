# Timed script + shot-list template

Copy this into the user's project as `pitch_script.md` and fill it in. Two parts:
(1) the timed narration script, (2) the shot list derived from it.

**Timing math:** narration runs ~150 words/minute. For a target length, budget
`words ≈ minutes × 150 × 0.85` (the 0.85 leaves room for pauses + demo moments where
no one talks). A 3:00 video → ~380 spoken words, max.

---

## Part 1 — Timed narration script

> Fill the `Narration` lines. Keep each beat under its time budget. Read it aloud and
> time it — eyes lie, the clock doesn't.

| Beat | Time | Budget (s) | Words ≈ | On screen | Narration |
|---|---|---:|---:|---|---|
| 0. Hook | 0:00–0:10 | 10 | 25 | Product working / title card | `...` |
| 1. Problem | 0:10–0:35 | 25 | 60 | Concrete example / face-cam | `...` |
| 2. Demo | 0:35–1:50 | 75 | 150 | **Live screen capture** | `...` |
| 3. Clever bit | 1:50–2:20 | 30 | 70 | Diagram / code / result number | `...` |
| 4. Impact + fit | 2:20–2:45 | 25 | 55 | Theme tie-in / who it helps | `...` |
| 5. Limitations + next | 2:45–2:55 | 10 | 25 | Honest bullets | `...` |
| 6. Close | 2:55–3:00 | 5 | 15 | One-liner + repo/live link | `...` |

**Totals:** target ≤ 3:00, ≤ ~380 words. Adjust the table for your actual target length
and rubric weights (see `judging_rubric.md`).

### The one-liner (write this first, everything hangs off it)
> _"[Product] is a [category] that [does the one valuable thing] for [who]."_

### What judges remember (fill before recording)
- One sentence: ____
- Three things: 1) ____ 2) ____ 3) ____

---

## Part 2 — Shot list

> One row per shot. "Source" = how it's captured. Record **live demo shots last**, when the
> build is most stable. Mark anything fragile so you plan a fallback (pre-recorded take).

| # | Beat | Source | What's on screen | Notes / fallback |
|---|---|---|---|---|
| 1 | Hook | Screen capture | Product mid-action | Pre-record a clean take |
| 2 | Problem | Slide / face-cam | The pain, one example | — |
| 3 | Demo | Screen capture | Task end-to-end, zoomed | **Fragile — have a backup recording** |
| 4 | Clever bit | Slide / code | The insight + result number | Big font, highlight the number |
| 5 | Impact | Slide | Theme tie-in, who it helps | Quote the challenge wording |
| 6 | Close | Slide | One-liner + links | Links must be on screen, readable |

### Demo-shot rules
- **Zoom in.** Judges watch small. Increase UI font / browser zoom to ~150% before recording.
- **One task, start to finish.** Don't tour menus — complete the job from Beat 1's problem.
- **Pre-stage state.** Have data/accounts ready so you don't burn 20s typing or loading.
- **Narrate intent, not clicks.** "Now it finds the switch errors automatically" — not
  "I click here, then here."
- **Cut dead air.** Speed up or jump-cut any load/wait longer than ~2s.

---

## Worked micro-example (style reference)

For a benchmark/tooling project (posture that scored 86/100):

- **Hook (0:00):** "Speech AI looks like it understands Filipino — until someone speaks Ilonggo.
  We built the benchmark that proves where it breaks."
- **Problem (0:10):** one sentence on underserved language + why it's invisible until measured.
- **Demo (0:35):** show the explorer playing a clip, the per-word error highlighting, the score.
- **Clever bit (1:50):** "We measure the *switch penalty* — and found models do better on borrowed
  English words than on the language holding the sentence together. −30%."
- **Impact (2:20):** tie to the challenge ("inclusive speech tech for Philippine languages"),
  reusable open artifact.
- **Limitations (2:45):** "40 clips, one speaker — honest scope; here's the next step."
- **Close (2:55):** one-liner + repo link.

Lead with the sharpest, most defensible claim; be honest about scope. That posture scores.
