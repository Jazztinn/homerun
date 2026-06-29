# homerun

Tools that help you create ready-to-publish pitch video presentations for
hackathons.

Two parts:

1. **`homerun studio`** — a browser app (Next.js) with:
   - **Word Reveal Lab** (`/word-reveal`) — Apple-Keynote-style word-by-word
     phrase reveals for title cards. See [`tools/word-reveal`](tools/word-reveal/README.md).
   - **Video Editor** (`/editor`) — a CapCut-style timeline with cut, speed,
     trim, undo, and in-browser export. See [`tools/video-editor`](tools/video-editor/README.md).
2. **`hackathon-pitch-video` skill** (`.claude/skills/`) — guidance for scripting
   and recording the video itself (narrative beats, judging rubric, checklist).

## Run the studio

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

| Route | Tool |
|---|---|
| `/` | Landing |
| `/word-reveal` | Word Reveal Lab |
| `/editor` | Video Editor |

Stack: Next.js (pages router) + React. No runtime dependencies beyond those.
