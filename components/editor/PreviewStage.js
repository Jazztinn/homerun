import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { drawProject } from "../../lib/compositor";
import { clipEnd, sourceTimeSec, projectDuration } from "../../lib/timeline";

// Owns the <canvas>, the hidden media elements, the playback clock, and export.
// Parent drives `playing` + `currentMs` (for scrubbing while paused) and gets
// time back via onTime(ms) during playback.
const PreviewStage = forwardRef(function PreviewStage(
  { project, playing, currentMs, onTime, onEnded },
  ref
) {
  const canvasRef = useRef(null);
  const mediaRef = useRef(new Map()); // clipId -> HTMLVideoElement | HTMLImageElement
  const clockRef = useRef(0);
  const lastTsRef = useRef(0);
  const rafRef = useRef(0);
  const exportRef = useRef(null); // { recorder, resolve, durationMs }

  // keep the latest props available inside the rAF loop without re-subscribing
  const stateRef = useRef({ project, playing, currentMs });
  stateRef.current = { project, playing, currentMs };

  // --- build / reconcile media elements for video & image clips -------------
  useEffect(() => {
    const map = mediaRef.current;
    const liveIds = new Set();
    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (clip.type !== "video" && clip.type !== "image") continue;
        liveIds.add(clip.id);
        if (map.has(clip.id)) continue;
        if (clip.type === "video") {
          const v = document.createElement("video");
          v.src = clip.src;
          v.muted = true;
          v.playsInline = true;
          v.preload = "auto";
          v.crossOrigin = "anonymous";
          map.set(clip.id, v);
        } else {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = clip.src;
          map.set(clip.id, img);
        }
      }
    }
    // drop elements for deleted clips
    for (const id of [...map.keys()]) {
      if (!liveIds.has(id)) {
        const el = map.get(id);
        if (el && el.tagName === "VIDEO") el.src = "";
        map.delete(id);
      }
    }
  }, [project]);

  // --- the render / playback loop -------------------------------------------
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const frame = (ts) => {
      const st = stateRef.current;
      const isPlaying = st.playing || !!exportRef.current;

      if (isPlaying) {
        if (!lastTsRef.current) lastTsRef.current = ts;
        const dt = ts - lastTsRef.current;
        lastTsRef.current = ts;
        clockRef.current += dt;
      } else {
        lastTsRef.current = 0;
        clockRef.current = st.currentMs;
      }

      const ms = clockRef.current;
      syncMedia(st.project, ms, mediaRef.current, isPlaying);
      drawProject(ctx, st.project, ms, mediaRef.current);

      if (isPlaying) {
        if (st.playing && onTime) onTime(ms);
        const total = projectDuration(st.project);
        if (ms >= total) {
          if (exportRef.current) finishExport();
          else if (onEnded) onEnded(total);
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync the clock when playback starts so it resumes from the playhead
  useEffect(() => {
    if (playing) {
      clockRef.current = currentMs;
      lastTsRef.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // --- export ---------------------------------------------------------------
  useImperativeHandle(ref, () => ({
    async exportVideo({ onProgress } = {}) {
      const canvas = canvasRef.current;
      const total = projectDuration(stateRef.current.project);
      if (!total) throw new Error("Nothing on the timeline to export.");
      const stream = canvas.captureStream(stateRef.current.project.fps);
      const mime = pickMime();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

      return await new Promise((resolve, reject) => {
        recorder.onstop = () => {
          exportRef.current = null;
          const blob = new Blob(chunks, { type: mime || "video/webm" });
          resolve(blob);
        };
        recorder.onerror = (e) => reject(e.error || new Error("Recorder failed"));

        clockRef.current = 0;
        lastTsRef.current = 0;
        exportRef.current = { recorder, total, onProgress };
        recorder.start(100);
      });
    },
    seek(ms) {
      clockRef.current = ms;
    },
  }));

  function finishExport() {
    const ex = exportRef.current;
    if (!ex) return;
    try {
      ex.recorder.stop();
    } catch (e) {
      /* already stopped */
    }
  }

  const ar = project.width / project.height;
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <canvas
        ref={canvasRef}
        width={project.width}
        height={project.height}
        style={{
          width: "100%",
          maxWidth: 980,
          aspectRatio: String(ar),
          background: "#000",
          borderRadius: 12,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );
});

// Drive the hidden video elements toward the timeline clock.
function syncMedia(project, ms, map, isPlaying) {
  for (const track of project.tracks) {
    for (const clip of track.clips) {
      if (clip.type !== "video") continue;
      const el = map.get(clip.id);
      if (!el) continue;
      const active = ms >= clip.startMs && ms < clipEnd(clip);
      if (!active) {
        if (!el.paused) el.pause();
        continue;
      }
      const target = sourceTimeSec(clip, ms);
      el.playbackRate = clip.speed || 1;
      if (isPlaying) {
        if (el.paused) el.play().catch(() => {});
        if (Math.abs(el.currentTime - target) > 0.3 && isFinite(target)) el.currentTime = target;
      } else {
        if (!el.paused) el.pause();
        if (Math.abs(el.currentTime - target) > 0.05 && isFinite(target)) el.currentTime = target;
      }
    }
  }
}

function pickMime() {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

export default PreviewStage;
