import React, { useState } from 'react';

interface VolumeControlProps {
  onVolumeUp: () => void;
  onVolumeDown: () => void;
}

function MinusIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 28 28" fill="none" style={{ transform: 'rotate(45deg)', display: 'block' }}>
      <rect x="4" y="12" width="20" height="4" rx="2" fill="rgba(0,0,0,0.58)" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 28 28" fill="none" style={{ transform: 'rotate(45deg)', display: 'block' }}>
      <rect x="4" y="12" width="20" height="4" rx="2" fill="rgba(0,0,0,0.58)" />
      <rect x="12" y="4" width="4" height="20" rx="2" fill="rgba(0,0,0,0.58)" />
    </svg>
  );
}

export function VolumeControl({ onVolumeUp, onVolumeDown }: VolumeControlProps) {
  const [pressedUp, setPressedUp] = useState(false);
  const [pressedDown, setPressedDown] = useState(false);

  const pillW = 210;
  const pillH = 96;
  const btnSize = 78;
  const btnOffset = 9;

  const btnBase: React.CSSProperties = {
    position: 'absolute',
    top: btnOffset,
    width: btnSize,
    height: btnSize,
    borderRadius: 'calc(infinity * 1px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2,
    transition: 'transform 0.05s ease, background-color 0.05s ease, box-shadow 0.05s ease',
    WebkitTapHighlightColor: 'transparent',
  };

  const btnIdle: React.CSSProperties = {
    backgroundColor: '#C6C6C6',
    border: '2px solid rgba(0,0,0,0.22)',
    boxShadow: [
      'rgba(255,255,255,0.36) 0px 2px 0px inset',   // top highlight
      'rgba(0,0,0,0.18) 0px -4px 0px inset',          // bottom depth
      'rgba(0,0,0,0.08) 0px 2px 4px',                 // outer drop shadow
    ].join(', '),
  };

  const btnActive: React.CSSProperties = {
    backgroundColor: '#B8B8B8',
    border: '2px solid rgba(0,0,0,0.30)',
    transform: 'scale(0.94)',
    boxShadow: [
      'rgba(0,0,0,0.26) 0px 4px 0px inset',           // pressed-down inset
      'rgba(0,0,0,0.06) 0px 1px 2px',
    ].join(', '),
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
      outline: '2px solid rgba(0,0,0,0.55)',
      boxShadow: 'rgba(0,0,0,0.22) 0px 4px 8px',
    }}>
      {/* Pill fill */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#ABABAB',
        borderRadius: 'calc(infinity * 1px)',
        boxShadow: [
          'rgba(255,255,255,0.22) 0px 3px 0px inset',
          'rgba(0,0,0,0.22) 0px -5px 0px inset',
        ].join(', '),
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Minus button */}
      <div
        style={{ ...btnBase, ...(pressedDown ? btnActive : btnIdle), left: btnOffset }}
        onPointerDown={() => setPressedDown(true)}
        onPointerUp={() => { setPressedDown(false); onVolumeDown(); }}
        onPointerLeave={() => setPressedDown(false)}
        onTouchStart={(e) => { e.preventDefault(); setPressedDown(true); }}
        onTouchEnd={() => { setPressedDown(false); onVolumeDown(); }}
      >
        <MinusIcon />
      </div>

      {/* Plus button */}
      <div
        style={{ ...btnBase, ...(pressedUp ? btnActive : btnIdle), left: pillW - btnOffset - btnSize }}
        onPointerDown={() => setPressedUp(true)}
        onPointerUp={() => { setPressedUp(false); onVolumeUp(); }}
        onPointerLeave={() => setPressedUp(false)}
        onTouchStart={(e) => { e.preventDefault(); setPressedUp(true); }}
        onTouchEnd={() => { setPressedUp(false); onVolumeUp(); }}
      >
        <PlusIcon />
      </div>
    </div>
  );
}
