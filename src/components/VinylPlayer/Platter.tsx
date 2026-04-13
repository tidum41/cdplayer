import { useDroppable } from '@dnd-kit/core';
import type { Album } from '../../data/albums';
import { Disc } from '../Disc/Disc';
import styles from './Platter.module.css';

interface PlatterProps {
  activeAlbum: Album | null;
  isPlaying: boolean;
  snapAnim: boolean;
}

export function Platter({ activeAlbum, isPlaying, snapAnim }: PlatterProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'platter' });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.platter} ${isOver ? styles.over : ''} ${snapAnim ? styles.snapIn : ''}`}
    >
      {/* Disc always visible; arcs only when an album is loaded */}
      <Disc
        size={835}
        isSpinning={isPlaying && !!activeAlbum}
        showArcs={!!activeAlbum}
      />
    </div>
  );
}
