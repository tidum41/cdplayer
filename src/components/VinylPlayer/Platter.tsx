import { useDroppable } from '@dnd-kit/core';
import type { Album } from '../../data/albums';
import { Disc } from '../Disc/Disc';
import styles from './Platter.module.css';

interface PlatterProps {
  activeAlbum: Album | null;
  isPlaying: boolean;
  snapAnim: boolean;
  onEject?: () => void;
  onScratch?: (degPerMs: number) => void;
  onEjectDragMove?: (clientX: number, clientY: number) => void;
  onEjectDragCancel?: () => void;
}

export function Platter({ activeAlbum, isPlaying, snapAnim, onEject, onScratch, onEjectDragMove, onEjectDragCancel }: PlatterProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'platter' });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.platter} ${isOver ? styles.over : ''} ${snapAnim ? styles.snapIn : ''}`}
    >
      <Disc
        size={835}
        isSpinning={isPlaying && !!activeAlbum}
        showArcs={!!activeAlbum}
        onEject={onEject}
        onScratch={onScratch}
        onEjectDragMove={onEjectDragMove}
        onEjectDragCancel={onEjectDragCancel}
      />
    </div>
  );
}
