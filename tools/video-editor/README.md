# Video Editor

A CapCut-style timeline video editor that runs in the browser — built to
assemble a 3-minute hackathon demo video out of word-reveal title cards, screen
recordings, and images, then export it as a single video file.

Like Word Reveal Lab, the real implementation is the React route; this folder
holds only the README.

| File | Role |
|---|---|
| `pages/editor.js` | The route (`/editor`). Client-only. |
| `components/editor/Editor.js` | Top-level state: tools, history (undo/redo), import, export. |
| `components/editor/PreviewStage.js` | Canvas, hidden media elements, the playback clock, MediaRecorder export. |
| `components/editor/Timeline.js` | Ruler, tracks, draggable clips, trim handles, playhead. |
| `lib/timeline.js` | Project model + pure ops: split, speed, trim, add/remove. |
| `lib/compositor.js` | Draws the whole project at time `t` to a 2D canvas (drives preview **and** export). |
| `lib/reveal.js` | Shared word-reveal motion math (same as Word Reveal Lab). |

## How to run

```bash
npm install
npm run dev
```

Open <http://localhost:3000/editor>.

## The tools (just like CapCut)

| Tool | What it does | Shortcut |
|---|---|---|
| **＋ Text** | Adds a Keynote-style word-reveal clip at the playhead. | — |
| **＋ Media** | Imports a video or image from disk to the media track. | — |
| **✂ Cut** | Splits the selected clip into two at the playhead. | `S` |
| **🗑 Delete** | Removes the selected clip. | `Delete` / `Backspace` |
| **Speed** | 0.5×–4× per clip. Rescales the clip's length and ripples later clips. | (inspector) |
| **Trim** | Drag a clip's left/right edge to trim; drag its body to move it. | — |
| **Undo / Redo** | Full history. | `Cmd/Ctrl+Z` · `Shift+Cmd/Ctrl+Z` |
| **▶ Play / Pause** | Transport. Click the ruler or a track to scrub. | `Space` |
| **⤓ Export** | Records the timeline to a `.webm` and downloads it. | — |

## Workflow

1. **＋ Text** for your title/finding cards — edit the phrase and motion in the
   right-hand inspector (font, word delay, reveal duration, rise, background).
2. **＋ Media** to drop in screen recordings of your live demo.
3. Arrange clips on the two tracks (media paints first, text paints on top).
   Drag to move, drag edges to trim.
4. Put the playhead where a clip should change and hit **✂ Cut**; speed up dead
   air with the **Speed** control.
5. **▶ Play** to review, then **⤓ Export**.

## Tracks & layering

Two tracks: **Media** (bottom) and **Text** (top). The compositor paints tracks
bottom-first, so a text clip overlaps the media clip beneath it at the same time
— exactly how you'd lay a title over footage.

## Export — how it works and its limits

Export uses the browser's `canvas.captureStream()` + `MediaRecorder`. The
editor replays the timeline **in real time** and records the canvas, so:

- Output is **`.webm`** (VP9/VP8). Convert to MP4 if a platform needs it:
  `ffmpeg -i homerun-export.webm homerun-export.mp4`.
- Recording happens in real time — a 3-minute video takes ~3 minutes. Keep the
  tab focused while it records.
- **Audio is not captured** in this version (the demo title cards are silent;
  add a voiceover/music track in any editor over the exported clip). This is the
  main known limitation — true muxed audio + faster-than-realtime export needs
  `ffmpeg.wasm`, a deliberate next step rather than a hidden gap.
- For a single title card you can still just screen-record the
  [Word Reveal Lab](../word-reveal/README.md) stage instead.

## Motion + look

Text clips reuse the exact Word Reveal motion spec
(`cubic-bezier(0.16,1,0.3,1)`, per-word stagger, rise + blur), rendered to
canvas so the export matches the live preview.
