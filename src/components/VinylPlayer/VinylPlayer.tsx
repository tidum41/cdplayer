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
  discSpeedMultiplier?: number;
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
  discSpeedMultiplier = 1,
  volume = 0.7,
  analyserRef,
  onScratch,
  scratchRate = 1,
  onEjectDragMove,
  onEjectDragCancel,
}: VinylPlayerProps) {
  return (
    <div className={styles.playerCard}>
      {/* MM-7 model label — top-left, TP-7 style */}
      <div style={{
        position: 'absolute',
        top: 52,
        left: 62,
        fontFamily: '"IBM Plex Mono", "Courier New", monospace',
        fontSize: 38,
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: 'rgba(0,0,0,0.28)',
        userSelect: 'none',
        pointerEvents: 'none',
        lineHeight: 1,
      }}>MM-7</div>
      <Platter
        activeAlbum={activeAlbum}
        isPlaying={isPlaying}
        snapAnim={snapAnim}
        ejectAnim={ejectAnim}
        speedMultiplier={discSpeedMultiplier}
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
