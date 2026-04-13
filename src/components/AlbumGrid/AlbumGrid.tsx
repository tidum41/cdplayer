import { albums } from '../../data/albums';
import { AlbumCard } from './AlbumCard';

interface AlbumGridProps {
  activeAlbumId: string | null;
  gridHeight: number;
  artSize: number;
  mode?: 'grid' | 'strip';
}

const GRID_GAP = 14;

export function AlbumGrid({ activeAlbumId, gridHeight, artSize, mode = 'grid' }: AlbumGridProps) {
  if (mode === 'strip') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: GRID_GAP,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '4px 20px 12px',
        width: '100%',
        flexShrink: 0,
        // Hide scrollbar visually
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      } as React.CSSProperties}>
        {albums.map(album => (
          <AlbumCard
            key={album.id}
            album={album}
            isActive={album.id === activeAlbumId}
            artSize={artSize}
          />
        ))}
      </div>
    );
  }

  const gridWidth = artSize * 3 + GRID_GAP * 2;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, ${artSize}px)`,
      gridAutoRows: `${artSize + 30}px`,
      gap: GRID_GAP,
      width: gridWidth,
      height: gridHeight > 0 ? gridHeight : undefined,
      alignContent: 'start',
      overflow: 'hidden',
    }}>
      {albums.map(album => (
        <AlbumCard
          key={album.id}
          album={album}
          isActive={album.id === activeAlbumId}
          artSize={artSize}
        />
      ))}
    </div>
  );
}
