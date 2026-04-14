import { useRef } from "react"
import { addPropertyControls, ControlType } from "framer"

// Update this to your deployed Vercel URL
const EMBED_URL = "https://cdplayer-peach.vercel.app/"

interface Props {
    height?: number
    style?: React.CSSProperties
}

// MusicPlayerEmbed — Framer code component
//
// How it works:
//   • The iframe has pointerEvents:none so mouse events stay in Framer's DOM
//     → Framer's custom JS cursor keeps tracking position over the embed.
//   • A transparent overlay captures all pointer + click events and forwards
//     them into the iframe via postMessage with iframe-relative coordinates.
//   • allow="autoplay" lets the iframe inherit the parent page's user gesture
//     so AudioContext + audio.play() work without needing a direct iframe click.

export default function MusicPlayerEmbed({ height = 550, style }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    function forward(e: { clientX: number; clientY: number }, type: string) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect || !iframeRef.current?.contentWindow) return
        iframeRef.current.contentWindow.postMessage(
            { type, x: e.clientX - rect.left, y: e.clientY - rect.top },
            "*"
        )
    }

    const styleH = style?.height
    const resolvedHeight =
        styleH && styleH !== "fit-content" && styleH !== "auto"
            ? styleH
            : height

    return (
        <div
            ref={containerRef}
            style={{
                ...style,
                width: "100%",
                height: resolvedHeight,
                position: "relative",
                overflow: "hidden",
            }}
        >
            <iframe
                ref={iframeRef}
                src={EMBED_URL}
                allow="autoplay"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                    pointerEvents: "none",
                }}
            />
            {/* Transparent overlay: captures real pointer/click events, forwards to iframe */}
            <div
                onPointerDown={(e) => forward(e, "framer-pointerdown")}
                onPointerMove={(e) => forward(e, "framer-pointermove")}
                onPointerUp={(e) => forward(e, "framer-pointerup")}
                onClick={(e) => forward(e, "framer-click")}
                style={{ position: "absolute", inset: 0 }}
            />
        </div>
    )
}

addPropertyControls(MusicPlayerEmbed, {
    height: {
        type: ControlType.Number,
        title: "Height",
        defaultValue: 550,
        min: 200,
        max: 1200,
        step: 10,
        displayStepper: true,
    },
})
