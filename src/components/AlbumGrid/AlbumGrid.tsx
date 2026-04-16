import { useRef } from 'react';
import { Album, albums } from '../../data/albums';
import { AlbumCard } from './AlbumCard';
import appStyles from '../../App.module.css';

type DragDir = 'left' | 'right' | 'up' | 'down' | null;

interface AlbumGridProps {
  activeAlbumId: string | null;
  gridWidth?: number;
  artSize: number;
  colorMap?: Record<string, string>;
  isCarousel?: boolean;
  onAlbumTap?: (album: Album) => void;
  dragDirection?: DragDir;
  showHint?: boolean;
}

const GRID_GAP = 14;

export function AlbumGrid({ activeAlbumId, gridWidth, artSize, colorMap, isCarousel, onAlbumTap, dragDirection, showHint }: AlbumGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -(artSize + 16), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: artSize + 16, behavior: 'smooth' });
    }
  };

  if (isCarousel) {
    const arrowTop = 16 + artSize / 2;
    return (
      <div style={{ width: '100%' }}>
        {/* Vertical hint lives here — always reserves space so carousel never shifts */}
        <div
          className={appStyles.dragHintV}
          style={{ opacity: showHint ? 1 : 0 }}
          aria-hidden="true"
        >
          <svg className={appStyles.dragHintDisc} width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.9"/>
            <circle cx="8" cy="8" r="4.3" stroke="currentColor" strokeWidth="0.6" fill="none"/>
            <circle cx="8" cy="8" r="1.6" fill="currentColor"/>
          </svg>
          <svg className={appStyles.dragHintArrow} width="9" height="11" viewBox="0 0 9 11" fill="none">
            <path d="M4.5 10V1M4.5 1L1 4.5M4.5 1L8 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>drag to play</span>
        </div>

        <div className={appStyles.carouselWrap}>
          <button className={`${appStyles.carouselNav} ${appStyles.carouselNavLeft}`} style={{ top: arrowTop }} onClick={scrollLeft} aria-label="Scroll left">
            <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div className={appStyles.carouselContainer} ref={scrollRef}>
            {albums.map(album => (
              <div key={album.id} style={{ scrollSnapAlign: 'center', flexShrink: 0, width: artSize }}>
                <AlbumCard
                  album={album}
                  isActive={album.id === activeAlbumId}
                  artSize={artSize}
                  resolvedColor={colorMap?.[album.id]}
                  onTap={onAlbumTap}
                  dragDirection={dragDirection}
                />
              </div>
            ))}
          </div>

          <button className={`${appStyles.carouselNav} ${appStyles.carouselNavRight}`} style={{ top: arrowTop }} onClick={scrollRight} aria-label="Scroll right">
            <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    );
  }

  // Original Grid logic
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, ${artSize}px)`,
      gridAutoRows: 'auto',
      gap: GRID_GAP,
      width: gridWidth,
      alignContent: 'start',
    }}>
      {albums.map(album => (
        <AlbumCard
          key={album.id}
          album={album}
          isActive={album.id === activeAlbumId}
          artSize={artSize}
          resolvedColor={colorMap?.[album.id]}
          onTap={onAlbumTap}
          dragDirection={dragDirection}
        />
      ))}
    </div>
  );
}
