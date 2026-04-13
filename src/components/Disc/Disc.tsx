import styles from './Disc.module.css';

interface DiscProps {
  size?: number;
  isSpinning?: boolean;
  showArcs?: boolean;
}

export function Disc({ size = 835, isSpinning = false, showArcs = false }: DiscProps) {
  const cx = size / 2;
  const cy = size / 2;

  const hubR = 104.5 * (size / 835);
  const hubSize = 209 * (size / 835);

  const arcs: Array<{ d: string; strokeW: number }> = [];

  if (showArcs) {
    // 4 pairs = 8 arcs (removed outermost pair)
    const numPairs = 4;
    const innerEdge = hubR + 24 * (size / 835);
    const outerEdge = (size / 2) - 60 * (size / 835); // pulled inward — no edge-hugging arc
    const range = outerEdge - innerEdge;

    for (let i = 0; i < numPairs; i++) {
      const t = i / (numPairs - 1);
      const R = innerEdge + t * range;
      const strokeW = Math.max(1.5, (5 - t * 3) * (size / 835));

      const a1x1 = cx + R;
      const a1y1 = cy;
      const a1x2 = cx;
      const a1y2 = cy + R;

      const a2x1 = cx - R;
      const a2y1 = cy;
      const a2x2 = cx;
      const a2y2 = cy - R;

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
          className={`${styles.arcs} ${isSpinning ? styles.spinning : ''}`}
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
