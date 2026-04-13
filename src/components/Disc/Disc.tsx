import { useRef, useEffect, useCallback } from 'react';
import styles from './Disc.module.css';

interface DiscProps {
  size?: number;
  isSpinning?: boolean;
  showArcs?: boolean;
  onEject?: () => void;
  onScratch?: (degPerMs: number) => void;
}

// Slightly slower — 16-second revolution at 60fps
const TARGET_DEG_PER_FRAME = 360 / (16 * 60);
const ACCEL = 0.032;  // ramp-up
const DECEL = 0.020;  // ramp-down (inertia)

export function Disc({
  size = 835,
  isSpinning = false,
  showArcs = false,
  onEject,
  onScratch,
}: DiscProps) {
  const cx = size / 2;
  const cy = size / 2;
  const hubR = 104.5 * (size / 835);
  const hubSize = 209 * (size / 835);

  // Physics refs
  const svgRef = useRef<SVGSVGElement>(null);
  const angleRef = useRef(0);
  const speedRef = useRef(0);
  const isSpinningRef = useRef(isSpinning);

  // Scratch refs
  const isScratchingRef = useRef(false);
  const lastScratchAngleRef = useRef(0);
  const lastScratchTimeRef = useRef(0);
  const scratchVelRef = useRef(0); // deg/ms during scratch

  useEffect(() => { isSpinningRef.current = isSpinning; }, [isSpinning]);

  // ── Persistent RAF physics loop ──────────────────────────────────────────
  useEffect(() => {
    let frameId: number;

    const animate = () => {
      if (!isScratchingRef.current) {
        // Normal physics: lerp toward target speed
        const target = isSpinningRef.current ? TARGET_DEG_PER_FRAME : 0;
        const lerp = speedRef.current < target ? ACCEL : DECEL;
        speedRef.current += (target - speedRef.current) * lerp;
        if (speedRef.current > 0.002) {
          angleRef.current = (angleRef.current + speedRef.current) % 360;
        }
      }
      // Always write current angle to DOM (scratch updates angleRef directly)
      if (svgRef.current) {
        svgRef.current.style.transform = `rotate(${angleRef.current}deg)`;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // ── Scratch helpers ──────────────────────────────────────────────────────
  const getAngleFromCenter = (clientX: number, clientY: number, rect: DOMRect) => {
    const dx = clientX - (rect.left + rect.width  / 2);
    const dy = clientY - (rect.top  + rect.height / 2);
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const getDistFromCenter = (clientX: number, clientY: number, rect: DOMRect) => {
    const dx = clientX - (rect.left + rect.width  / 2);
    const dy = clientY - (rect.top  + rect.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  };

  // ── Pointer handlers (only active when disc is loaded) ───────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!showArcs) return;
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    isScratchingRef.current = true;
    lastScratchAngleRef.current = getAngleFromCenter(e.clientX, e.clientY, rect);
    lastScratchTimeRef.current = e.timeStamp;
    scratchVelRef.current = 0;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, [showArcs]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScratchingRef.current) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();

    // Drag far enough outside platter → eject
    const dist = getDistFromCenter(e.clientX, e.clientY, rect);
    if (dist > rect.width / 2 * 1.2) {
      isScratchingRef.current = false;
      try { (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId); } catch {}
      speedRef.current = 0;
      onScratch?.(0);
      onEject?.();
      return;
    }

    const newAngle = getAngleFromCenter(e.clientX, e.clientY, rect);
    let delta = newAngle - lastScratchAngleRef.current;
    // Wrap-around
    if (delta >  180) delta -= 360;
    if (delta < -180) delta += 360;

    const dt = e.timeStamp - lastScratchTimeRef.current;
    if (dt > 0) {
      // Smooth velocity with EMA
      const raw = delta / dt;
      scratchVelRef.current = scratchVelRef.current * 0.5 + raw * 0.5;
    }

    angleRef.current = (angleRef.current + delta) % 360;
    lastScratchAngleRef.current = newAngle;
    lastScratchTimeRef.current = e.timeStamp;

    onScratch?.(scratchVelRef.current);
  }, [onEject, onScratch]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScratchingRef.current) return;
    isScratchingRef.current = false;
    // Convert deg/ms → deg/frame (≈16.67ms at 60fps) and hand off to physics
    const frameVel = scratchVelRef.current * 16.67;
    speedRef.current = Math.max(-TARGET_DEG_PER_FRAME * 6, Math.min(TARGET_DEG_PER_FRAME * 6, frameVel));
    onScratch?.(0);
    void e; // suppress unused warning
  }, [onScratch]);

  // ── Arc geometry ─────────────────────────────────────────────────────────
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
    <div
      className={styles.wrapper}
      style={{
        width: size,
        height: size,
        cursor: showArcs ? 'grab' : 'default',
      }}
      onPointerDown={showArcs ? handlePointerDown : undefined}
      onPointerMove={showArcs ? handlePointerMove : undefined}
      onPointerUp={showArcs ? handlePointerUp : undefined}
      onPointerCancel={showArcs ? handlePointerUp : undefined}
    >
      {showArcs && arcs.length > 0 && (
        <svg
          ref={svgRef}
          className={styles.arcs}
          viewBox={`0 0 ${size} ${size}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ pointerEvents: 'none' }} // wrapper handles all events
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
        style={{ width: hubSize, height: hubSize, pointerEvents: 'none' }}
      />
    </div>
  );
}
