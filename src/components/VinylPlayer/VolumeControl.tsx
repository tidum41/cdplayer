import React from 'react';

interface VolumeControlProps {
  onVolumeUp: () => void;
  onVolumeDown: () => void;
}

function MinusIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ transform: 'rotate(45deg)', display: 'block' }}>
      <rect x="5" y="12.5" width="18" height="3.5" rx="1.75" fill="rgba(0,0,0,0.52)" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ transform: 'rotate(45deg)', display: 'block' }}>
      <rect x="5" y="12.5" width="18" height="3.5" rx="1.75" fill="rgba(0,0,0,0.52)" />
      <rect x="12.5" y="5" width="3.5" height="18" rx="1.75" fill="rgba(0,0,0,0.52)" />
    </svg>
  );
}

export function VolumeControl({ onVolumeUp, onVolumeDown }: VolumeControlProps) {
  const pillW = 210;
  const pillH = 96;
  const btnSize = 78;
  const btnOffset = 9;

  const btnStyle: React.CSSProperties = {
    position: 'absolute',
    top: btnOffset,
    width: btnSize,
    height: btnSize,
    backgroundColor: '#C8C8C8',
    borderRadius: 'calc(infinity * 1px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid rgba(0,0,0,0.22)',
    boxShadow: 'rgba(255,255,255,0.20) 0px 2px 0px inset, rgba(0,0,0,0.12) 0px -2px 0px inset',
    cursor: 'pointer',
    zIndex: 2,
  };

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: pillW,
      height: pillH,
      translate: '672px 956px',
      rotate: '-45deg',
      transformOrigin: '0% 0%',
      borderRadius: 'calc(infinity * 1px)',
      outline: '2px solid #000000',
    }}>
      {/* Pill fill — no pointer events so clicks pass through to buttons */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#B2B2B2',
        borderRadius: 'calc(infinity * 1px)',
        boxShadow: 'rgba(255,255,255,0.18) 0px 2px 0px inset, rgba(0,0,0,0.15) 0px -2px 0px inset',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Minus button */}
      <div
        style={{ ...btnStyle, left: btnOffset }}
        onClick={(e) => { e.stopPropagation(); onVolumeDown(); }}
      >
        <MinusIcon />
      </div>

      {/* Plus button */}
      <div
        style={{ ...btnStyle, left: pillW - btnOffset - btnSize }}
        onClick={(e) => { e.stopPropagation(); onVolumeUp(); }}
      >
        <PlusIcon />
      </div>
    </div>
  );
}
