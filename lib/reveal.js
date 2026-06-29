// Shared word-reveal math. One source of truth so the live DOM preview
// (WordReveal.js) and the canvas compositor (compositor.js) animate identically.
//
// Motion spec (Apple-Keynote style):
//   initial: opacity 0, translateY(rise px), blur(6px)
//   final:   opacity 1, translateY(0),       blur(0)
//   easing:  cubic-bezier(0.16, 1, 0.3, 1)  (ease-out-expo)
//   each word staggered by `wordDelay`, animating over `duration`.

const BLUR_MAX = 6; // px, matches the reference spec

// Cubic-bezier solver (same curve the CSS uses). Returns y for a given x=t.
function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx;

  const solveX = (x) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-5) return t;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    // bisection fallback
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-5) break;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };

  return (x) => sampleY(solveX(clamp(x, 0, 1)));
}

const easeOutExpo = cubicBezier(0.16, 1, 0.3, 1);

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

// Split a phrase into words (collapsing whitespace).
export function tokenize(phrase) {
  return String(phrase || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// Per-word visual state at a given local time (ms since the reveal started).
// `rise` is the translateY distance in px.
export function wordState(index, localMs, { wordDelay, duration, rise }) {
  const start = index * wordDelay;
  const raw = clamp((localMs - start) / Math.max(1, duration), 0, 1);
  const e = easeOutExpo(raw);
  return {
    progress: raw,
    eased: e,
    opacity: e,
    translateY: (1 - e) * rise,
    blur: (1 - e) * BLUR_MAX,
  };
}

// Total time for every word to finish revealing.
export function revealDuration(wordCount, { wordDelay, duration }) {
  if (wordCount <= 0) return duration;
  return (wordCount - 1) * wordDelay + duration;
}

export const PRESETS = [
  { label: "Title / hook", phrase: "Measuring what speech AI leaves in the dark.", mode: "dark", fontSize: 88, wordDelay: 140, duration: 800, rise: 22 },
  { label: "Finding", phrase: "It misses the Hiligaynon.", mode: "dark", fontSize: 64, wordDelay: 120, duration: 700, rise: 18 },
  { label: "Data callout", phrase: "65.9% word error rate.", mode: "light", fontSize: 56, wordDelay: 100, duration: 600, rise: 14 },
  { label: "Calm closer", phrase: "Tinig sa Liwanag.", mode: "dark", fontSize: 72, wordDelay: 160, duration: 900, rise: 20 },
];

export const DEFAULTS = {
  phrase: "It misses the Hiligaynon.",
  mode: "dark",
  fontSize: 64,
  wordDelay: 120,
  duration: 700,
  rise: 18,
};
