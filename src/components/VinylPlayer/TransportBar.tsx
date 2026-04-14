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
      <rect x="12" y="10" width="7.5" height="24" rx="2" fill="rgba(0,0,0,0.55)" />
      <rect x="24.5" y="10" width="7.5" height="24" rx="2" fill="rgba(0,0,0,0.55)" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 44 44" fill="none">
      <path d="M14 9L35 22L14 35V9Z" fill="rgba(0,0,0,0.55)" />
    </svg>
  );
}

function EjectIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 44 44" fill="none">
      <path d="M22 10L33 24H11L22 10Z" fill="rgba(0,0,0,0.55)" />
      <rect x="11" y="28" width="22" height="5" rx="1.5" fill="rgba(0,0,0,0.55)" />
    </svg>
  );
}

// Number of visualizer bars
const NUM_BARS = 2;
// Which FFT bins to sample for each bar (low and high freq)
const FREQ_BINS = [3, 12];

export function TransportBar({ isPlaying, onPlay, onPause, onEject, hasDisc, analyserRef }: TransportBarProps) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const dataRef = useRef<Uint8Array | null>(null);
  // Track which button is pressed — CSS :active is skipped for synthetic events
  // (dispatchEvent), so we drive the pressed style via React state instead.
  const [pressed, setPressed] = useState<'pause' | 'play' | 'eject' | null>(null);

  useEffect(() => {
    const analyser = analyserRef?.current;

    if (!isPlaying || !hasDisc || !analyser) {
      cancelAnimationFrame(rafRef.current);
      // Reset bars to idle heights
      barRefs.current.forEach((bar) => {
        if (bar) bar.style.height = `10%`;
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
        const amplified = Math.pow(normalized, 0.55) * 1.15;
        const pct = 6 + Math.min(amplified, 1) * 90;
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
        onClick={onPlay}
      >
        <PlayIcon />
      </button>

      <button
        className={`${styles.btn} ${styles.btnThird} ${pressed === 'eject' ? styles.btnPressed : ''}`}
        onPointerDown={() => !hasDisc ? null : setPressed('eject')}
        onPointerUp={() => setPressed(null)}
        onPointerLeave={() => setPressed(null)}
        onClick={onEject}
        disabled={!hasDisc}
      >
        <EjectIcon />
      </button>

      {/* Audio visualizer section */}
      <div className={styles.vizSection}>
        {Array.from({ length: NUM_BARS }).map((_, i) => (
          <div key={i} className={styles.vizBar}>
            <div
              ref={el => { barRefs.current[i] = el; }}
              className={`${styles.vizFill} ${isPlaying && !analyserRef?.current ? styles.vizActive : ''} ${i === 0 ? styles.vizFill1 : i === 1 ? styles.vizFill2 : ''}`}
              style={{ height: `10%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
