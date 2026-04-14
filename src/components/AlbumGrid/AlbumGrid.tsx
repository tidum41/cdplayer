import { albums } from '../../data/albums';
import { AlbumCard } from './AlbumCard';

interface AlbumGridProps {
  activeAlbumId: string | null;
  gridWidth: number;
  artSize: number;
  colorMap?: Record<string, string>;
}

const GRID_GAP = 14;

export function AlbumGrid({ activeAlbumId, gridWidth, artSize, colorMap }: AlbumGridProps) {
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
        />
      ))}
    </div>
  );
}
