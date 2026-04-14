import { useState, useEffect, useRef } from 'react';
import type { Album } from '../../data/albums';
import styles from './DateBadge.module.css';

/** Blocky retro speaker — pixel-art feel, matches IBM Plex Mono aesthetic */
function RetroSpeakerIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden>
      {/* Speaker body */}
      <rect x="1" y="8" width="5" height="8" rx="0.5" fill="rgba(255,255,255,0.80)" />
      {/* Cone */}
      <polygon points="6,8 12,4 12,20 6,16" fill="rgba(255,255,255,0.80)" />
      {/* Wave 1 */}
      <path d="M14.5 9 Q17 12 14.5 15" stroke="rgba(255,255,255,0.60)" strokeWidth="1.8" fill="none" strokeLinecap="square" strokeLinejoin="miter" />
      {/* Wave 2 */}
      <path d="M17 6.5 Q21 12 17 17.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8" fill="none" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

/** Needle/scratch icon */
function ScratchIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      {/* Disc outline */}
      <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
      {/* Inner hub */}
      <circle cx="12" cy="12" r="2.5" fill="rgba(255,255,255,0.70)" />
      {/* Needle arm */}
      <line x1="18" y1="3" x2="13" y2="10" stroke="rgba(255,255,255,0.90)" strokeWidth="2" strokeLinecap="round" />
      {/* Needle tip dot */}
      <circle cx="13" cy="10" r="1.2" fill="rgba(255,255,255,0.90)" />
    </svg>
  );
}

interface DateBadgeProps {
  activeAlbum: Album | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume?: number;
  /** Current audio playback rate: 1 = normal, >1 fast-forward, <0 rewind */
  scratchRate?: number;
}

function formatDate(d: Date) {
  const day = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(2);
  return { day, date: `${mm}.${dd}.${yy}` };
}

function formatElapsed(secs: number) {
  const neg = secs < 0;
  const s = Math.abs(Math.round(secs));
  const mins = String(Math.floor(s / 60)).padStart(2, '0');
  const rem  = String(s % 60).padStart(2, '0');
  return `${neg ? '-' : ''}${mins}:${rem}`;
}

export function DateBadge({ activeAlbum, isPlaying, isLoading, volume = 0.7, scratchRate = 1 }: DateBadgeProps) {
  const [now, setNow] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const [showSong, setShowSong] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const prevAlbumId = useRef<string | null>(null);
  const prevVolume = useRef(volume);
  const volumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use a ref for elapsed so the RAF callback always sees the latest value
  const elapsedRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Reset elapsed when album changes
  useEffect(() => {
    if (activeAlbum?.id !== prevAlbumId.current) {
      elapsedRef.current = 0;
      setElapsed(0);
      prevAlbumId.current = activeAlbum?.id ?? null;
    }
  }, [activeAlbum]);

  // RAF-driven elapsed ticker — rate mirrors audio playback rate when scratching
  useEffect(() => {
    const isScratching = scratchRate !== 1;
    const shouldTick = isPlaying || isScratching;

    if (!shouldTick) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
        lastTickRef.current = null;
      }
      return;
    }

    const tick = (now: number) => {
      if (lastTickRef.current !== null) {
        const dt = (now - lastTickRef.current) / 1000; // seconds
        elapsedRef.current = elapsedRef.current + dt * scratchRate;
        setElapsed(elapsedRef.current);
      }
      lastTickRef.current = now;
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      lastTickRef.current = null;
    };
  }, [isPlaying, scratchRate]);

  useEffect(() => {
    if (!activeAlbum) {
      setShowSong(false);
      return;
    }
    const id = setInterval(() => setShowSong(s => !s), 7000);
    return () => clearInterval(id);
  }, [activeAlbum]);

  // Show volume % briefly when volume changes
  useEffect(() => {
    if (prevVolume.current !== volume) {
      prevVolume.current = volume;
      setShowVolume(true);
      if (volumeTimer.current) clearTimeout(volumeTimer.current);
      volumeTimer.current = setTimeout(() => setShowVolume(false), 1500);
    }
  }, [volume]);

  const { day, date } = formatDate(now);
  const timeStr = formatElapsed(elapsed);
  const volPct = `${Math.round(volume * 100)}%`;

  const isScratching = scratchRate !== 1;

  const line1 = showSong && activeAlbum ? activeAlbum.title : day;
  const line2 = showSong && activeAlbum ? activeAlbum.artist : date;

  return (
    <div className={styles.badge}>
      <div className={styles.display}>
        {isLoading ? (
          <div className={styles.loadingBlock}>
            <div className={styles.eqBars}>
              <div className={`${styles.eqBar} ${styles.eq1}`} />
              <div className={`${styles.eqBar} ${styles.eq2}`} />
              <div className={`${styles.eqBar} ${styles.eq3}`} />
              <div className={`${styles.eqBar} ${styles.eq4}`} />
              <div className={`${styles.eqBar} ${styles.eq5}`} />
              <div className={`${styles.eqBar} ${styles.eq6}`} />
              <div className={`${styles.eqBar} ${styles.eq7}`} />
            </div>
          </div>
        ) : isScratching ? (
          <div className={styles.scratchBlock} key="scratch">
            <ScratchIcon />
            <span className={styles.scratchTime}>{timeStr}</span>
          </div>
        ) : showVolume ? (
          <div className={styles.volBlock} key={`vol-${volPct}`}>
            <RetroSpeakerIcon />
            <span className={styles.volPct}>{volPct}</span>
          </div>
        ) : (
          <div className={styles.textBlock} key={showSong ? 'song' : 'date'}>
            <div className={styles.line1}>{line1}</div>
            <div className={styles.line2Row}>
              <span className={styles.line2}>{line2}</span>
              {activeAlbum && (
                <span className={styles.elapsed}>{timeStr}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
