import Head from "next/head";
import dynamic from "next/dynamic";

// Client-only: uses canvas, MediaRecorder, object URLs, and window events.
const Editor = dynamic(() => import("../components/editor/Editor"), { ssr: false });

export default function EditorPage() {
  return (
    <>
      <Head>
        <title>Video Editor · homerun studio</title>
      </Head>
      <Editor />
    </>
  );
}
