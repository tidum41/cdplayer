import { useState, useEffect, useRef } from 'react';
import type { Album } from '../../data/albums';
import styles from './DateBadge.module.css';

interface DateBadgeProps {
  activeAlbum: Album | null;
  isPlaying: boolean;
  isLoading: boolean;
}

function formatDate(d: Date) {
  const day = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(2);
  return { day, date: `${mm}.${dd}.${yy}` };
}

export function DateBadge({ activeAlbum, isPlaying, isLoading }: DateBadgeProps) {
  const [now, setNow] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const [showSong, setShowSong] = useState(false);
  const prevAlbumId = useRef<string | null>(null);

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

  const { day, date } = formatDate(now);
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  const timeStr = `${mins}:${secs}`;

  const line1 = showSong && activeAlbum ? activeAlbum.title : day;
  const line2 = showSong && activeAlbum ? activeAlbum.artist : date;

  return (
    <div className={styles.badge}>
      <div className={styles.display}>
        {isLoading ? (
          <div className={styles.loadingBlock}>
            {/* Equalizer bars animation — music themed */}
            <div className={styles.eqBars}>
              <div className={`${styles.eqBar} ${styles.eq1}`} />
              <div className={`${styles.eqBar} ${styles.eq2}`} />
              <div className={`${styles.eqBar} ${styles.eq3}`} />
              <div className={`${styles.eqBar} ${styles.eq4}`} />
              <div className={`${styles.eqBar} ${styles.eq5}`} />
            </div>
            <span className={styles.loadingText}>♪ CUEING</span>
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
