import { useDroppable } from '@dnd-kit/core';
import type { Album } from '../../data/albums';
import { Disc } from '../Disc/Disc';
import styles from './Platter.module.css';

interface PlatterProps {
  activeAlbum: Album | null;
  isPlaying: boolean;
  snapAnim: boolean;
  ejectAnim: boolean;
  speedMultiplier?: number;
  onEject?: () => void;
  onScratch?: (degPerMs: number) => void;
  onEjectDragMove?: (clientX: number, clientY: number) => void;
  onEjectDragCancel?: () => void;
}

export function Platter({ activeAlbum, isPlaying, snapAnim, ejectAnim, speedMultiplier = 1, onEject, onScratch, onEjectDragMove, onEjectDragCancel }: PlatterProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'platter' });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.platter} ${isOver ? styles.over : ''} ${snapAnim ? styles.snapIn : ''}`}
    >
      <div className={`${styles.discWrapper} ${ejectAnim ? styles.snapOut : ''}`}>
        <Disc
          size={835}
          isSpinning={isPlaying && !!activeAlbum}
          showArcs={!!activeAlbum}
          speedMultiplier={speedMultiplier}
          onEject={onEject}
          onScratch={onScratch}
          onEjectDragMove={onEjectDragMove}
          onEjectDragCancel={onEjectDragCancel}
        />
      </div>
    </div>
  );
}
