import { useRef } from 'react';
import { Album, albums } from '../../data/albums';
import { AlbumCard } from './AlbumCard';
import appStyles from '../../App.module.css';

interface AlbumGridProps {
  activeAlbumId: string | null;
  gridWidth?: number;
  artSize: number;
  colorMap?: Record<string, string>;
  isCarousel?: boolean;
  onAlbumTap?: (album: Album) => void;
}

const GRID_GAP = 14;

export function AlbumGrid({ activeAlbumId, gridWidth, artSize, colorMap, isCarousel, onAlbumTap }: AlbumGridProps) {
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
    // 16px padding inside carousel container + half of the 140px artSize = 86px top
    return (
      <div className={appStyles.carouselWrap}>
        <button className={`${appStyles.carouselNav} ${appStyles.carouselNavLeft}`} style={{ top: '86px' }} onClick={scrollLeft} aria-label="Scroll left">
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
              />
            </div>
          ))}
        </div>

        <button className={`${appStyles.carouselNav} ${appStyles.carouselNavRight}`} style={{ top: '86px' }} onClick={scrollRight} aria-label="Scroll right">
          <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
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
        />
      ))}
    </div>
  );
}
