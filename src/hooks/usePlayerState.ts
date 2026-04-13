import { useState, useCallback } from 'react';
import type { Album } from '../data/albums';

interface PlayerState {
  activeAlbum: Album | null;
  isPlaying: boolean;
  loadAlbum: (album: Album) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  eject: () => void;
}

export function usePlayerState(): PlayerState {
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const loadAlbum = useCallback((album: Album) => {
    setActiveAlbum(album);
  }, []);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const eject = useCallback(() => {
    setActiveAlbum(null);
    setIsPlaying(false);
  }, []);

  return { activeAlbum, isPlaying, loadAlbum, play, pause, togglePlay, eject };
}
