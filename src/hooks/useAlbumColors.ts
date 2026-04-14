import { useState, useEffect } from 'react';
import type { Album } from '../data/albums';
import { extractDominantColor } from '../utils/colorExtractor';

/**
 * Resolves dominant colors for all albums that have artUrl.
 * Returns a map from album.id to extracted hex color.
 * Falls back to the album's original .color if extraction fails.
 */
export function useAlbumColors(albums: Album[]): Record<string, string> {
  const [colorMap, setColorMap] = useState<Record<string, string>>(() => {
    // Seed with colorOverride first, then static fallback
    return Object.fromEntries(albums.map(a => [a.id, a.colorOverride ?? a.color]));
  });

  useEffect(() => {
    let cancelled = false;

    // Only extract for albums WITHOUT a colorOverride
    Promise.all(
      albums
        .filter(a => !!a.artUrl && !a.colorOverride)
        .map(a =>
          extractDominantColor(a.artUrl!)
            .then(color => ({ id: a.id, color }))
            .catch(() => ({ id: a.id, color: a.color }))
        )
    ).then(results => {
      if (cancelled) return;
      setColorMap(prev => {
        const next = { ...prev };
        for (const { id, color } of results) {
          next[id] = color;
        }
        return next;
      });
    });

    return () => { cancelled = true; };
  }, []); // run once on mount

  return colorMap;
}
