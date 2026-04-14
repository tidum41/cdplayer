import { useState, useRef, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
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
import { useAlbumColors } from './hooks/useAlbumColors';
import { albums } from './data/albums';
import type { Album } from './data/albums';
import styles from './App.module.css';

const PLAYER_W = 893;
const PLAYER_H = 1321;
const PLATTER_SIZE = 835;
const MOBILE_BREAKPOINT = 850; // Switches to vertical layout sooner (like iPad portrait)

// Target rendered player width — player stays this size unless viewport is too small
const TARGET_PLAYER_W_PX = 370;

export default function App() {
  const { activeAlbum, isPlaying, loadAlbum, play, pause, eject } = usePlayerState();
  const { loadAndPlay, playAudio, pauseAudio, stopAudio, volumeUp, volumeDown, volume, analyserRef, scratchAudio } = useAudio();
  const colorMap = useAlbumColors(albums);
  const [scratchRate, setScratchRate] = useState(1);
  const [dragAlbum, setDragAlbum] = useState<Album | null>(null);
  const [snapAnim, setSnapAnim] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [dragDiscSize, setDragDiscSize] = useState(120);
  const [isVertical, setIsVertical] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [ejectDragPos, setEjectDragPos] = useState<{ x: number; y: number } | null>(null);
  const pendingAlbumRef = useRef<Album | null>(null);

  const platterCenterRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateScale = useCallback(() => {
    const el = containerRef.current;
    const W = el?.clientWidth  ?? window.innerWidth;
    const H = el?.offsetHeight ?? window.innerHeight;

    const vertical = W < MOBILE_BREAKPOINT;
    setIsVertical(vertical);

    if (vertical) {
      // Vertical: Player scaling accurately offsets static heights needed for carousel and padding.
      // 120 (art) + 65 (text) + 32 (padding) + gaps = roughly 250px hard-allocated space.
      const RESERVED_CAROUSEL_H = 280;
      const availW = W * 0.95;
      const availH = Math.max(100, H - RESERVED_CAROUSEL_H);
      const s = Math.min(1, availW / PLAYER_W, availH / PLAYER_H);
      setScale(Math.max(0.12, s));
    } else {
      // Horizontal: prefer a fixed ~370px player width; only shrink for tight viewports
      const targetScale = TARGET_PLAYER_W_PX / PLAYER_W;
      const maxFromW = (W * 0.50) / PLAYER_W; // never exceed 50% of viewport width
      const maxFromH = Math.max(0.12, (H - 32) / PLAYER_H); // Player strictly restrained by parent height minus padding
      const s = Math.min(targetScale, maxFromW, maxFromH);
      setScale(Math.max(0.14, s));
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

  useEffect(() => {
    // Hide system cursor when embedded in a Framer iframe so Framer's custom cursor shows
    if (window.self !== window.top) {
      document.body.style.cursor = 'none';
    }

    function handleMessage(e: MessageEvent) {
      const { type, x, y } = (e.data ?? {}) as { type?: string; x?: number; y?: number };
      if (typeof type !== 'string' || !type.startsWith('framer-') || x == null || y == null) return;
      const target = document.elementFromPoint(x, y);
      if (!target) return;
      const init: PointerEventInit = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1 };
      switch (type) {
        case 'framer-pointerdown': target.dispatchEvent(new PointerEvent('pointerdown', init)); break;
        case 'framer-pointermove': target.dispatchEvent(new PointerEvent('pointermove', init)); break;
        case 'framer-pointerup':   target.dispatchEvent(new PointerEvent('pointerup',   init)); break;
        case 'framer-click':
          target.dispatchEvent(new PointerEvent('pointerdown', init));
          target.dispatchEvent(new PointerEvent('pointerup',   init));
          target.dispatchEvent(new MouseEvent('click', init)); break;
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
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

  const handleAlbumTap = useCallback((album: Album) => {
    if (audioEnabled === null) {
      pendingAlbumRef.current = album;
      setShowConsent(true);
    } else {
      loadAlbumWithAudio(album, audioEnabled);
    }
  }, [audioEnabled, loadAlbumWithAudio]);

  const handlePlay = useCallback(() => {
    if (activeAlbum) { play(); if (audioEnabled !== false) playAudio(); }
  }, [activeAlbum, play, playAudio, audioEnabled]);

  const handlePause = useCallback(() => {
    pause(); if (audioEnabled !== false) pauseAudio();
  }, [pause, pauseAudio, audioEnabled]);

  const handleEject = useCallback(() => {
    eject();
    setDragAlbum(null);
    setEjectDragPos(null);
    setScratchRate(1);
    if (audioEnabled !== false) stopAudio();
  }, [eject, stopAudio, audioEnabled]);

  const handleScratch = useCallback((degPerMs: number) => {
    if (audioEnabled !== false) scratchAudio(degPerMs);
    if (degPerMs === 0) {
      setScratchRate(1);
    } else {
      const normalDegPerMs = 360 / (16 * 1000);
      const rate = degPerMs / normalDegPerMs;
      // Allow full signed range — negative = counter-clockwise = rewind
      setScratchRate(Math.max(-3.5, Math.min(3.5, rate)));
    }
  }, [audioEnabled, scratchAudio]);

  const handleEjectDragMove = useCallback((x: number, y: number) => {
    setEjectDragPos({ x, y });
  }, []);

  const handleEjectDragCancel = useCallback(() => {
    setEjectDragPos(null);
  }, []);

  // ── Layout math ────────────────────────────────────────────────────────────
  const playerWidth  = PLAYER_W * scale;
  const playerHeight = PLAYER_H * scale;

  const GRID_GAP = 14;

  let artSize: number;
  let gridWidth: number;

  if (isVertical) {
    // Vertical: single-row carousel, use a fixed size that fits safely in mobile
    artSize = 120; 
    gridWidth = 0; // Not used in carousel mode
  } else {
    // Horizontal: grid mathematically constrained by BOTH width and height to prevent scrolling natively
    const containerW = containerRef.current?.clientWidth ?? window.innerWidth;
    const containerH = containerRef.current?.clientHeight ?? window.innerHeight;
    const availGridW = containerW - playerWidth - 32 - 16;
    const availGridH = containerH - 32;

    const META_H = 65; // Approximate rendered height of title and artist wrapper below each card
    const artFromW = Math.floor((availGridW - GRID_GAP * 2) / 3);
    const artFromH = Math.max(40, Math.floor((availGridH - GRID_GAP * 2 - 3 * META_H) / 3));

    artSize   = Math.max(40, Math.min(160, Math.min(artFromW, artFromH)));
    gridWidth  = artSize * 3 + GRID_GAP * 2;
  }

  // ── Eject drag disc size ──────────────────────────────────────────────────
  let ejectDiscSize = 0;
  if (ejectDragPos && platterCenterRef.current && activeAlbum) {
    const pc = platterCenterRef.current;
    const dx = ejectDragPos.x - pc.x;
    const dy = ejectDragPos.y - pc.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const platterRadius = (PLATTER_SIZE * scale) / 2;
    const distFromEdge = Math.max(0, dist - platterRadius);
    const maxDist = 280;
    const t = Math.min(1, distFromEdge / maxDist);
    const maxSize = PLATTER_SIZE * scale * 0.70;
    const minSize = artSize;
    ejectDiscSize = Math.round(maxSize * (1 - t) + minSize * t);
  }

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
                style={{ width: playerWidth, height: playerHeight, flexShrink: 0 }}
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
                    onScratch={handleScratch}
                    scratchRate={scratchRate}
                    onEjectDragMove={handleEjectDragMove}
                    onEjectDragCancel={handleEjectDragCancel}
                  />
                </div>
              </div>
            </div>

            {/* Album Grid */}
            <div className={`${styles.gridCol} ${isVertical ? styles.gridColVertical : ''}`}>
              <AlbumGrid
                activeAlbumId={activeAlbum?.id ?? null}
                gridWidth={isVertical ? undefined : gridWidth}
                artSize={artSize}
                colorMap={colorMap}
                isCarousel={isVertical}
                onAlbumTap={handleAlbumTap}
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
              <DragDisc size={dragDiscSize} color={colorMap[dragAlbum.id] ?? dragAlbum.color} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Eject drag ghost — fixed-position disc that appears when dragging disc off platter */}
      {ejectDragPos && activeAlbum && ejectDiscSize > 0 && (
        <div style={{
          position: 'fixed',
          left: ejectDragPos.x,
          top: ejectDragPos.y,
          width: ejectDiscSize,
          height: ejectDiscSize,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'width 0.05s linear, height 0.05s linear',
        }}>
          <DragDisc size={ejectDiscSize} color={colorMap[activeAlbum.id] ?? activeAlbum.color} />
        </div>
      )}
    </>
  );
}
