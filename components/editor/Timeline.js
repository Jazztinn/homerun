import { useRef } from "react";
import { clipEnd, projectDuration } from "../../lib/timeline";

const TRACK_H = 56;
const RULER_H = 26;

export default function Timeline({
  project,
  currentMs,
  selectedId,
  pxPerMs,
  onSeek,
  onSelect,
  onMoveClip,
  onTrim,
}) {
  const laneRef = useRef(null);
  const dragRef = useRef(null);

  const total = Math.max(projectDuration(project), 6000);
  const widthPx = (total + 2000) * pxPerMs;

  const xToMs = (clientX) => {
    const rect = laneRef.current.getBoundingClientRect();
    return Math.max(0, (clientX - rect.left + laneRef.current.scrollLeft) / pxPerMs);
  };

  const onRulerDown = (e) => {
    onSeek(xToMs(e.clientX));
    const move = (ev) => onSeek(xToMs(ev.clientX));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startClipDrag = (e, clip, mode) => {
    e.stopPropagation();
    onSelect(clip.id);
    const startX = e.clientX;
    const orig = { startMs: clip.startMs, durationMs: clip.durationMs };
    dragRef.current = { clip, mode, startX, orig };

    const move = (ev) => {
      const deltaMs = (ev.clientX - startX) / pxPerMs;
      if (mode === "move") {
        onMoveClip(clip.id, Math.max(0, orig.startMs + deltaMs));
      } else if (mode === "trim-start") {
        onTrim(clip.id, "start", orig.startMs + deltaMs);
      } else if (mode === "trim-end") {
        onTrim(clip.id, "end", orig.startMs + orig.durationMs + deltaMs);
      }
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const seconds = [];
  for (let s = 0; s <= Math.ceil(total / 1000) + 2; s++) seconds.push(s);

  return (
    <div style={S.wrap}>
      <div style={S.gutter}>
        <div style={{ height: RULER_H }} />
        {project.tracks.map((t) => (
          <div key={t.id} style={S.trackLabel}>
            {t.name}
          </div>
        ))}
      </div>

      <div style={S.scroll} ref={laneRef}>
        <div style={{ width: widthPx, position: "relative" }}>
          {/* ruler */}
          <div style={{ ...S.ruler, height: RULER_H }} onPointerDown={onRulerDown}>
            {seconds.map((s) => (
              <div key={s} style={{ ...S.tick, left: s * 1000 * pxPerMs }}>
                <span style={S.tickLabel}>{s}s</span>
              </div>
            ))}
          </div>

          {/* tracks */}
          {project.tracks.map((track) => (
            <div
              key={track.id}
              style={{ ...S.track, height: TRACK_H }}
              onPointerDown={(e) => onSeek(xToMs(e.clientX))}
            >
              {track.clips.map((clip) => (
                <ClipBlock
                  key={clip.id}
                  clip={clip}
                  pxPerMs={pxPerMs}
                  selected={clip.id === selectedId}
                  onDown={(e, mode) => startClipDrag(e, clip, mode)}
                />
              ))}
            </div>
          ))}

          {/* playhead */}
          <div style={{ ...S.playhead, left: currentMs * pxPerMs }}>
            <div style={S.playheadKnob} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ClipBlock({ clip, pxPerMs, selected, onDown }) {
  const left = clip.startMs * pxPerMs;
  const width = Math.max(8, clip.durationMs * pxPerMs);
  const isText = clip.type === "text";
  const label = isText ? `“${clip.phrase}”` : clip.name || clip.type;
  return (
    <div
      onPointerDown={(e) => onDown(e, "move")}
      style={{
        ...S.clip,
        left,
        width,
        background: isText ? "#3b3357" : "#1f4d4a",
        borderColor: selected ? "#e0a83a" : "transparent",
        boxShadow: selected ? "0 0 0 1px #e0a83a" : "none",
      }}
      title={label}
    >
      <div style={S.handleL} onPointerDown={(e) => onDown(e, "trim-start")} />
      <span style={S.clipLabel}>
        {label}
        {clip.speed && clip.speed !== 1 ? `  ·  ${clip.speed}×` : ""}
      </span>
      <div style={S.handleR} onPointerDown={(e) => onDown(e, "trim-end")} />
    </div>
  );
}

const S = {
  wrap: { display: "flex", background: "#101016", borderTop: "1px solid #2a2a32", userSelect: "none" },
  gutter: { width: 90, flexShrink: 0, borderRight: "1px solid #2a2a32", background: "#0c0c11" },
  trackLabel: { height: TRACK_H, display: "flex", alignItems: "center", paddingLeft: 12, fontSize: 11, color: "#9a9aa4", borderTop: "1px solid #1c1c24" },
  scroll: { flex: 1, overflowX: "auto", overflowY: "hidden", position: "relative" },
  ruler: { position: "relative", borderBottom: "1px solid #2a2a32", background: "#0c0c11", cursor: "pointer" },
  tick: { position: "absolute", top: 0, bottom: 0, borderLeft: "1px solid #23232c" },
  tickLabel: { position: "absolute", left: 4, top: 5, fontSize: 10, color: "#6a6a74" },
  track: { position: "relative", borderTop: "1px solid #1c1c24" },
  clip: { position: "absolute", top: 6, bottom: 6, borderRadius: 7, border: "1px solid transparent", display: "flex", alignItems: "center", overflow: "hidden", cursor: "grab", color: "#eee" },
  clipLabel: { fontSize: 11, padding: "0 10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, pointerEvents: "none" },
  handleL: { width: 8, alignSelf: "stretch", cursor: "ew-resize", background: "rgba(255,255,255,0.18)" },
  handleR: { width: 8, alignSelf: "stretch", cursor: "ew-resize", background: "rgba(255,255,255,0.18)" },
  playhead: { position: "absolute", top: 0, bottom: 0, width: 2, background: "#e0a83a", pointerEvents: "none", zIndex: 5 },
  playheadKnob: { position: "absolute", top: -2, left: -5, width: 12, height: 12, borderRadius: 3, background: "#e0a83a" },
};
