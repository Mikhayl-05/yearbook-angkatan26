// src/context/MusicContext.tsx
import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover?: string;
};

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
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.6);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = playlist.length > 0 ? (playlist[currentIndex] ?? null) : null;

  // ── Load playlist dari Supabase DB ─────────────────────────────
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const { data, error } = await supabase
          .from('playlist')
          .select('*')
          .order('order_num', { ascending: true });
        if (!error && data && data.length > 0) {
          const tracks: Track[] = data.map((row: any) => ({
            id: String(row.id),
            title: row.title || 'Untitled',
            artist: row.artist || 'Angkatan 26',
            src: row.url,
            cover: row.cover_url || undefined,
          }));
          setPlaylist(tracks);
        }
      } catch { /* silent fail */ }
    };
    loadPlaylist();
  }, []);

  // ── Setup audio element (once) ──────────────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => setProgress(audio.currentTime));
    audio.addEventListener('durationchange', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
      setCurrentIndex(i => {
        const len = audioRef.current ? playlist.length : 1;
        return (i + 1) % Math.max(1, len);
      });
    });

    return () => { audio.pause(); audio.src = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── When track changes, update src ─────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.src;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, playlist]);

  const play = (index?: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (index !== undefined && index !== currentIndex) {
      setCurrentIndex(index);
      return;
    }
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const pause = () => { audioRef.current?.pause(); setIsPlaying(false); };
  const toggle = () => (isPlaying ? pause() : play());
  const next = () => setCurrentIndex(i => (i + 1) % Math.max(1, playlist.length));
  const prev = () => setCurrentIndex(i => (i - 1 + Math.max(1, playlist.length)) % Math.max(1, playlist.length));

  const seek = (time: number) => {
    if (audioRef.current) { audioRef.current.currentTime = time; setProgress(time); }
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
