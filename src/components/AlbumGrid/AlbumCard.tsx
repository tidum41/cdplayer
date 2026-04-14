import { useDraggable } from '@dnd-kit/core';
import type { Album } from '../../data/albums';
import styles from './AlbumCard.module.css';

interface AlbumCardProps {
  album: Album;
  isActive: boolean;
  artSize: number;
  resolvedColor?: string;
  onTap?: (album: Album) => void;
}

export function AlbumCard({ album, isActive, artSize, resolvedColor, onTap }: AlbumCardProps) {
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
        {/* Disc that peeks out from behind the cover and slides out when dragging */}
        <div
          className={styles.discBehind}
          style={{ backgroundColor: resolvedColor ?? album.color }}
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
