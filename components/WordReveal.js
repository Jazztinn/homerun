import { useEffect, useRef, useState } from "react";
import { tokenize, wordState, revealDuration, DEFAULTS } from "../lib/reveal";

// Reusable Keynote-style word-by-word reveal.
// Self-animates on mount and whenever `playToken` changes (use it to replay).
// Drop into any scene:
//   <WordReveal phrase="It misses the Hiligaynon." mode="dark" fontSize={64} />
export default function WordReveal({
  phrase = DEFAULTS.phrase,
  mode = DEFAULTS.mode,
  fontSize = DEFAULTS.fontSize,
  wordDelay = DEFAULTS.wordDelay,
  duration = DEFAULTS.duration,
  rise = DEFAULTS.rise,
  playToken = 0,
  fill = false,
}) {
  const words = tokenize(phrase);
  const [, forceRender] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const total = revealDuration(words.length, { wordDelay, duration });
    startRef.current = performance.now();
    const tick = (now) => {
      const local = now - startRef.current;
      forceRender((n) => n + 1);
      if (local < total + 50) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playToken, phrase, wordDelay, duration]);

  const local = performance.now() - startRef.current;
  const dark = mode === "dark";

  return (
    <div
      style={{
        position: fill ? "absolute" : "relative",
        inset: fill ? 0 : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: dark ? "#0b0b0f" : "#f6f5f1",
        color: dark ? "#f6f5f1" : "#14141a",
        fontFamily:
          "'Source Serif 4', 'Iowan Old Style', Georgia, 'Times New Roman', serif",
        padding: "8%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize,
          lineHeight: 1.18,
          fontWeight: 600,
          textAlign: "center",
          textWrap: "balance",
          maxWidth: "100%",
        }}
      >
        {words.map((w, i) => {
          const s = wordState(i, local, { wordDelay, duration, rise });
          return (
            <span
              key={`${w}-${i}`}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                opacity: s.opacity,
                transform: `translateY(${s.translateY}px)`,
                filter: `blur(${s.blur}px)`,
                willChange: "opacity, transform, filter",
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}
