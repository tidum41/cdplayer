import type { Album } from '../../data/albums';
import { Platter } from './Platter';
import { DateBadge } from './DateBadge';
import { VolumeControl } from './VolumeControl';
import { TransportBar } from './TransportBar';
import styles from './VinylPlayer.module.css';

interface VinylPlayerProps {
  activeAlbum: Album | null;
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEject: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  snapAnim: boolean;
  ejectAnim: boolean;
  volume?: number;
  analyserRef?: React.RefObject<AnalyserNode | null>;
  onScratch?: (degPerMs: number) => void;
  scratchRate?: number;
  onEjectDragMove?: (clientX: number, clientY: number) => void;
  onEjectDragCancel?: () => void;
}

export function VinylPlayer({
  activeAlbum,
  isPlaying,
  isLoading,
  onPlay,
  onPause,
  onEject,
  onVolumeUp,
  onVolumeDown,
  snapAnim,
  ejectAnim,
  volume = 0.7,
  analyserRef,
  onScratch,
  scratchRate = 1,
  onEjectDragMove,
  onEjectDragCancel,
}: VinylPlayerProps) {
  return (
    <div className={styles.playerCard}>
      <Platter
        activeAlbum={activeAlbum}
        isPlaying={isPlaying}
        snapAnim={snapAnim}
        ejectAnim={ejectAnim}
        onEject={onEject}
        onScratch={onScratch}
        onEjectDragMove={onEjectDragMove}
        onEjectDragCancel={onEjectDragCancel}
      />
      <DateBadge activeAlbum={activeAlbum} isPlaying={isPlaying} isLoading={isLoading} volume={volume} scratchRate={scratchRate} />
      <VolumeControl onVolumeUp={onVolumeUp} onVolumeDown={onVolumeDown} />
      <TransportBar
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onEject={onEject}
        hasDisc={!!activeAlbum}
        analyserRef={analyserRef}
      />
    </div>
  );
}
