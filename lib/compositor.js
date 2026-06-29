// Canvas compositor: paints the whole project at timeline time `ms` onto a 2D
// context. The same function drives the live preview AND the MediaRecorder
// export, so what you see is what you render.
//
// `mediaEls` maps clipId -> HTMLVideoElement | HTMLImageElement (already loaded
// and, for video, seeked/playing by the PreviewStage engine).

import { clipEnd, sourceTimeSec } from "./timeline";
import { tokenize, wordState } from "./reveal";

export function drawProject(ctx, project, ms, mediaEls) {
  const { width: W, height: H } = project;

  // base background (so text-only projects are never transparent)
  ctx.fillStyle = "#0b0b0f";
  ctx.fillRect(0, 0, W, H);

  // bottom track first -> top track last
  for (const track of project.tracks) {
    const clip = track.clips.find((c) => ms >= c.startMs && ms < clipEnd(c));
    if (!clip) continue;
    if (clip.type === "video" || clip.type === "image") drawMedia(ctx, clip, mediaEls.get(clip.id), W, H);
    else if (clip.type === "text") drawText(ctx, clip, ms - clip.startMs, W, H);
  }
}

function drawMedia(ctx, clip, el, W, H) {
  if (!el) return;
  const vw = el.videoWidth || el.naturalWidth || W;
  const vh = el.videoHeight || el.naturalHeight || H;
  if (!vw || !vh) return;
  // cover-fit
  const scale = Math.max(W / vw, H / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  try {
    ctx.drawImage(el, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } catch (e) {
    /* frame not ready yet */
  }
}

function drawText(ctx, clip, localMs, W, H) {
  const dark = clip.mode === "dark";
  ctx.fillStyle = dark ? "#0b0b0f" : "#f6f5f1";
  ctx.fillRect(0, 0, W, H);

  const words = tokenize(clip.phrase);
  if (!words.length) return;

  // scale the lab font size (authored against a 1080-tall stage) to canvas height
  const fontPx = clip.fontSize * (H / 1080);
  ctx.font = `600 ${fontPx}px 'Source Serif 4', Georgia, serif`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = dark ? "#f6f5f1" : "#14141a";

  const space = ctx.measureText(" ").width;
  const widths = words.map((w) => ctx.measureText(w).width);
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);

  // simple single-line layout, centered; wraps if it would overflow 84% width
  const maxW = W * 0.84;
  const lines = layoutLines(words, widths, space, maxW, total);
  const lineH = fontPx * 1.18;
  let y = H / 2 - ((lines.length - 1) * lineH) / 2;

  let wordIndex = 0;
  for (const line of lines) {
    let x = (W - line.width) / 2;
    for (const item of line.items) {
      const s = wordState(wordIndex, localMs, {
        wordDelay: clip.wordDelay,
        duration: clip.duration,
        rise: clip.rise,
      });
      ctx.save();
      ctx.globalAlpha = s.opacity;
      // approximate the CSS blur with a soft shadow while a word is settling
      if (s.blur > 0.3) {
        ctx.shadowColor = dark ? "rgba(246,245,241,0.9)" : "rgba(20,20,26,0.8)";
        ctx.shadowBlur = s.blur * (H / 1080);
      }
      ctx.fillText(item.word, x, y + s.translateY * (H / 1080));
      ctx.restore();
      x += item.w + space;
      wordIndex += 1;
    }
    y += lineH;
  }
}

function layoutLines(words, widths, space, maxW, total) {
  if (total <= maxW) {
    return [{ width: total, items: words.map((word, i) => ({ word, w: widths[i] })) }];
  }
  const lines = [];
  let cur = [];
  let curW = 0;
  words.forEach((word, i) => {
    const w = widths[i];
    const add = (cur.length ? space : 0) + w;
    if (curW + add > maxW && cur.length) {
      lines.push(finishLine(cur, space));
      cur = [];
      curW = 0;
    }
    cur.push({ word, w });
    curW += (cur.length > 1 ? space : 0) + w;
  });
  if (cur.length) lines.push(finishLine(cur, space));
  return lines;
}

function finishLine(items, space) {
  const width = items.reduce((a, it) => a + it.w, 0) + space * (items.length - 1);
  return { width, items };
}
