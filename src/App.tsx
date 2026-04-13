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
import { AudioConsent } from './components/AudioConsent/AudioConsent';
import { usePlayerState } from './hooks/usePlayerState';
import { useAudio } from './hooks/useAudio';
import type { Album } from './data/albums';
import styles from './App.module.css';

const PLAYER_W = 893;
const PLAYER_H = 1321;
const PLATTER_SIZE = 835;
const MOBILE_BREAKPOINT = 500; // px — below this, switch to vertical layout

export default function App() {
  const { activeAlbum, isPlaying, loadAlbum, play, pause, eject } = usePlayerState();
  const { loadAndPlay, playAudio, pauseAudio, stopAudio, volumeUp, volumeDown, volume, analyserRef } = useAudio();
  const [dragAlbum, setDragAlbum] = useState<Album | null>(null);
  const [snapAnim, setSnapAnim] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [dragDiscSize, setDragDiscSize] = useState(120);
  const [isVertical, setIsVertical] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const pendingAlbumRef = useRef<Album | null>(null);

  const platterCenterRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateScale = useCallback(() => {
    const el = containerRef.current;
    const W = el?.clientWidth  ?? window.innerWidth;
    const H = el?.clientHeight ?? window.innerHeight;

    const vertical = W < MOBILE_BREAKPOINT;
    setIsVertical(vertical);

    if (vertical) {
      // Vertical: player fills ~90% of width, capped at 50% height
      const availW = W * 0.90;
      const availH = H * 0.52;
      const s = Math.min(1, availW / PLAYER_W, availH / PLAYER_H);
      setScale(Math.max(0.14, s));
    } else {
      // Horizontal: player gets ~28% of width, 90% of height
      const availW = W * 0.28;
      const availH = H * 0.90;
      const s = Math.min(1, availW / PLAYER_W, availH / PLAYER_H);
      setScale(Math.max(0.2, s));
    }
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', updateScale);
      ro.disconnect();
    };
  }, [updateScale]);

  const updatePlatterCenter = useCallback(() => {
    if (!containerRef.current) return;
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

  const loadAlbumWithAudio = useCallback((album: Album, withAudio: boolean) => {
    loadAlbum(album);
    setIsLoading(true);
    setSnapAnim(true);
    setTimeout(() => setSnapAnim(false), 500);
    setTimeout(() => {
      setIsLoading(false);
      play();
      if (withAudio) loadAndPlay(album);
    }, 1300);
  }, [loadAlbum, play, loadAndPlay]);

  function handleDragEnd(event: DragEndEvent) {
    const droppedOnPlatter =
      event.over?.id === 'platter' && event.active.data.current?.album;

    if (droppedOnPlatter) {
      const album = event.active.data.current!.album as Album;
      if (audioEnabled === null) {
        pendingAlbumRef.current = album;
        setShowConsent(true);
      } else {
        loadAlbumWithAudio(album, audioEnabled);
      }
    }

    setDragAlbum(null);
    setDragDiscSize(120);
  }

  const handleConsentAccept = useCallback(() => {
    setAudioEnabled(true);
    setShowConsent(false);
    const album = pendingAlbumRef.current;
    pendingAlbumRef.current = null;
    if (album) loadAlbumWithAudio(album, true);
  }, [loadAlbumWithAudio]);

  const handleConsentDecline = useCallback(() => {
    setAudioEnabled(false);
    setShowConsent(false);
    const album = pendingAlbumRef.current;
    pendingAlbumRef.current = null;
    if (album) loadAlbumWithAudio(album, false);
  }, [loadAlbumWithAudio]);

  const handlePlay = useCallback(() => {
    if (activeAlbum) { play(); if (audioEnabled !== false) playAudio(); }
  }, [activeAlbum, play, playAudio, audioEnabled]);

  const handlePause = useCallback(() => {
    pause(); if (audioEnabled !== false) pauseAudio();
  }, [pause, pauseAudio, audioEnabled]);

  const handleEject = useCallback(() => {
    eject(); if (audioEnabled !== false) stopAudio();
  }, [eject, stopAudio, audioEnabled]);

  // ── Layout math ────────────────────────────────────────────────────────────
  const playerHeight = PLAYER_H * scale;

  // Desktop: 3-column grid sized to match player height
  const GRID_GAP = 14;
  const META_H = 30;
  const desktopArtSize = Math.max(60, Math.floor((playerHeight - 24 - GRID_GAP * 2) / 3 - META_H));

  // Mobile: horizontal strip with fixed art size
  const MOBILE_ART = 82;

  const artSize  = isVertical ? MOBILE_ART : desktopArtSize;
  const gridMode = isVertical ? 'strip' : 'grid';
  const gridHeight = isVertical ? MOBILE_ART + META_H + 8 : playerHeight - 24;

  return (
    <>
      {showConsent && (
        <AudioConsent onAccept={handleConsentAccept} onDecline={handleConsentDecline} />
      )}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div
          className={`${styles.layout} ${isVertical ? styles.layoutVertical : ''}`}
          ref={containerRef}
        >
          <div className={`${styles.contentBox} ${isVertical ? styles.contentBoxVertical : ''}`}>

            {/* CD Player */}
            <div className={`${styles.playerCol} ${isVertical ? styles.playerColVertical : ''}`}>
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
                    volume={volume}
                    analyserRef={analyserRef}
                  />
                </div>
              </div>
            </div>

            {/* Album Grid / Strip */}
            <div className={`${styles.gridCol} ${isVertical ? styles.gridColVertical : ''}`}>
              <AlbumGrid
                activeAlbumId={activeAlbum?.id ?? null}
                gridHeight={gridHeight}
                artSize={artSize}
                mode={gridMode}
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
              <DragDisc size={dragDiscSize} color={dragAlbum.color} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
