import { useRef, useEffect } from 'react';
import styles from './Disc.module.css';

interface DiscProps {
  size?: number;
  isSpinning?: boolean;
  showArcs?: boolean;
}

// Target speed: 360° / (12s × 60fps) — matches original 12-second CSS revolution
const TARGET_DEG_PER_FRAME = 360 / (12 * 60);
const ACCEL = 0.035;  // ramp-up factor  (~1.4s to full speed)
const DECEL = 0.022;  // ramp-down factor (~2.0s to full stop — inertia feel)

export function Disc({ size = 835, isSpinning = false, showArcs = false }: DiscProps) {
  const cx = size / 2;
  const cy = size / 2;

  const hubR = 104.5 * (size / 835);
  const hubSize = 209 * (size / 835);

  // Physics refs — survive re-renders without causing them
  const svgRef = useRef<SVGSVGElement>(null);
  const angleRef = useRef(0);
  const speedRef = useRef(0);
  const isSpinningRef = useRef(isSpinning);

  // Keep ref in sync with prop without restarting the loop
  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  // Single persistent RAF loop for the lifetime of this component
  useEffect(() => {
    let frameId: number;

    const animate = () => {
      const target = isSpinningRef.current ? TARGET_DEG_PER_FRAME : 0;
      const lerp = speedRef.current < target ? ACCEL : DECEL;
      speedRef.current += (target - speedRef.current) * lerp;

      if (speedRef.current > 0.002) {
        angleRef.current = (angleRef.current + speedRef.current) % 360;
        if (svgRef.current) {
          svgRef.current.style.transform = `rotate(${angleRef.current}deg)`;
        }
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []); // mount once, reads isSpinningRef dynamically

  const arcs: Array<{ d: string; strokeW: number }> = [];

  if (showArcs) {
    const numPairs = 4;
    const innerEdge = hubR + 24 * (size / 835);
    const outerEdge = (size / 2) - 60 * (size / 835);
    const range = outerEdge - innerEdge;

    for (let i = 1; i < numPairs; i++) {
      const t = i / (numPairs - 1);
      const R = innerEdge + t * range;
      const effectiveT = Math.min(t, 2 / 3);
      const strokeW = Math.max(1.5, (5 - effectiveT * 3) * (size / 835));

      const a1x1 = cx + R, a1y1 = cy, a1x2 = cx, a1y2 = cy + R;
      const a2x1 = cx - R, a2y1 = cy, a2x2 = cx, a2y2 = cy - R;

      arcs.push(
        { d: `M ${a1x1} ${a1y1} A ${R} ${R} 0 0 1 ${a1x2} ${a1y2}`, strokeW },
        { d: `M ${a2x1} ${a2y1} A ${R} ${R} 0 0 1 ${a2x2} ${a2y2}`, strokeW },
      );
    }
  }

  return (
    <div className={styles.wrapper} style={{ width: size, height: size }}>
      {showArcs && arcs.length > 0 && (
        <svg
          ref={svgRef}
          className={styles.arcs}
          viewBox={`0 0 ${size} ${size}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {arcs.map((arc, i) => (
            <path
              key={i}
              d={arc.d}
              fill="none"
              stroke="rgba(0,0,0,0.30)"
              strokeWidth={arc.strokeW}
              strokeLinecap="round"
            />
          ))}
        </svg>
      )}

      <div
        className={styles.hub}
        style={{ width: hubSize, height: hubSize }}
      />
    </div>
  );
}
