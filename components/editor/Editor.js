import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PreviewStage from "./PreviewStage";
import Timeline from "./Timeline";
import {
  emptyProject,
  makeTextClip,
  makeMediaClip,
  addClip,
  removeClip,
  updateClip,
  splitClipAt,
  setClipSpeed,
  trimClip,
  findClip,
  projectDuration,
} from "../../lib/timeline";

export default function Editor() {
  const [history, setHistory] = useState(() => {
    const p0 = emptyProject();
    const seeded = addClip(p0, p0.tracks[1].id, makeTextClip(0, { phrase: "Measuring what speech AI leaves in the dark.", fontSize: 80, mode: "dark" }));
    return { past: [], present: seeded, future: [] };
  });
  const project = history.present;

  const [currentMs, setCurrentMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [pxPerMs, setPxPerMs] = useState(0.08);
  const [exporting, setExporting] = useState(false);
  const stageRef = useRef(null);
  const fileRef = useRef(null);

  // ---- history-aware project setter ----
  const commit = useCallback((next) => {
    setHistory((h) => ({ past: [...h.past, h.present].slice(-50), present: next, future: [] }));
  }, []);
  const undo = useCallback(() => {
    setHistory((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h));
  }, []);
  const redo = useCallback(() => {
    setHistory((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h));
  }, []);

  const total = projectDuration(project);
  const selected = selectedId ? findClip(project, selectedId)?.clip : null;

  // ---- transport ----
  const togglePlay = () => {
    if (!playing && currentMs >= total) setCurrentMs(0);
    setPlaying((p) => !p);
  };
  const onTime = (ms) => setCurrentMs(ms);
  const onEnded = () => {
    setPlaying(false);
    setCurrentMs(total);
  };
  const seek = (ms) => {
    setPlaying(false);
    setCurrentMs(Math.min(ms, total + 1));
  };

  // ---- clip ops ----
  const addText = () => {
    const track = project.tracks.find((t) => t.kind === "text");
    const clip = makeTextClip(currentMs, {});
    commit(addClip(project, track.id, clip));
    setSelectedId(clip.id);
  };

  const importFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const src = URL.createObjectURL(file);
    const kind = file.type.startsWith("video") ? "video" : "image";
    let durationMs = 4000;
    if (kind === "video") durationMs = await probeDuration(src).catch(() => 4000);
    const track = project.tracks.find((t) => t.kind === "media");
    const clip = makeMediaClip(currentMs, { src, kind, durationMs, name: file.name });
    commit(addClip(project, track.id, clip));
    setSelectedId(clip.id);
  };

  const cutAtPlayhead = () => {
    if (!selectedId) return;
    commit(splitClipAt(project, selectedId, currentMs));
  };
  const changeSpeed = (s) => selectedId && commit(setClipSpeed(project, selectedId, s));
  const moveClip = (id, startMs) => commit(updateClip(project, id, { startMs }));
  const onTrim = (id, side, ms) => commit(trimClip(project, id, side, ms));
  const patchClip = (patch) => selectedId && commit(updateClip(project, selectedId, patch));
  const del = () => {
    if (!selectedId) return;
    commit(removeClip(project, selectedId));
    setSelectedId(null);
  };

  const doExport = async () => {
    if (!total) return;
    setPlaying(false);
    setExporting(true);
    try {
      const blob = await stageRef.current.exportVideo();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "homerun-export.webm";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setCurrentMs(0);
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (e.key === "s" && selectedId) cutAtPlayhead();
      else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) del();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div style={S.app}>
      <header style={S.bar}>
        <strong style={S.brand}>homerun studio</strong>
        <div style={S.tools}>
          <Btn onClick={addText}>＋ Text</Btn>
          <Btn onClick={() => fileRef.current.click()}>＋ Media</Btn>
          <Sep />
          <Btn onClick={cutAtPlayhead} disabled={!selected} title="Split selected clip at playhead (S)">✂ Cut</Btn>
          <Btn onClick={del} disabled={!selected} title="Delete (⌫)">🗑 Delete</Btn>
          <Sep />
          <Btn onClick={undo} disabled={!history.past.length}>↶ Undo</Btn>
          <Btn onClick={redo} disabled={!history.future.length}>↷ Redo</Btn>
          <Sep />
          <Btn onClick={togglePlay} primary>{playing ? "❚❚ Pause" : "▶ Play"}</Btn>
          <Btn onClick={doExport} disabled={exporting || !total} accent>
            {exporting ? "● Recording…" : "⤓ Export"}
          </Btn>
        </div>
        <span style={S.clock}>{fmt(currentMs)} / {fmt(total)}</span>
        <input ref={fileRef} type="file" accept="video/*,image/*" hidden onChange={importFile} />
      </header>

      <div style={S.body}>
        <main style={S.center}>
          <PreviewStage
            ref={stageRef}
            project={project}
            playing={playing}
            currentMs={currentMs}
            onTime={onTime}
            onEnded={onEnded}
          />
          {exporting && <p style={S.exportNote}>Recording the timeline in real time — keep this tab focused.</p>}
        </main>

        <Inspector
          clip={selected}
          onChange={patchClip}
          onSpeed={changeSpeed}
        />
      </div>

      <div style={S.zoomRow}>
        <span style={S.zoomLabel}>zoom</span>
        <input type="range" min={0.02} max={0.4} step={0.01} value={pxPerMs} onChange={(e) => setPxPerMs(Number(e.target.value))} style={{ accentColor: "#e0a83a", width: 160 }} />
      </div>

      <Timeline
        project={project}
        currentMs={currentMs}
        selectedId={selectedId}
        pxPerMs={pxPerMs}
        onSeek={seek}
        onSelect={setSelectedId}
        onMoveClip={moveClip}
        onTrim={onTrim}
      />
    </div>
  );
}

// ---------------- Inspector ----------------
function Inspector({ clip, onChange, onSpeed }) {
  if (!clip) {
    return (
      <aside style={S.inspector}>
        <p style={S.empty}>Select a clip to edit it.<br />Add text or media to start.</p>
      </aside>
    );
  }
  const isText = clip.type === "text";
  return (
    <aside style={S.inspector}>
      <h3 style={S.inspTitle}>{isText ? "Text clip" : `${clip.type} clip`}</h3>

      {isText && (
        <>
          <Field label="Phrase">
            <textarea style={S.input} rows={3} value={clip.phrase} onChange={(e) => onChange({ phrase: e.target.value })} />
          </Field>
          <Field label="Background">
            <div style={{ display: "flex", gap: 6 }}>
              {["dark", "light"].map((m) => (
                <button key={m} onClick={() => onChange({ mode: m })} style={{ ...S.modeBtn, ...(clip.mode === m ? S.modeOn : null) }}>{m}</button>
              ))}
            </div>
          </Field>
          <Range label="Font size" v={clip.fontSize} min={24} max={140} step={2} u="px" on={(v) => onChange({ fontSize: v })} />
          <Range label="Word delay" v={clip.wordDelay} min={40} max={300} step={10} u="ms" on={(v) => onChange({ wordDelay: v })} />
          <Range label="Reveal duration" v={clip.duration} min={300} max={1400} step={50} u="ms" on={(v) => onChange({ duration: v })} />
          <Range label="Rise" v={clip.rise} min={0} max={48} step={2} u="px" on={(v) => onChange({ rise: v })} />
        </>
      )}

      <Field label={`Speed — ${clip.speed || 1}×`}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[0.5, 1, 1.5, 2].map((s) => (
            <button key={s} onClick={() => onSpeed(s)} style={{ ...S.modeBtn, ...((clip.speed || 1) === s ? S.modeOn : null) }}>{s}×</button>
          ))}
        </div>
        <input type="range" min={0.25} max={4} step={0.05} value={clip.speed || 1} onChange={(e) => onSpeed(Number(e.target.value))} style={{ width: "100%", accentColor: "#e0a83a", marginTop: 8 }} />
      </Field>

      <Field label={`Duration on timeline — ${(clip.durationMs / 1000).toFixed(2)}s`}>
        <input type="range" min={300} max={Math.max(8000, clip.durationMs)} step={100} value={clip.durationMs} onChange={(e) => onChange({ durationMs: Number(e.target.value) })} style={{ width: "100%", accentColor: "#e0a83a" }} />
      </Field>
    </aside>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginTop: 14 }}>
      <label style={S.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}
function Range({ label, v, min, max, step, u, on }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <label style={S.fieldLabel}>{label}</label>
        <span style={S.fieldVal}>{v}{u}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => on(Number(e.target.value))} style={{ width: "100%", accentColor: "#e0a83a" }} />
    </div>
  );
}

function Btn({ children, onClick, disabled, primary, accent, title }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      style={{ ...S.btn, ...(primary ? S.btnPrimary : null), ...(accent ? S.btnAccent : null), ...(disabled ? S.btnOff : null) }}>
      {children}
    </button>
  );
}
const Sep = () => <span style={{ width: 1, height: 22, background: "#2a2a32", margin: "0 4px" }} />;

function fmt(ms) {
  const s = Math.max(0, ms) / 1000;
  const m = Math.floor(s / 60);
  const r = (s % 60).toFixed(1);
  return `${m}:${r.padStart(4, "0")}`;
}
function probeDuration(src) {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => resolve(Math.round(v.duration * 1000));
    v.onerror = reject;
    v.src = src;
  });
}

const ACCENT = "#e0a83a";
const S = {
  app: { display: "flex", flexDirection: "column", height: "100vh", background: "#0c0c11", color: "#e8e8ea", fontFamily: "system-ui, sans-serif" },
  bar: { display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", borderBottom: "1px solid #2a2a32", background: "#101016" },
  brand: { fontSize: 14, letterSpacing: 0.3, color: ACCENT },
  tools: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  clock: { marginLeft: "auto", fontVariantNumeric: "tabular-nums", color: "#9a9aa4", fontSize: 13 },
  body: { flex: 1, display: "flex", minHeight: 0 },
  center: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 10 },
  exportNote: { color: ACCENT, fontSize: 12 },
  inspector: { width: 280, flexShrink: 0, borderLeft: "1px solid #2a2a32", background: "#101016", padding: 16, overflowY: "auto" },
  inspTitle: { fontSize: 14, margin: "0 0 6px" },
  empty: { color: "#7a7a84", fontSize: 13, lineHeight: 1.6 },
  fieldLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, color: "#9a9aa4", display: "block", marginBottom: 5 },
  fieldVal: { fontSize: 11, color: ACCENT },
  input: { width: "100%", background: "#0c0c11", color: "#e8e8ea", border: "1px solid #2a2a32", borderRadius: 7, padding: 8, fontSize: 13, boxSizing: "border-box", resize: "vertical" },
  modeBtn: { background: "#22222b", color: "#d8d8de", border: "1px solid #34343f", borderRadius: 7, padding: "5px 12px", fontSize: 12, cursor: "pointer" },
  modeOn: { background: ACCENT, color: "#16161c", borderColor: ACCENT, fontWeight: 600 },
  btn: { background: "#22222b", color: "#e8e8ea", border: "1px solid #34343f", borderRadius: 7, padding: "6px 11px", fontSize: 13, cursor: "pointer" },
  btnPrimary: { background: "#2d2d6a", borderColor: "#3d3d8a" },
  btnAccent: { background: ACCENT, color: "#16161c", borderColor: ACCENT, fontWeight: 600 },
  btnOff: { opacity: 0.4, cursor: "not-allowed" },
  zoomRow: { display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "#101016", borderTop: "1px solid #2a2a32" },
  zoomLabel: { fontSize: 11, color: "#9a9aa4", textTransform: "uppercase", letterSpacing: 0.4 },
};
