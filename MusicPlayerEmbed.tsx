import { useRef, useEffect, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

const EMBED_URL = "https://cdplayer-peach.vercel.app/"

interface Props {
    height?: number
    style?: React.CSSProperties
}

// MusicPlayerEmbed — Framer code component
//
// Desktop: iframe has pointerEvents:none + transparent overlay forwards all
//   pointer/click events via postMessage → Framer's custom cursor stays visible.
//
// Touch (mobile/tablet): overlay is removed entirely so the iframe receives
//   real touch events directly. This is necessary because:
//   1. Mobile browsers don't show a JS cursor, so the overlay has no benefit.
//   2. iOS Safari requires a real trusted event inside the iframe to unlock
//      AudioContext / audio.play() — synthetic postMessage events are blocked.

export default function MusicPlayerEmbed({ height = 550, style }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [isTouch, setIsTouch] = useState(false)

    useEffect(() => {
        // hover:none = touch-primary device (phone / tablet)
        setIsTouch(window.matchMedia("(hover: none)").matches)
    }, [])

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
                    // On touch: let iframe receive real events (audio + drag work natively).
                    // On desktop: block events so Framer's JS cursor keeps tracking.
                    pointerEvents: isTouch ? "auto" : "none",
                }}
            />
            {/* Desktop-only overlay: captures pointer/click, forwards to iframe */}
            {!isTouch && (
                <div
                    onPointerDown={(e) => forward(e, "framer-pointerdown")}
                    onPointerMove={(e) => forward(e, "framer-pointermove")}
                    onPointerUp={(e) => forward(e, "framer-pointerup")}
                    onClick={(e) => forward(e, "framer-click")}
                    style={{ position: "absolute", inset: 0 }}
                />
            )}
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
