// Timeline data model + pure operations for the CapCut-style editor.
//
// A project has ordered tracks (rendered bottom-first, so the LAST track in the
// array paints on top). Each clip occupies [startMs, startMs+durationMs) on the
// timeline. Video clips also reference a source range via `inMs` + `speed`:
//   source consumed = durationMs * speed,  outMs = inMs + durationMs*speed.

let _id = 0;
export const uid = (p = "id") => `${p}_${Date.now().toString(36)}_${(_id++).toString(36)}`;

export const FPS = 30;
export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

export function emptyProject() {
  return {
    width: CANVAS_W,
    height: CANVAS_H,
    fps: FPS,
    tracks: [
      { id: uid("trk"), name: "Media", kind: "media", clips: [] },
      { id: uid("trk"), name: "Text", kind: "text", clips: [] },
    ],
  };
}

// ---- clip factories ------------------------------------------------------

export function makeTextClip(startMs, opts = {}) {
  const duration = opts.duration ?? 700;
  const wordDelay = opts.wordDelay ?? 120;
  const wordCount = (opts.phrase ?? "It misses the Hiligaynon.").trim().split(/\s+/).length;
  const reveal = (wordCount - 1) * wordDelay + duration;
  return {
    id: uid("clip"),
    type: "text",
    startMs,
    durationMs: opts.durationMs ?? Math.max(2500, reveal + 1200),
    phrase: opts.phrase ?? "It misses the Hiligaynon.",
    mode: opts.mode ?? "dark",
    fontSize: opts.fontSize ?? 64,
    wordDelay,
    duration,
    rise: opts.rise ?? 18,
    speed: 1,
  };
}

export function makeMediaClip(startMs, media) {
  // media: { src, kind: 'video'|'image', durationMs }
  const dur = media.kind === "image" ? 4000 : media.durationMs || 4000;
  return {
    id: uid("clip"),
    type: media.kind, // 'video' | 'image'
    startMs,
    durationMs: dur,
    src: media.src,
    name: media.name || media.kind,
    srcDurationMs: media.durationMs || dur,
    inMs: 0,
    speed: 1,
  };
}

// ---- queries -------------------------------------------------------------

export const clipEnd = (c) => c.startMs + c.durationMs;

export function projectDuration(project) {
  let end = 0;
  for (const t of project.tracks) for (const c of t.clips) end = Math.max(end, clipEnd(c));
  return end;
}

export function findClip(project, clipId) {
  for (const t of project.tracks) {
    const c = t.clips.find((x) => x.id === clipId);
    if (c) return { track: t, clip: c };
  }
  return null;
}

// Source time (seconds) a video clip should display at timeline time `ms`.
export function sourceTimeSec(clip, ms) {
  const local = ms - clip.startMs;
  return (clip.inMs + local * (clip.speed || 1)) / 1000;
}

// ---- mutations (return a NEW project; never mutate in place) --------------

function mapTrackClips(project, trackId, fn) {
  return {
    ...project,
    tracks: project.tracks.map((t) =>
      t.id === trackId ? { ...t, clips: fn(t.clips) } : t
    ),
  };
}

export function addClip(project, trackId, clip) {
  return mapTrackClips(project, trackId, (clips) =>
    [...clips, clip].sort((a, b) => a.startMs - b.startMs)
  );
}

export function removeClip(project, clipId) {
  return {
    ...project,
    tracks: project.tracks.map((t) => ({
      ...t,
      clips: t.clips.filter((c) => c.id !== clipId),
    })),
  };
}

export function updateClip(project, clipId, patch) {
  return {
    ...project,
    tracks: project.tracks.map((t) => ({
      ...t,
      clips: t.clips
        .map((c) => (c.id === clipId ? { ...c, ...patch } : c))
        .sort((a, b) => a.startMs - b.startMs),
    })),
  };
}

// Split the clip that spans `atMs` on its track into two clips at the playhead.
export function splitClipAt(project, clipId, atMs) {
  const found = findClip(project, clipId);
  if (!found) return project;
  const { track, clip } = found;
  const local = atMs - clip.startMs;
  if (local <= 30 || local >= clip.durationMs - 30) return project; // too close to an edge

  const left = { ...clip, durationMs: local };
  const right = {
    ...clip,
    id: uid("clip"),
    startMs: atMs,
    durationMs: clip.durationMs - local,
  };
  // advance the source in-point for the right half of a video clip
  if (clip.type === "video") right.inMs = clip.inMs + local * (clip.speed || 1);

  return mapTrackClips(project, track.id, (clips) =>
    clips.flatMap((c) => (c.id === clipId ? [left, right] : [c])).sort((a, b) => a.startMs - b.startMs)
  );
}

// Change a clip's speed, keeping its source range, rescaling its timeline length.
// Then ripple-shift later clips on the same track so nothing overlaps.
export function setClipSpeed(project, clipId, speed) {
  const found = findClip(project, clipId);
  if (!found) return project;
  const { track, clip } = found;
  const s = Math.max(0.25, Math.min(4, speed));
  const sourceSpan = clip.durationMs * (clip.speed || 1); // ms of source consumed
  const newDuration = Math.max(200, Math.round(sourceSpan / s));
  const delta = newDuration - clip.durationMs;

  return mapTrackClips(project, track.id, (clips) =>
    clips
      .map((c) => {
        if (c.id === clipId) return { ...c, speed: s, durationMs: newDuration };
        if (c.startMs > clip.startMs) return { ...c, startMs: c.startMs + delta };
        return c;
      })
      .sort((a, b) => a.startMs - b.startMs)
  );
}

// Trim a clip edge by dragging. side: 'start' | 'end'. `newMs` = timeline ms of the edge.
export function trimClip(project, clipId, side, newMs) {
  const found = findClip(project, clipId);
  if (!found) return project;
  const { clip } = found;
  if (side === "end") {
    const maxEnd =
      clip.type === "video"
        ? clip.startMs + (clip.srcDurationMs - clip.inMs) / (clip.speed || 1)
        : Infinity;
    const dur = Math.max(200, Math.min(newMs, maxEnd) - clip.startMs);
    return updateClip(project, clipId, { durationMs: dur });
  }
  // side === 'start'
  const oldEnd = clipEnd(clip);
  const minStart = clip.type === "video" ? clip.startMs - clip.inMs / (clip.speed || 1) : 0;
  const start = Math.max(minStart, Math.min(newMs, oldEnd - 200));
  const shift = start - clip.startMs;
  const patch = { startMs: start, durationMs: oldEnd - start };
  if (clip.type === "video") patch.inMs = clip.inMs + shift * (clip.speed || 1);
  return updateClip(project, clipId, patch);
}
