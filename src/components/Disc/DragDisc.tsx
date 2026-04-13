/**
 * Lightweight drag-ghost disc: donut shape with transparent center hole.
 * No border outline, no arcs. Just a flat ring using the album's color.
 */

interface DragDiscProps {
  size: number;
  color?: string;
}

export function DragDisc({ size, color = '#B0B0B0' }: DragDiscProps) {
  const cx = size / 2;
  const holeR = size * 0.125; // center hole radius
  const discR = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Donut: disc fill with hole punched out via evenodd */}
      <path
        fillRule="evenodd"
        d={[
          // Outer circle CW
          `M ${cx + discR} ${cx}`,
          `A ${discR} ${discR} 0 1 1 ${cx - discR} ${cx}`,
          `A ${discR} ${discR} 0 1 1 ${cx + discR} ${cx}`,
          `Z`,
          // Inner hole CCW (punch-out)
          `M ${cx + holeR} ${cx}`,
          `A ${holeR} ${holeR} 0 1 0 ${cx - holeR} ${cx}`,
          `A ${holeR} ${holeR} 0 1 0 ${cx + holeR} ${cx}`,
          `Z`,
        ].join(' ')}
        fill={color}
        fillOpacity={0.85}
      />
    </svg>
  );
}
