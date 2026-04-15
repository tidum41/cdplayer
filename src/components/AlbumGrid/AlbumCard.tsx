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

function discTransform(isDragging: boolean, dir: DragDir): string {
  if (!isDragging || dir === null) return 'translateX(0)';
  switch (dir) {
    case 'left':  return 'translateX(-36px)';
    case 'right': return 'translateX(36px)';
    case 'up':    return 'translateY(-36px)';
    case 'down':  return 'translateY(36px)';
    default:      return 'translateX(0)';
  }
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
        {/* Disc behind cover — slides in the direction the card is being dragged */}
        <div
          className={styles.discBehind}
          style={{
            backgroundColor: resolvedColor ?? album.color,
            transform: discTransform(isDragging, dragDirection ?? null),
            ...(isDragging && !dragDirection ? { opacity: 0 } : {}),
          }}
        />
        <div
          className={styles.art}
          style={{
            backgroundColor: resolvedColor ?? album.color,
            backgroundImage: album.artUrl ? `url(${album.artUrl})` : undefined,
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
