// src/context/MusicContext.tsx
import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

export type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;        // URL audio
  cover?: string;
};

// Playlist default (ganti src dengan URL file di Supabase Storage)
const DEFAULT_PLAYLIST: Track[] = [
  { id: '1', title: 'Hampir Lulus', artist: 'Angkatan 26', src: '/audio/track1.mp3' },
  { id: '2', title: 'Jargon Kelas', artist: 'Neutrino & All Axe', src: '/audio/track2.mp3' },
  { id: '3', title: 'Kenangan Asrama', artist: 'Angkatan 26', src: '/audio/track3.mp3' },
];

type MusicContextType = {
  playlist: Track[];
  currentTrack: Track | null;
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  isMinimized: boolean;
  setIsMinimized: (v: boolean) => void;
  play: (index?: number) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  setPlaylist: (tracks: Track[]) => void;
};

const MusicContext = createContext<MusicContextType>({} as MusicContextType);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<Track[]>(DEFAULT_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.6);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = playlist[currentIndex] ?? null;

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => setProgress(audio.currentTime));
    audio.addEventListener('durationchange', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => next());

    return () => { audio.pause(); audio.src = ''; };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.src;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
  }, [currentIndex, playlist]);

  const play = (index?: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (index !== undefined && index !== currentIndex) {
      setCurrentIndex(index);
      return;
    }
    audio.play().then(() => setIsPlaying(true)).catch(() => { });
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const toggle = () => isPlaying ? pause() : play();

  const next = () => setCurrentIndex(i => (i + 1) % playlist.length);
  const prev = () => setCurrentIndex(i => (i - 1 + playlist.length) % playlist.length);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <MusicContext.Provider value={{
      playlist, currentTrack, currentIndex, isPlaying,
      volume, progress, duration, isMinimized, setIsMinimized,
      play, pause, toggle, next, prev, seek, setVolume, setPlaylist,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => useContext(MusicContext);
