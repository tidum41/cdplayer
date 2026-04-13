import { useState, useRef, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragMoveEvent,
} from '@dnd-kit/core';
import { VinylPlayer } from './components/VinylPlayer/VinylPlayer';
import { AlbumGrid } from './components/AlbumGrid/AlbumGrid';
import { DragDisc } from './components/Disc/DragDisc';
import { usePlayerState } from './hooks/usePlayerState';
import { useAudio } from './hooks/useAudio';
import type { Album } from './data/albums';
import styles from './App.module.css';

const PLAYER_W = 893;
const PLAYER_H = 1321;
const PLATTER_SIZE = 835;

export default function App() {
  const { activeAlbum, isPlaying, loadAlbum, play, pause, eject } = usePlayerState();
  const { loadAndPlay, playAudio, pauseAudio, stopAudio, volumeUp, volumeDown } = useAudio();
  const [dragAlbum, setDragAlbum] = useState<Album | null>(null);
  const [snapAnim, setSnapAnim] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [dragDiscSize, setDragDiscSize] = useState(120);

  const platterCenterRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scale player to fit: max 60% viewport height, and leave room for grid
  const updateScale = useCallback(() => {
    const maxH = window.innerHeight * 0.60;
    const maxW = window.innerWidth * 0.28; // player gets ~28% of viewport width
    const s = Math.min(1, maxW / PLAYER_W, maxH / PLAYER_H);
    setScale(Math.max(0.2, s));
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  const updatePlatterCenter = useCallback(() => {
    if (!containerRef.current) return;
    // Find the player sizer div
    const sizer = containerRef.current.querySelector('[data-player-sizer]') as HTMLElement;
    if (!sizer) return;
    const rect = sizer.getBoundingClientRect();
    const platterCx = rect.left + (PLAYER_W / 2) * scale;
    const platterCy = rect.top + (120 + PLATTER_SIZE / 2) * scale;
    platterCenterRef.current = { x: platterCx, y: platterCy };
  }, [scale]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setDragAlbum(event.active.data.current?.album ?? null);
    setDragDiscSize(120);
    updatePlatterCenter();
  }

  function handleDragMove(event: DragMoveEvent) {
    if (!platterCenterRef.current || !event.activatorEvent) return;
    const pe = event.activatorEvent as PointerEvent;
    const cursorX = pe.clientX + (event.delta?.x ?? 0);
    const cursorY = pe.clientY + (event.delta?.y ?? 0);

    const pc = platterCenterRef.current;
    const dist = Math.sqrt((cursorX - pc.x) ** 2 + (cursorY - pc.y) ** 2);

    const maxDist = 500;
    const targetSize = PLATTER_SIZE * scale;
    const minSize = 120;
    const t = Math.max(0, Math.min(1, 1 - dist / maxDist));
    setDragDiscSize(Math.round(minSize + (targetSize - minSize) * t));
  }

  function handleDragEnd(event: DragEndEvent) {
    const droppedOnPlatter =
      event.over?.id === 'platter' && event.active.data.current?.album;

    if (droppedOnPlatter) {
      const album = event.active.data.current!.album as Album;
      loadAlbum(album);
      setIsLoading(true);
      setSnapAnim(true);
      setTimeout(() => setSnapAnim(false), 500);
      setTimeout(() => {
        setIsLoading(false);
        play();
        loadAndPlay(album);
      }, 1300);
    }

    setDragAlbum(null);
    setDragDiscSize(120);
  }

  const handlePlay = useCallback(() => {
    if (activeAlbum) { play(); playAudio(); }
  }, [activeAlbum, play, playAudio]);

  const handlePause = useCallback(() => {
    pause(); pauseAudio();
  }, [pause, pauseAudio]);

  const handleEject = useCallback(() => {
    eject(); stopAudio();
  }, [eject, stopAudio]);

  const playerHeight = PLAYER_H * scale;
  const gridHeight = playerHeight + 56; // slightly taller than player
  const gridGap = 14;
  const metaH = 30;
  const artSize = Math.max(60, Math.floor((gridHeight - gridGap * 2) / 3 - metaH));

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.layout} ref={containerRef}>
        <div className={styles.contentBox}>
          {/* CD Player */}
          <div className={styles.playerCol}>
            <div
              data-player-sizer
              style={{ width: PLAYER_W * scale, height: playerHeight, flexShrink: 0 }}
            >
              <div style={{
                width: PLAYER_W,
                height: PLAYER_H,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}>
                <VinylPlayer
                  activeAlbum={activeAlbum}
                  isPlaying={isPlaying}
                  isLoading={isLoading}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onEject={handleEject}
                  onVolumeUp={volumeUp}
                  onVolumeDown={volumeDown}
                  snapAnim={snapAnim}
                />
              </div>
            </div>
            {/* CTA — only when no disc is loaded */}
            {!activeAlbum && !dragAlbum && (
              <span className={styles.ctaHint}>drag a cd onto the player</span>
            )}
          </div>

          {/* Album Grid */}
          <div className={styles.gridCol}>
            <AlbumGrid
              activeAlbumId={activeAlbum?.id ?? null}
              gridHeight={gridHeight}
              artSize={artSize}
            />
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {dragAlbum ? (
          <div style={{
            width: dragDiscSize,
            height: dragDiscSize,
            transition: 'width 0.15s ease-out, height 0.15s ease-out',
          }}>
            <DragDisc size={dragDiscSize} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
