interface VolumeControlProps {
  onVolumeUp: () => void;
  onVolumeDown: () => void;
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

  const iconStyle: React.CSSProperties = {
    rotate: '45deg',
    fontSize: 38,
    fontWeight: 900,
    lineHeight: 1,
    color: 'rgba(0,0,0,0.50)',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
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
        <span style={iconStyle}>−</span>
      </div>

      {/* Plus button */}
      <div
        style={{ ...btnStyle, left: pillW - btnOffset - btnSize }}
        onClick={(e) => { e.stopPropagation(); onVolumeUp(); }}
      >
        <span style={iconStyle}>+</span>
      </div>
    </div>
  );
}
