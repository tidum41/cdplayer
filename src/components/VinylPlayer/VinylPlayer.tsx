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
  volume?: number;
  analyserRef?: React.RefObject<AnalyserNode | null>;
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
  volume = 0.7,
  analyserRef,
}: VinylPlayerProps) {
  return (
    <div className={styles.playerCard}>
      <Platter activeAlbum={activeAlbum} isPlaying={isPlaying} snapAnim={snapAnim} />
      <DateBadge activeAlbum={activeAlbum} isPlaying={isPlaying} isLoading={isLoading} volume={volume} />
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
