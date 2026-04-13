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

interface DateBadgeProps {
  activeAlbum: Album | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume?: number;
}

function formatDate(d: Date) {
  const day = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(2);
  return { day, date: `${mm}.${dd}.${yy}` };
}

export function DateBadge({ activeAlbum, isPlaying, isLoading, volume = 0.7 }: DateBadgeProps) {
  const [now, setNow] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const [showSong, setShowSong] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const prevAlbumId = useRef<string | null>(null);
  const prevVolume = useRef(volume);
  const volumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (activeAlbum?.id !== prevAlbumId.current) {
      setElapsed(0);
      prevAlbumId.current = activeAlbum?.id ?? null;
    }
  }, [activeAlbum]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    if (!activeAlbum) {
      setShowSong(false);
      return;
    }
    const id = setInterval(() => setShowSong(s => !s), 4000);
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
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  const timeStr = `${mins}:${secs}`;
  const volPct = `${Math.round(volume * 100)}%`;

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
