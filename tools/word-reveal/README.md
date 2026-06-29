# Word Reveal Lab

Apple-Keynote-style word-by-word phrase reveal generator. Type a phrase and
preview a cinematic reveal where each word starts lower, faded, and softly
blurred, then rises gently into place one at a time until the full phrase forms.

Built for cutting scenes in a 3-minute hackathon demo video.

## What it is

A React/Next.js tool living inside this repo. The real implementation is the
React route — this folder holds only the README.

| File | Role |
|---|---|
| `components/WordReveal.js` | Reusable reveal component. Drop into any scene. |
| `components/WordRevealLab.js` | The lab UI: controls, preview stage, code export. |
| `lib/reveal.js` | The motion math (easing, per-word state) shared with the editor's canvas. |
| `pages/word-reveal.js` | The route. Does not touch `index.js`. |

## How to run

```bash
npm install
npm run dev
```

Open <http://localhost:3000/word-reveal>.

## How to create a new phrase animation

1. Type or paste the phrase in **Phrase**, or click a **Preset**.
2. Pick **Background** (light / dark) to match your scene.
3. Tune **Font size**, **Word delay**, **Duration**, **Rise distance**.
4. Hit **↻ Replay** to re-run the reveal.
5. **Copy code** (HTML/CSS or React) to reuse the exact look elsewhere.

## Reuse the component directly

```jsx
import WordReveal from "../components/WordReveal";

<WordReveal phrase="It misses the Hiligaynon." mode="dark" fontSize={64} />
```

## Motion spec (matches the reference)

- Initial: `opacity 0, translateY(18px), blur(6px)`
- Final: `opacity 1, translateY(0), blur(0)`
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (Apple ease-out-expo)
- Default duration 700ms, stagger 120ms
- Phrase stays visible after forming. No bounce / spin / particles.

## Recommended settings for 3-minute scenes

| Scene type | Font | Word delay | Duration | Rise | BG |
|---|---|---|---|---|---|
| Title / hook | 88px | 140ms | 800ms | 22px | dark |
| Finding statement | 64px | 120ms | 700ms | 18px | dark |
| Data / number callout | 56px | 100ms | 600ms | 14px | light |
| Calm closer | 72px | 160ms | 900ms | 20px | dark |

Keep dark backgrounds for the emotional beats, light for the metric reveals.

## How to screen-record the preview

The preview stage is a fixed 16:9 box, so it crops cleanly to 1920×1080.

1. Set background + phrase, then click **Replay** once to confirm the timing.
2. macOS: `Cmd+Shift+5` → record a region tightly around the 16:9 stage.
3. Click **Replay** to fire the animation while recording.
4. Trim the lead-in; the phrase holds steady after forming, so you have a clean
   tail to cut on.

> Tip: for the cleanest capture, browser full-screen (`F11` / `Cmd+Ctrl+F`) and
> zoom so the stage fills the frame.

**Or skip recording entirely:** add the phrase as a *text clip* in the
[Video Editor](../video-editor/README.md) and export the whole video at once.
