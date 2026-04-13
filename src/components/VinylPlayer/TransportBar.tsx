import styles from './TransportBar.module.css';

interface TransportBarProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEject: () => void;
  hasDisc: boolean;
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

export function TransportBar({ isPlaying, onPlay, onPause, onEject, hasDisc }: TransportBarProps) {
  return (
    <div className={styles.bar}>
      <button className={`${styles.btn} ${styles.btnFirst}`} onClick={onPause}>
        <div className={styles.orangeDot} />
        <PauseIcon />
      </button>

      <button className={`${styles.btn} ${styles.btnMid}`} onClick={onPlay}>
        <PlayIcon />
      </button>

      <button className={`${styles.btn} ${styles.btnThird}`} onClick={onEject} disabled={!hasDisc}>
        <EjectIcon />
      </button>

      {/* Audio visualizer section */}
      <div className={styles.vizSection}>
        <div className={styles.vizBar}>
          <div className={`${styles.vizFill} ${styles.vizFill1} ${isPlaying ? styles.vizActive : ''}`} />
        </div>
        <div className={styles.vizBar}>
          <div className={`${styles.vizFill} ${styles.vizFill2} ${isPlaying ? styles.vizActive : ''}`} />
        </div>
      </div>
    </div>
  );
}
