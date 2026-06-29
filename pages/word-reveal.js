import Head from "next/head";
import dynamic from "next/dynamic";

// Client-only: the lab self-animates with requestAnimationFrame.
const WordRevealLab = dynamic(() => import("../components/WordRevealLab"), { ssr: false });

export default function WordRevealPage() {
  return (
    <>
      <Head>
        <title>Word Reveal Lab · homerun studio</title>
      </Head>
      <WordRevealLab />
    </>
  );
}
