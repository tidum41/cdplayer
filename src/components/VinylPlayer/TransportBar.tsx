import { useEffect, useRef, useState } from 'react';
import styles from './TransportBar.module.css';

interface TransportBarProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEject: () => void;
  hasDisc: boolean;
  analyserRef?: React.RefObject<AnalyserNode | null>;
}

function PauseIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 44 44" fill="none">
      <rect x="11" y="10" width="8" height="24" rx="2.5" fill="rgba(0,0,0,0.62)" />
      <rect x="25" y="10" width="8" height="24" rx="2.5" fill="rgba(0,0,0,0.62)" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 44 44" fill="none">
      <path d="M13 8L36 22L13 36V8Z" fill="rgba(0,0,0,0.62)" />
    </svg>
  );
}

function EjectIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 44 44" fill="none">
      <path d="M22 9L34 25H10L22 9Z" fill="rgba(0,0,0,0.62)" />
      <rect x="10" y="29" width="24" height="6" rx="2" fill="rgba(0,0,0,0.62)" />
    </svg>
  );
}

// 2 bars covering bass + treble
const NUM_BARS = 2;
const FREQ_BINS = [3, 14];

export function TransportBar({ isPlaying, onPlay, onPause, onEject, hasDisc, analyserRef }: TransportBarProps) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const dataRef = useRef<Uint8Array | null>(null);
  const [pressed, setPressed] = useState<'pause' | 'play' | 'eject' | null>(null);

  useEffect(() => {
    const analyser = analyserRef?.current;

    if (!isPlaying || !hasDisc || !analyser) {
      cancelAnimationFrame(rafRef.current);
      barRefs.current.forEach((bar) => {
        if (bar) bar.style.height = `8%`;
      });
      return;
    }

    if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
      dataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    }

    const animate = () => {
      analyser.getByteFrequencyData(dataRef.current! as Uint8Array<ArrayBuffer>);
      barRefs.current.forEach((bar, i) => {
        if (!bar) return;
        const bin = FREQ_BINS[i] ?? 4;
        const raw = dataRef.current![bin] ?? 0;
        const normalized = raw / 255;
        // More reactive: lower power curve so quiet signals still show movement
        const amplified = Math.pow(normalized, 0.42) * 1.3;
        const pct = 8 + Math.min(amplified, 1) * 88;
        bar.style.height = `${pct}%`;
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, hasDisc, analyserRef]);

  return (
    <div className={styles.bar}>
      <button
        className={`${styles.btn} ${styles.btnFirst} ${pressed === 'pause' ? styles.btnPressed : ''}`}
        onPointerDown={() => setPressed('pause')}
        onPointerUp={() => setPressed(null)}
        onPointerLeave={() => setPressed(null)}
        onTouchStart={(e) => { e.preventDefault(); setPressed('pause'); }}
        onTouchEnd={() => { setPressed(null); onPause(); }}
        onClick={onPause}
      >
        <div className={styles.orangeDot} />
        <PauseIcon />
      </button>

      <button
        className={`${styles.btn} ${styles.btnMid} ${pressed === 'play' ? styles.btnPressed : ''}`}
        onPointerDown={() => setPressed('play')}
        onPointerUp={() => setPressed(null)}
        onPointerLeave={() => setPressed(null)}
        onTouchStart={(e) => { e.preventDefault(); setPressed('play'); }}
        onTouchEnd={() => { setPressed(null); onPlay(); }}
        onClick={onPlay}
      >
        <PlayIcon />
      </button>

      <button
        className={`${styles.btn} ${styles.btnThird} ${pressed === 'eject' ? styles.btnPressed : ''}`}
        onPointerDown={() => !hasDisc ? null : setPressed('eject')}
        onPointerUp={() => setPressed(null)}
        onPointerLeave={() => setPressed(null)}
        onTouchStart={(e) => { if (!hasDisc) return; e.preventDefault(); setPressed('eject'); }}
        onTouchEnd={() => { setPressed(null); if (hasDisc) onEject(); }}
        onClick={onEject}
        disabled={!hasDisc}
      >
        <EjectIcon />
      </button>

      {/* Audio visualizer section */}
      <div className={styles.vizSection}>
        <div className={styles.vizBars}>
          {Array.from({ length: NUM_BARS }).map((_, i) => (
            <div key={i} className={`${styles.vizBar} ${styles[`vizBar${i + 1}` as keyof typeof styles]}`}>
              <div
                ref={el => { barRefs.current[i] = el; }}
                className={`${styles.vizFill} ${isPlaying && !analyserRef?.current ? styles.vizActive : ''} ${styles[`vizFill${i + 1}` as keyof typeof styles]}`}
                style={{ height: `8%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
