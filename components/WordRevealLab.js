import { useMemo, useState } from "react";
import WordReveal from "./WordReveal";
import { PRESETS, DEFAULTS, tokenize } from "../lib/reveal";

// The lab UI: controls + 16:9 preview stage + code export.
export default function WordRevealLab() {
  const [phrase, setPhrase] = useState(DEFAULTS.phrase);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [fontSize, setFontSize] = useState(DEFAULTS.fontSize);
  const [wordDelay, setWordDelay] = useState(DEFAULTS.wordDelay);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [rise, setRise] = useState(DEFAULTS.rise);
  const [playToken, setPlayToken] = useState(0);
  const [codeKind, setCodeKind] = useState("react");

  const cfg = { phrase, mode, fontSize, wordDelay, duration, rise };
  const replay = () => setPlayToken((n) => n + 1);

  const applyPreset = (p) => {
    setPhrase(p.phrase);
    setMode(p.mode);
    setFontSize(p.fontSize);
    setWordDelay(p.wordDelay);
    setDuration(p.duration);
    setRise(p.rise);
    setPlayToken((n) => n + 1);
  };

  const code = useMemo(() => exportCode(codeKind, cfg), [codeKind, phrase, mode, fontSize, wordDelay, duration, rise]);

  return (
    <div style={S.wrap}>
      <aside style={S.side}>
        <h1 style={S.h1}>Word Reveal Lab</h1>
        <p style={S.sub}>Keynote-style word-by-word phrase reveal for demo-video cut scenes.</p>

        <label style={S.label}>Phrase</label>
        <textarea
          style={S.textarea}
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          rows={3}
        />

        <label style={S.label}>Presets</label>
        <div style={S.presetRow}>
          {PRESETS.map((p) => (
            <button key={p.label} style={S.chip} onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>

        <label style={S.label}>Background</label>
        <div style={S.presetRow}>
          {["dark", "light"].map((m) => (
            <button
              key={m}
              style={{ ...S.chip, ...(mode === m ? S.chipOn : null) }}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>

        <Slider label="Font size" value={fontSize} min={24} max={140} step={2} unit="px" onChange={setFontSize} />
        <Slider label="Word delay" value={wordDelay} min={40} max={300} step={10} unit="ms" onChange={setWordDelay} />
        <Slider label="Duration" value={duration} min={300} max={1400} step={50} unit="ms" onChange={setDuration} />
        <Slider label="Rise distance" value={rise} min={0} max={48} step={2} unit="px" onChange={setRise} />

        <button style={S.replay} onClick={replay}>↻ Replay</button>

        <label style={S.label}>Export</label>
        <div style={S.presetRow}>
          {["react", "html"].map((k) => (
            <button
              key={k}
              style={{ ...S.chip, ...(codeKind === k ? S.chipOn : null) }}
              onClick={() => setCodeKind(k)}
            >
              {k === "react" ? "React" : "HTML/CSS"}
            </button>
          ))}
          <button style={S.chip} onClick={() => navigator.clipboard?.writeText(code)}>
            Copy code
          </button>
        </div>
        <pre style={S.code}>{code}</pre>
      </aside>

      <main style={S.stageWrap}>
        <div style={S.stageOuter}>
          <div style={S.stage}>
            <WordReveal {...cfg} playToken={playToken} fill />
          </div>
          <p style={S.hint}>16:9 stage — crops cleanly to 1920×1080. Click Replay while screen-recording.</p>
        </div>
      </main>
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={S.sliderHead}>
        <span style={S.label}>{label}</span>
        <span style={S.val}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={S.range}
      />
    </div>
  );
}

function exportCode(kind, c) {
  if (kind === "react") {
    return `import WordReveal from "../components/WordReveal";

<WordReveal
  phrase=${JSON.stringify(c.phrase)}
  mode="${c.mode}"
  fontSize={${c.fontSize}}
  wordDelay={${c.wordDelay}}
  duration={${c.duration}}
  rise={${c.rise}}
/>`;
  }
  const words = tokenize(c.phrase);
  const dark = c.mode === "dark";
  const spans = words
    .map((w, i) => `    <span class="wr-word" style="animation-delay:${i * c.wordDelay}ms">${w}</span>`)
    .join("\n");
  return `<div class="wr-stage">
  <div class="wr-phrase">
${spans}
  </div>
</div>

<style>
.wr-stage{display:flex;align-items:center;justify-content:center;
  width:100%;height:100%;background:${dark ? "#0b0b0f" : "#f6f5f1"};
  color:${dark ? "#f6f5f1" : "#14141a"};
  font-family:'Source Serif 4',Georgia,serif;}
.wr-phrase{font-size:${c.fontSize}px;font-weight:600;text-align:center;line-height:1.18;}
.wr-word{display:inline-block;white-space:pre;opacity:0;
  transform:translateY(${c.rise}px);filter:blur(6px);
  animation:wrReveal ${c.duration}ms cubic-bezier(0.16,1,0.3,1) forwards;}
.wr-word::after{content:" ";}
@keyframes wrReveal{to{opacity:1;transform:translateY(0);filter:blur(0);}}
</style>`;
}

const ACCENT = "#e0a83a";
const S = {
  wrap: { display: "flex", height: "100vh", background: "#16161c", color: "#e8e8ea", fontFamily: "system-ui, sans-serif" },
  side: { width: 340, flexShrink: 0, padding: 20, overflowY: "auto", borderRight: "1px solid #2a2a32" },
  h1: { fontSize: 20, margin: "0 0 4px" },
  sub: { fontSize: 12, color: "#9a9aa4", margin: "0 0 16px", lineHeight: 1.4 },
  label: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#9a9aa4", display: "block", marginTop: 14 },
  textarea: { width: "100%", marginTop: 6, background: "#0f0f14", color: "#e8e8ea", border: "1px solid #2a2a32", borderRadius: 8, padding: 10, fontSize: 14, resize: "vertical", boxSizing: "border-box" },
  presetRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { background: "#22222b", color: "#d8d8de", border: "1px solid #34343f", borderRadius: 999, padding: "5px 11px", fontSize: 12, cursor: "pointer" },
  chipOn: { background: ACCENT, color: "#16161c", borderColor: ACCENT, fontWeight: 600 },
  sliderHead: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  val: { fontSize: 12, color: ACCENT, fontVariantNumeric: "tabular-nums" },
  range: { width: "100%", marginTop: 4, accentColor: ACCENT },
  replay: { width: "100%", marginTop: 18, padding: "10px", background: ACCENT, color: "#16161c", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  code: { marginTop: 8, background: "#0f0f14", border: "1px solid #2a2a32", borderRadius: 8, padding: 10, fontSize: 11, lineHeight: 1.5, overflowX: "auto", color: "#b9b9c4", whiteSpace: "pre-wrap", maxHeight: 220, overflowY: "auto" },
  stageWrap: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 },
  stageOuter: { width: "100%", maxWidth: 1100 },
  stage: { aspectRatio: "16 / 9", width: "100%", borderRadius: 14, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.5)", position: "relative" },
  hint: { textAlign: "center", color: "#7a7a84", fontSize: 12, marginTop: 14 },
};
