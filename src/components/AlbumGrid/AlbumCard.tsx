import { useDraggable } from '@dnd-kit/core';
import type { Album } from '../../data/albums';
import styles from './AlbumCard.module.css';

type DragDir = 'left' | 'right' | 'up' | 'down' | null;

interface AlbumCardProps {
  album: Album;
  isActive: boolean;
  artSize: number;
  resolvedColor?: string;
  onTap?: (album: Album) => void;
  dragDirection?: DragDir;
}

export function AlbumCard({ album, isActive, artSize, resolvedColor, onTap, dragDirection }: AlbumCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: album.id,
    data: { album },
  });

  const handleClick = () => {
    onTap?.(album);
  };

  return (
    <div
      ref={setNodeRef}
      className={`${styles.card} ${isDragging ? styles.dragging : ''} ${isActive ? styles.active : ''}`}
      {...attributes}
      {...listeners}
      onClick={handleClick}
    >
      <div
        className={styles.artWrap}
        style={{ width: artSize, height: artSize }}
      >
        {/* Album art — z-index 1001 when dragging so it sits ABOVE the fixed disc (z-index 1000),
            creating the illusion that the disc emerges from behind this cover */}
        <div
          className={styles.art}
          style={{
            backgroundColor: resolvedColor ?? album.color,
            backgroundImage: album.artUrl ? `url(${album.artUrl})` : undefined,
            // When dragging and direction established: raise above fixed disc so cover hides its origin
            zIndex: isDragging && dragDirection !== null ? 1001 : 1,
          }}
        />
      </div>
      <div className={styles.meta}>
        <span className={styles.title}>{album.title}</span>
        <span className={styles.artist}>{album.artist}</span>
      </div>
    </div>
  );
}
