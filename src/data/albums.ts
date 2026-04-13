/**
 * Album configuration — edit this file to add your own music.
 *
 * For each album:
 *   - id:       Unique string (any value)
 *   - title:    Song or album title
 *   - artist:   Artist name
 *   - color:    Fallback color for album art (hex)
 *   - artUrl:   (optional) Path to album art image — place files in /public/art/
 *   - audioUrl: (optional) Path to MP3 file — place files in /public/audio/
 *
 * Example with local files:
 *   {
 *     id: 'custom-1',
 *     title: 'My Song',
 *     artist: 'My Artist',
 *     color: '#4A7B8C',
 *     artUrl: '/art/my-album.jpg',
 *     audioUrl: '/audio/my-song.mp3',
 *   }
 *
 * To add your own music:
 *   1. Create folders: /public/art/ and /public/audio/
 *   2. Drop album art images and MP3 files there
 *   3. Reference them with paths like '/art/filename.jpg' and '/audio/filename.mp3'
 *   4. For external URLs, use full https:// paths
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
    color: '#7B6E8A',
artUrl: '/art/flashinthepanart.jpeg',
audioUrl: '/audio/flashinthepanaudio.mp3'
  },
  {
    id: '2',
    title: 'Blonde',
    artist: 'Frank Ocean',
    color: '#C8A882',
  },
  {
    id: '3',
    title: 'DAMN.',
    artist: 'Kendrick Lamar',
    color: '#8B2020',
  },
  {
    id: '4',
    title: 'Currents',
    artist: 'Tame Impala',
    color: '#4A7B8C',
  },
  {
    id: '5',
    title: 'good kid, m.A.A.d city',
    artist: 'Kendrick Lamar',
    color: '#3A4A6B',
  },
  {
    id: '6',
    title: 'To Pimp a Butterfly',
    artist: 'Kendrick Lamar',
    color: '#2D5A3D',
  },
  {
    id: '7',
    title: 'Kid A',
    artist: 'Radiohead',
    color: '#4A6B8A',
  },
  {
    id: '8',
    title: 'channel ORANGE',
    artist: 'Frank Ocean',
    color: '#C47A2A',
  },
  {
    id: '9',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    color: '#6B5A3E',
  },
];
