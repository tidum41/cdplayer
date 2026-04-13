import { albums } from '../../data/albums';
import { AlbumCard } from './AlbumCard';

interface AlbumGridProps {
  activeAlbumId: string | null;
  gridHeight: number;
  artSize: number;
}

const GRID_GAP = 14;

export function AlbumGrid({ activeAlbumId, gridHeight, artSize }: AlbumGridProps) {
  const gridWidth = artSize * 3 + GRID_GAP * 2;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, ${artSize}px)`,
      gridAutoRows: 'auto',
      gap: GRID_GAP,
      width: gridWidth,
      height: gridHeight > 0 ? gridHeight : undefined,
      alignContent: 'start',
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
