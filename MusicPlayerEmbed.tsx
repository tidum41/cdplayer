// MusicPlayerEmbed.tsx — Add to your Framer project as a code component.
//
// How it works:
//   • The iframe has pointerEvents:none so mouse events stay in Framer's DOM
//     → Framer's custom JS cursor keeps tracking position over the embed.
//   • A transparent overlay div captures all real pointer events and forwards
//     them into the iframe via postMessage with iframe-relative coordinates.
//   • The app inside the iframe listens for these messages and dispatches
//     synthetic PointerEvents so dnd-kit / scratch interactions still work.
//
// Setup:
//   1. Change EMBED_URL to your deployed Vercel URL.
//   2. In Framer, add this file as a code component.
//   3. Replace the existing URL embed frame with this component.
//   4. Size it: Desktop fill 1fr height / Tablet 700px / Mobile 550px.

import { useRef } from "react"
import { addPropertyControls } from "framer"

const EMBED_URL = "https://YOUR-VERCEL-URL/"

interface Props {
  style?: React.CSSProperties
}

export default function MusicPlayerEmbed({ style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  function forward(e: React.PointerEvent, type: string) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || !iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(
      { type, x: e.clientX - rect.left, y: e.clientY - rect.top },
      "*"
    )
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      <iframe
        ref={iframeRef}
        src={EMBED_URL}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: "none",
          pointerEvents: "none", // keeps Framer cursor tracking active
        }}
      />
      {/* Transparent overlay: captures real pointer events, forwards to iframe */}
      <div
        onPointerDown={e => forward(e, "framer-pointerdown")}
        onPointerMove={e => forward(e, "framer-pointermove")}
        onPointerUp={e => forward(e, "framer-pointerup")}
        style={{ position: "absolute", inset: 0 }}
      />
    </div>
  )
}

addPropertyControls(MusicPlayerEmbed, {})
