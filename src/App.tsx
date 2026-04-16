import { useState, useRef, useEffect, useCallback } from 'react';
import {
  DndContext,
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
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [snapAnim, setSnapAnim] = useState(false);
  const [ejectAnim, setEjectAnim] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [dragDiscSize, setDragDiscSize] = useState(120);
  const [dragCursorPos, setDragCursorPos] = useState<{x: number; y: number} | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [ejectDragPos, setEjectDragPos] = useState<{ x: number; y: number } | null>(null);
  const pendingAlbumRef = useRef<Album | null>(null);

  const platterCenterRef = useRef<{ x: number; y: number } | null>(null);
  const ejectAnimatingRef = useRef(false); // guard against double-eject
  const containerRef = useRef<HTMLDivElement>(null);
  const artSizeRef = useRef(120); // updated each render; handlers see current artSize via closure

  const updateScale = useCallback(() => {
    const el = containerRef.current;
    const W = el?.clientWidth  ?? window.innerWidth;
    const H = el?.offsetHeight ?? window.innerHeight;

    const vertical = W < MOBILE_BREAKPOINT;
    setIsVertical(vertical);

    if (vertical) {
      // Vertical: Player scaling accurately offsets static heights needed for carousel and padding.
      // 90 (art) + 30 (text) + 24 (padding) + gaps ≈ 180px; +40 buffer = 220px reserved.
      const RESERVED_CAROUSEL_H = 220;
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

    // Simulates pointer capture: track which element received pointerdown so
    // subsequent pointermove/up are also sent there even when the cursor has moved away.
    let capturedTarget: Element | null = null;

    function handleMessage(e: MessageEvent) {
      const { type, x, y } = (e.data ?? {}) as { type?: string; x?: number; y?: number };
      if (typeof type !== 'string' || !type.startsWith('framer-') || x == null || y == null) return;
      const target = document.elementFromPoint(x, y);
      if (!target) return;

      // isPrimary: true  — dnd-kit's PointerSensor ignores events where isPrimary is false.
      // pointerType: 'mouse' — PointerSensor handles this on all platforms (desktop & mobile).
      // buttons: 1  — primary button held; required for dnd-kit to recognise active drag moves.
      const held = type === 'framer-pointerdown' || type === 'framer-pointermove';
      const init: PointerEventInit = {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        pointerId: 1,
        isPrimary: true,
        pointerType: 'mouse',
        buttons: held ? 1 : 0,
      };

      switch (type) {
        case 'framer-pointerdown':
          capturedTarget = target;
          target.dispatchEvent(new PointerEvent('pointerdown', init));
          break;
        case 'framer-pointermove':
          target.dispatchEvent(new PointerEvent('pointermove', init));
          // Simulate pointer capture: also deliver to the original pressed element
          // so disc scratch / eject-drag keep working after the cursor leaves the disc.
          if (capturedTarget && capturedTarget !== target) {
            capturedTarget.dispatchEvent(new PointerEvent('pointermove', init));
          }
          break;
        case 'framer-pointerup':
          target.dispatchEvent(new PointerEvent('pointerup', init));
          if (capturedTarget && capturedTarget !== target) {
            capturedTarget.dispatchEvent(new PointerEvent('pointerup', init));
          }
          capturedTarget = null;
          break;
        case 'framer-click':
          // pointerdown/up were already forwarded; just fire the click so React
          // onClick handlers (buttons, album taps) trigger.
          target.dispatchEvent(new MouseEvent('click', {
            bubbles: true, cancelable: true, clientX: x, clientY: y,
          }));
          break;
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
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 12 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setDragAlbum(event.active.data.current?.album ?? null);
    setDragDiscSize(artSizeRef.current);
    setDragCursorPos(null);
    setDragDirection(null);
    updatePlatterCenter();
  }

  function getActivatorCoords(activatorEvent: Event): { x: number; y: number } {
    if (typeof TouchEvent !== 'undefined' && activatorEvent instanceof TouchEvent) {
      const t = activatorEvent.changedTouches[0] ?? activatorEvent.touches[0];
      return { x: t?.clientX ?? 0, y: t?.clientY ?? 0 };
    }
    const pe = activatorEvent as PointerEvent;
    return { x: pe.clientX, y: pe.clientY };
  }

  function handleDragMove(event: DragMoveEvent) {
    const dx = event.delta?.x ?? 0;
    const dy = event.delta?.y ?? 0;

    // Track actual cursor/touch position for the fixed-position disc
    if (event.activatorEvent) {
      const { x: startX, y: startY } = getActivatorCoords(event.activatorEvent);
      setDragCursorPos({ x: startX + dx, y: startY + dy });
    }

    // Grow disc as cursor approaches platter. Use a fixed reference distance so
    // overshooting the platter center never makes the disc shrink back.
    if (platterCenterRef.current && event.activatorEvent) {
      const { x: startX, y: startY } = getActivatorCoords(event.activatorEvent);
      const cursorX = startX + dx;
      const cursorY = startY + dy;
      const pc = platterCenterRef.current;
      const dist = Math.sqrt((cursorX - pc.x) ** 2 + (cursorY - pc.y) ** 2);
      // Disc reaches full platter size when cursor is within 60px of platter center
      const FULL_SIZE_DIST = 60;
      // Disc starts growing when cursor is within GROWTH_DIST of platter center
      const GROWTH_DIST = 380;
      const rawT = Math.max(0, Math.min(1, 1 - (dist - FULL_SIZE_DIST) / (GROWTH_DIST - FULL_SIZE_DIST)));
      const t = rawT * rawT; // ease-in
      const minSize = artSizeRef.current;
      const targetSize = PLATTER_SIZE * scale * 0.92;
      setDragDiscSize(Math.round(minSize + (targetSize - minSize) * t));
    }

    // Track cardinal drag direction (4-way only, threshold 8px)
    if (Math.abs(dx) >= 8 || Math.abs(dy) >= 8) {
      if (Math.abs(dx) >= Math.abs(dy)) {
        setDragDirection(dx > 0 ? 'right' : 'left');
      } else {
        setDragDirection(dy > 0 ? 'down' : 'up');
      }
    }
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
    setDragDiscSize(artSizeRef.current);
    setDragCursorPos(null);
    setDragDirection(null);
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
    if (ejectAnimatingRef.current) return;
    ejectAnimatingRef.current = true;
    setEjectAnim(true);
    setTimeout(() => {
      setEjectAnim(false);
      ejectAnimatingRef.current = false;
      eject();
      setDragAlbum(null);
      setEjectDragPos(null);
      setScratchRate(1);
      if (audioEnabled !== false) stopAudio();
    }, 440);
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

  // ── Disc speed normalization ───────────────────────────────────────────────
  // Desktop reference scale ≈ TARGET_PLAYER_W_PX / PLAYER_W. On mobile the player
  // is rendered much smaller, so the disc appears to spin slower at the same deg/frame.
  // Multiply by the inverse ratio so perceived angular velocity stays consistent.
  const discSpeedMultiplier = Math.min(2.5, Math.max(1, (TARGET_PLAYER_W_PX / PLAYER_W) / scale));

  // ── Layout math ────────────────────────────────────────────────────────────
  const playerWidth  = PLAYER_W * scale;
  const playerHeight = PLAYER_H * scale;

  const GRID_GAP = 14;

  let artSize: number;
  let gridWidth: number;

  if (isVertical) {
    // Vertical: single-row carousel, compact art so player gets more height
    artSize = 90;
    gridWidth = 0; // Not used in carousel mode
  } else {
    // Horizontal: fixed-width grid so player + grid sit compact and centered together.
    // Capped at 120px art so drag distance to platter stays short (UX).
    const containerH = containerRef.current?.clientHeight ?? window.innerHeight;
    const availGridH = containerH - 32;
    const META_H = 65;
    const artFromH = Math.max(40, Math.floor((availGridH - GRID_GAP * 2 - 3 * META_H) / 3));
    artSize   = Math.max(40, Math.min(120, artFromH));
    gridWidth  = artSize * 3 + GRID_GAP * 2;
  }
  artSizeRef.current = artSize;

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
                    ejectAnim={ejectAnim}
                    discSpeedMultiplier={discSpeedMultiplier}
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

            {/* Album Grid — wrapped in relative div so horizontal hint floats above without being clipped by overflow */}
            <div className={styles.gridColWrapper} style={isVertical ? { width: '100%' } : { width: gridWidth }}>
              {/* Horizontal hint: absolute above gridCol, never inside the overflow container */}
              {!isVertical && (
                <div
                  className={styles.dragHintH}
                  style={{ opacity: activeAlbum ? 0 : 1 }}
                  aria-hidden="true"
                >
                  <svg className={styles.dragHintDisc} width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7.2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.9"/>
                    <circle cx="8" cy="8" r="4.3" stroke="currentColor" strokeWidth="0.6" fill="none"/>
                    <circle cx="8" cy="8" r="1.6" fill="currentColor"/>
                  </svg>
                  <svg className={styles.dragHintArrow} width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M10 4.5H1M1 4.5L4.5 1M1 4.5L4.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>drag to play</span>
                </div>
              )}
              <div
                className={`${styles.gridCol} ${isVertical ? styles.gridColVertical : ''}`}
              >
                <AlbumGrid
                  activeAlbumId={activeAlbum?.id ?? null}
                  gridWidth={isVertical ? undefined : gridWidth}
                  artSize={artSize}
                  colorMap={colorMap}
                  isCarousel={isVertical}
                  onAlbumTap={handleAlbumTap}
                  dragDirection={dragDirection}
                  showHint={!activeAlbum}
                />
              </div>
            </div>

          </div>
        </div>

      </DndContext>

      {/* Disc peek/drag ghost — fixed-position, escapes all overflow clipping.
          z-index 1000 puts it above the grid but the dragging card's art is z-index 1001
          so the disc appears to emerge from behind the album cover. */}
      {dragAlbum && dragDirection !== null && dragCursorPos && (
        <div style={{
          position: 'fixed',
          left: dragCursorPos.x - dragDiscSize / 2,
          top: dragCursorPos.y - dragDiscSize / 2,
          width: dragDiscSize,
          height: dragDiscSize,
          pointerEvents: 'none',
          zIndex: 1000,
          transition: 'width 0.08s linear, height 0.08s linear',
        }}>
          <DragDisc size={dragDiscSize} color={colorMap[dragAlbum.id] ?? dragAlbum.color} />
        </div>
      )}

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
