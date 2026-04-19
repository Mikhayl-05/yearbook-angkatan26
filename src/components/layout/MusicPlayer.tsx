// src/components/layout/MusicPlayer.tsx
import { useMusic } from '@/context/MusicContext';

const formatTime = (s: number) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

export function MusicPlayer() {
  const {
    currentTrack, isPlaying, toggle, next, prev,
    progress, duration, seek, volume, setVolume,
    isMinimized, setIsMinimized, playlist, play, currentIndex,
  } = useMusic();

  if (!currentTrack) return null;

  const progressPct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className={`fixed bottom-6 right-6 z-50 music-player rounded-xl shadow-2xl transition-all duration-500 no-print ${
      isMinimized ? 'w-14 h-14 rounded-full overflow-hidden' : 'w-80'
    }`}>

      {/* MINIMIZED VIEW */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full h-full flex items-center justify-center bg-charcoal-900 border border-gold/40 rounded-full hover:border-gold transition-all"
        >
          <div className="flex items-end gap-0.5 h-5">
            {[1,2,3,4].map(i => (
              <div
                key={i}
                className={`w-0.5 bg-gold rounded-full ${isPlaying ? 'animate-bounce' : ''}`}
                style={{
                  height: isPlaying ? undefined : '4px',
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: '0.5s',
                  minHeight: '4px',
                  maxHeight: '16px',
                }}
              />
            ))}
          </div>
        </button>
      ) : (
        /* FULL PLAYER */
        <div className="p-4">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-3">
            <span className="section-label text-[10px]">Now Playing</span>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-cream/40 hover:text-gold transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* TRACK INFO */}
          <div className="mb-4">
            <div className="font-display text-sm font-bold text-cream truncate">{currentTrack.title}</div>
            <div className="text-cream/50 text-xs font-body mt-0.5">{currentTrack.artist}</div>
          </div>

          {/* PROGRESS */}
          <div
            className="progress-bar mb-1 cursor-pointer"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}
          >
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-cream/40 text-[10px] mb-4 font-mono">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <button onClick={prev} className="text-cream/60 hover:text-gold transition-colors text-lg">
              ⏮
            </button>
            <button
              onClick={toggle}
              className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-charcoal-dark hover:bg-gold-light transition-colors shadow-gold-sm"
            >
              <span className="text-sm">{isPlaying ? '⏸' : '▶'}</span>
            </button>
            <button onClick={next} className="text-cream/60 hover:text-gold transition-colors text-lg">
              ⏭
            </button>
          </div>

          {/* VOLUME */}
          <div className="flex items-center gap-2">
            <span className="text-cream/40 text-xs">🔈</span>
            <input
              type="range"
              min="0" max="1" step="0.05"
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="flex-1 h-1 appearance-none bg-charcoal-600 rounded-full cursor-pointer accent-gold"
            />
            <span className="text-cream/40 text-xs">🔊</span>
          </div>

          {/* PLAYLIST */}
          {playlist.length > 1 && (
            <div className="mt-4 space-y-1 max-h-28 overflow-y-auto">
              <div className="divider-gold" />
              {playlist.map((track, i) => (
                <button
                  key={track.id}
                  onClick={() => play(i)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                    i === currentIndex
                      ? 'text-gold bg-gold/10'
                      : 'text-cream/50 hover:text-cream hover:bg-white/5'
                  }`}
                >
                  <span className="font-body">{i + 1}. {track.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
