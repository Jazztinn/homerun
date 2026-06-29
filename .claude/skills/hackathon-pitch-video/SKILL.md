---
name: hackathon-pitch-video
description: Use this skill to plan, script, storyboard, record, and polish a pitch-ready video presentation (demo video) for a hackathon submission. Turns a project into a 2-3 minute judge-facing video — narrative beats mapped to judging criteria, a timed script template, shot list, recording/screen-capture kit, and a pre-submission checklist. Trigger when the user mentions a hackathon demo video, pitch video, submission video, "record our demo", "script our pitch", or wants help making judges understand their project in a few minutes.
---

# Hackathon Pitch Video

Help a team turn their project into a **judge-ready video** — usually 2-3 minutes — that lands the project's value before judges ever open the repo. The job is not "make a video"; it is **make judges score you well on a clock**. Every choice serves that.

## When to Use This Skill

Trigger when the user:
- Asks to plan, script, storyboard, record, or edit a hackathon **demo / pitch / submission video**
- Says "record our demo", "script our pitch", "what do we say in the video", "our video is 30s too long"
- Has a built project and a deadline and needs the video deliverable
- Wants the video to map to a hackathon's judging rubric

## Core Principle

A judge watches dozens of these, often at 1.25x, often tired. You win by being **clear, fast, and honest**, not flashy. The reference submission this skill is modeled on scored 86/100 partly because it *led with its sharpest finding* and was *honest about limitations*. Copy that posture.

Three rules that drive every decision:
1. **One sentence they remember.** If a judge can repeat your one-line pitch afterward, the video worked.
2. **Show, then tell.** Real demo footage beats slides. Get to a working thing on screen fast.
3. **Map to the rubric.** Whatever criteria the hackathon scores on, hit each one explicitly. See `references/judging_rubric.md`.

## Workflow

Work the steps in order. Don't skip to recording — an unscripted demo is the #1 reason these videos run long and bury the point.

### Step 1 — Gather inputs
Ask the user for, or infer from the repo:
- **What the project is** and the one problem it solves
- **Target length** and format rules (most hackathons cap 2-5 min; default to **3:00 max**). Ask if unknown.
- **Judging criteria** — get the actual rubric if it exists. If not, use the standard 4×25% set in `references/judging_rubric.md` (Innovation, Technical Execution, Design/UX, Theme & Impact).
- **What actually works** right now (for the live demo) vs. what's aspirational. Be ruthless: only demo what runs.
- **Who's presenting** (voiceover vs. on-camera, team credits).

If the project is in a repo, read its README / submission narrative / demo scripts first — pull the real pitch, metrics, and limitations from there rather than inventing them.

### Step 2 — Lock the narrative
Use the beat structure in `references/pitch_structure.md`. Produce a one-line pitch first, then the beats. Get the user to approve the one-liner before scripting — everything hangs off it.

### Step 3 — Write the timed script
Fill `references/script_template.md`. Every beat gets a time budget and a word count (~150 wpm narration). Total spoken words must fit the target length with ~15% slack for pauses and demo time. Flag any beat that's over budget.

### Step 4 — Build the shot list / storyboard
Turn the script into a shot list (see `references/script_template.md` shot-list section): for each line, what's on screen — screen capture, slide, face-cam, b-roll. Mark which shots are **live demo** (record last, when the build is stable).

### Step 5 — Record
Walk the user through `references/recording_kit.md`: audio first (bad audio kills more videos than bad video), screen capture settings, demo rehearsal, retakes. Record narration and screen separately if it reduces stress.

### Step 6 — Edit & QC
Cut to the script. Run `references/submission_checklist.md` before export — length, captions, the one-liner landing in the first 10 seconds, demo legibility, links, file format/platform rules.

## Outputs You Produce

Deliver these as files in the user's project (e.g. a `pitch/` or `docs/` folder) so the team can edit them:
- `pitch_script.md` — the timed, beat-by-beat narration + shot list
- A one-line pitch and a 3-bullet "what judges remember"
- (optional) `recording_plan.md` — gear/settings/rehearsal notes pulled from the recording kit

## References

- `references/pitch_structure.md` — the narrative beats and what each one earns you
- `references/judging_rubric.md` — standard 4×25% criteria + how a video addresses each
- `references/script_template.md` — fill-in timed script + shot-list template
- `references/recording_kit.md` — audio, screen capture, lighting, rehearsal, editing
- `references/submission_checklist.md` — final QC gate before you submit
