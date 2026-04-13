/**
 * Album configuration — edit this file to add your own music.
 *
 * For each album:
 *   - id:       Unique string (any value)
 *   - title:    Song or album title
 *   - artist:   Artist name
 *   - color:    Dominant color from album art (hex) — shown during drag + as fallback
 *   - artUrl:   (optional) Path to cover image in /public/music/
 *   - audioUrl: (optional) Path to MP3 in /public/music/
 *
 * TIP: Run `npm run sync-music` to auto-generate entries from files in /public/music/
 */

export interface Album {
  id: string;
  title: string;
  artist: string;
  color: string;
  artUrl?: string;
  audioUrl?: string;
}

export const albums: Album[] = [
  {
    id: '1',
    title: 'flash in the pan',
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
    title: "Hennessy & Sailor Moon",
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
    artist: 'kpop demon hunters',
    color: '#C8A030',
    artUrl: '/music/kpopdemonhunters-cover.jpg',
    audioUrl: '/music/kpopdemonhunters-golden.mp3',
  },
  {
    id: '9',
    title: 'Always',
    artist: 'keshi',
    color: '#7A9888',
    artUrl: '/music/keshi-always-cover.jpg',
    // audioUrl missing — add keshi-always.mp3 to /public/music/ to fix
  },
];
