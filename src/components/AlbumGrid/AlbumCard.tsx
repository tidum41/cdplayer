import { useDraggable } from '@dnd-kit/core';
import type { Album } from '../../data/albums';
import styles from './AlbumCard.module.css';

interface AlbumCardProps {
  album: Album;
  isActive: boolean;
  artSize: number;
}

export function AlbumCard({ album, isActive, artSize }: AlbumCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: album.id,
    data: { album },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.card} ${isDragging ? styles.dragging : ''} ${isActive ? styles.active : ''}`}
      {...attributes}
      {...listeners}
    >
      <div
        className={styles.artWrap}
        style={{ width: artSize, height: artSize }}
      >
        <div
          className={styles.art}
          style={{
            backgroundColor: album.color,
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
