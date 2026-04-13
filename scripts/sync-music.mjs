/**
 * sync-music.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Scans /public/music/ for audio files and prints ready-to-paste album entries.
 *
 * USAGE
 *   1. Drop your .mp3 (or .wav/.ogg/.flac) files into  public/music/
 *   2. Drop matching cover art (.jpg / .jpeg / .png / .webp) with the SAME
 *      base filename into the same folder.
 *      e.g.  frank-ocean-blonde.mp3  +  frank-ocean-blonde.jpg
 *   3. Run:  node scripts/sync-music.mjs
 *   4. Copy the printed entries into src/data/albums.ts
 *
 * FILENAME CONVENTION
 *   artist - title.mp3        →  artist: "Artist",  title: "Title"
 *   frank ocean - blonde.mp3  →  artist: "Frank Ocean", title: "Blonde"
 *
 *   No separator?  Whole filename becomes the title, artist left blank for you.
 *
 * COLOR
 *   Each entry gets a placeholder color. You can swap it for the dominant color
 *   of your album art using a tool like https://imagecolorpicker.com/
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MUSIC_DIR = join(__dirname, '..', 'public', 'music');
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']);
const ART_EXTS   = ['.jpg', '.jpeg', '.png', '.webp'];

// Palette to cycle through for placeholder colors
const COLORS = [
  '#7B6E8A','#C8A882','#8B2020','#4A7B8C','#3A4A6B',
  '#2D5A3D','#4A6B8A','#C47A2A','#6B5A3E','#5A4A6B',
];

function toTitleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function parseFilename(base) {
  const sep = base.indexOf(' - ');
  if (sep !== -1) {
    return {
      artist: toTitleCase(base.slice(0, sep).trim()),
      title:  toTitleCase(base.slice(sep + 3).trim()),
    };
  }
  return { artist: '', title: toTitleCase(base.trim()) };
}

function findArt(base) {
  for (const ext of ART_EXTS) {
    const candidate = join(MUSIC_DIR, base + ext);
    if (existsSync(candidate)) return `/music/${base}${ext}`;
  }
  return null;
}

if (!existsSync(MUSIC_DIR)) {
  console.log('No /public/music/ folder found — creating it now.');
  import('fs').then(({ mkdirSync }) => mkdirSync(MUSIC_DIR, { recursive: true }));
  process.exit(0);
}

const files = readdirSync(MUSIC_DIR).filter(f => AUDIO_EXTS.has(extname(f).toLowerCase()));

if (files.length === 0) {
  console.log('No audio files found in /public/music/  — drop some .mp3 files there and re-run.');
  process.exit(0);
}

console.log('\n// ── paste these into src/data/albums.ts ──────────────────────────────\n');

files.forEach((file, i) => {
  const base = basename(file, extname(file));
  const { artist, title } = parseFilename(base);
  const artUrl = findArt(base);
  const color = COLORS[i % COLORS.length];
  const id = String(Date.now() + i); // unique enough for local use

  const lines = [
    `  {`,
    `    id: '${id}',`,
    `    title: '${title}',`,
    `    artist: '${artist || 'Unknown Artist'}',`,
    `    color: '${color}',`,
    artUrl ? `    artUrl: '${artUrl}',` : `    // artUrl: '/music/${base}.jpg',  // add cover art with this exact filename`,
    `    audioUrl: '/music/${file}',`,
    `  },`,
  ];
  console.log(lines.join('\n'));
});

console.log('\n// ───────────────────────────────────────────────────────────────────────\n');
