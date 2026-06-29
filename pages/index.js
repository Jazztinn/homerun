import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>homerun studio</title>
        <meta name="description" content="Pitch-video studio for hackathon demos." />
      </Head>
      <main style={S.wrap}>
        <div style={S.inner}>
          <p style={S.kicker}>homerun studio</p>
          <h1 style={S.h1}>Build pitch-ready hackathon demo videos.</h1>
          <p style={S.lead}>
            Keynote-style word reveals and a CapCut-style timeline editor — cut,
            speed, trim, and export, right in the browser.
          </p>
          <div style={S.cards}>
            <Link href="/editor" style={{ ...S.card, ...S.cardAccent }}>
              <h2 style={S.cardH}>Video Editor →</h2>
              <p style={S.cardP}>
                Timeline with cut, speed, and trim tools. Add text reveals and
                media clips, then export a video.
              </p>
            </Link>
            <Link href="/word-reveal" style={S.card}>
              <h2 style={S.cardH}>Word Reveal Lab →</h2>
              <p style={S.cardP}>
                Tune a single cinematic word-by-word phrase reveal and copy the
                React/HTML to reuse it anywhere.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

const ACCENT = "#e0a83a";
const S = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, color: "#e8e8ea" },
  inner: { maxWidth: 760 },
  kicker: { color: ACCENT, letterSpacing: 1, textTransform: "uppercase", fontSize: 12, margin: 0 },
  h1: { fontSize: 44, lineHeight: 1.1, margin: "12px 0 14px", fontFamily: "'Source Serif 4', Georgia, serif" },
  lead: { color: "#9a9aa4", fontSize: 17, lineHeight: 1.5, margin: "0 0 32px" },
  cards: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card: { display: "block", textDecoration: "none", background: "#15151c", border: "1px solid #2a2a32", borderRadius: 14, padding: 22, color: "#e8e8ea" },
  cardAccent: { borderColor: ACCENT },
  cardH: { margin: "0 0 8px", fontSize: 20 },
  cardP: { margin: 0, color: "#9a9aa4", fontSize: 14, lineHeight: 1.5 },
};
