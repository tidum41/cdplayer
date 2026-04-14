/**
 * Album configuration — edit this file to add your own music.
 *
 * TIP: Run `npm run sync-music` to auto-generate entries from /public/music/
 */

export interface Album {
  id: string;
  title: string;
  artist: string;
  /** Fallback disc color if artUrl is absent or extraction fails */
  color: string;
  artUrl?: string;
  audioUrl?: string;
  /**
   * Pin this album's disc to a specific color, bypassing auto-extraction.
   * Set to any valid CSS hex/rgb color to override.
   * Example: colorOverride: '#E05070'
   */
  colorOverride?: string;
}

export const albums: Album[] = [
  {
    id: '1',
    title: 'Flash in the Pan',
    artist: 'jane remover',
    color: '#8475A0',
    artUrl: '/music/janeremover-flashinthepan-cover.jpeg',
    audioUrl: '/music/janeremover-flashinthepan.mp3',
  },
  {
    id: '2',
    title: 'Noblest Strive',
    artist: 'Bladee',
    color: '#A8B8B0',
    artUrl: '/music/bladee-nobleststrive-cover.jpeg',
    audioUrl: '/music/Bladee - Noblest Strive.mp3',
  },
  {
    id: '3',
    title: 'Calcium',
    artist: 'Ecco2K',
    color: '#C8C4C0',
    artUrl: '/music/ecco2k-calcium-cover.svg',
    audioUrl: '/music/Ecco2K - Calcium.mp3',
  },
  {
    id: '4',
    title: 'Jupiter',
    artist: 'The Marías',
    color: '#B87888',
    artUrl: '/music/themarias-jupiter-cover.jpg',
    audioUrl: '/music/The Marías - Jupiter.mp3',
  },
  {
    id: '5',
    title: 'dazies',
    artist: 'yeule',
    color: '#A898C0',
    artUrl: '/music/Yeule-dazies-cover.webp',
    audioUrl: '/music/yeule - dazies.mp3',
  },
  {
    id: '6',
    title: 'Hennessy & Sailor Moon',
    artist: 'Yung Lean & Bladee',
    color: '#7890A8',
    artUrl: '/music/bladeeyunglean-hennesyandsailormoon-cover.jpg',
    audioUrl: '/music/Yung Lean - Hennessy & Sailor Moon (Feat. Bladee) [Prod. Acea].mp3',
  },
  {
    id: '7',
    title: "Can't Get Over You",
    artist: 'joji',
    color: '#907868',
    artUrl: '/music/joji-cantgetoveryou-cover.jpg',
    audioUrl: '/music/joji-cantgetoveryouaudio.mp3',
  },
  {
    id: '8',
    title: 'Golden',
    artist: 'KPOP DEMON HUNTERS',
    color: '#C8A030',
    artUrl: '/music/kpopdemonhunters-cover.jpg',
    audioUrl: '/music/kpopdemonhunters-golden.mp3',
  },
  {
    id: '9',
    title: 'B.Y.S.',
    artist: 'keshi',
    color: '#7A9888',
    artUrl: '/music/keshi-bys-cover.jpeg',
    audioUrl: '/music/keshi - B.Y.S. (Audio).mp3',
  },
];
