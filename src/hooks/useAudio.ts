import { useRef, useState, useCallback, useEffect } from 'react';
import type { Album } from '../data/albums';

// Fallback sample tracks when no audioUrl is provided on the album
const FALLBACK_TRACKS: Record<string, string> = {
  '1': 'https://cdn.pixabay.com/audio/2024/11/29/audio_f0a4626ca0.mp3',
  '2': 'https://cdn.pixabay.com/audio/2024/08/27/audio_3f2f67e4db.mp3',
  '3': 'https://cdn.pixabay.com/audio/2022/10/25/audio_d5d3c8d184.mp3',
  '4': 'https://cdn.pixabay.com/audio/2024/09/03/audio_39a8cb2c09.mp3',
  '5': 'https://cdn.pixabay.com/audio/2024/02/14/audio_8cee508e20.mp3',
  '6': 'https://cdn.pixabay.com/audio/2022/05/16/audio_1333dfec84.mp3',
  '7': 'https://cdn.pixabay.com/audio/2023/10/23/audio_3f20632e5f.mp3',
  '8': 'https://cdn.pixabay.com/audio/2022/03/24/audio_53bcfe43c8.mp3',
  '9': 'https://cdn.pixabay.com/audio/2024/01/17/audio_fb68a0b4d5.mp3',
};

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.7);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }
    return audioRef.current;
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  /**
   * Load and play audio for an album.
   * Uses album.audioUrl if provided, otherwise falls back to sample tracks.
   */
  const loadAndPlay = useCallback((album: Album) => {
    const audio = getAudio();
    const src = album.audioUrl || FALLBACK_TRACKS[album.id] || FALLBACK_TRACKS['1'];
    if (audio.src !== src) {
      audio.src = src;
    }
    audio.play().catch(() => {});
  }, [getAudio]);

  const playAudio = useCallback(() => {
    getAudio().play().catch(() => {});
  }, [getAudio]);

  const pauseAudio = useCallback(() => {
    getAudio().pause();
  }, [getAudio]);

  const stopAudio = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    audio.src = '';
  }, [getAudio]);

  const volumeUp = useCallback(() => {
    setVolume(v => Math.min(1, +(v + 0.1).toFixed(1)));
  }, []);

  const volumeDown = useCallback(() => {
    setVolume(v => Math.max(0, +(v - 0.1).toFixed(1)));
  }, []);

  return { loadAndPlay, playAudio, pauseAudio, stopAudio, volumeUp, volumeDown, volume };
}
