import { useDraggable } from '@dnd-kit/core';
import type { Album } from '../../data/albums';
import { DragDisc } from '../Disc/DragDisc';
import styles from './AlbumCard.module.css';

type DragDir = 'left' | 'right' | 'up' | 'down' | null;

interface AlbumCardProps {
  album: Album;
  isActive: boolean;
  artSize: number;
  resolvedColor?: string;
  onTap?: (album: Album) => void;
  dragDirection?: DragDir;
  dragDelta?: { x: number; y: number };
  dragDiscSize?: number;
}

export function AlbumCard({ album, isActive, artSize, resolvedColor, onTap, dragDirection, dragDelta, dragDiscSize }: AlbumCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: album.id,
    data: { album },
  });

  const handleClick = () => {
    onTap?.(album);
  };

  // Disc peek: only becomes visible once a direction is established (>8px threshold).
  // Position is calculated so the disc center follows the cursor exactly from its
  // starting position behind the cover. Grows toward platter size as it approaches.
  const directionLocked = isDragging && dragDirection !== null;
  const discSize = isDragging ? (dragDiscSize ?? artSize) : artSize;
  const deltaX = directionLocked ? (dragDelta?.x ?? 0) : 0;
  const deltaY = directionLocked ? (dragDelta?.y ?? 0) : 0;
  // Disc positioned so its center sits at artWrap center + drag delta
  const peekLeft = artSize / 2 + deltaX - discSize / 2;
  const peekTop  = artSize / 2 + deltaY - discSize / 2;

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
        {/* Disc peek — tracks cursor exactly; grows toward platter size as it approaches */}
        <div
          className={styles.discPeek}
          style={{
            left: peekLeft,
            top: peekTop,
            width: discSize,
            height: discSize,
            opacity: isDragging ? 1 : 0,
          }}
        >
          <DragDisc size={discSize} color={resolvedColor ?? album.color} />
        </div>
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
