// src/components/ui/EasterEgg.tsx
import { useState, useEffect, useRef, useCallback } from 'react';

type Phase = 'idle' | 'counting' | 'revealed';

export default function EasterEgg() {
  const [phase, setPhase] = useState<Phase>('idle');
  const phaseRef = useRef<Phase>('idle');

  // keep phaseRef in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    let clickCount = 0;
    let clickTimer: ReturnType<typeof setTimeout> | null = null;

    const handleClick = (e: MouseEvent) => {
      // Find the element with the trigger ID
      const target = document.getElementById('easter-egg-trigger');
      if (!target || !target.contains(e.target as Node)) return;

      if (phaseRef.current !== 'idle') return;

      clickCount++;
      if (clickTimer) clearTimeout(clickTimer);

      // Reset sequence if no click for 2 seconds
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 2000);

      if (clickCount >= 5) {
        clickCount = 0;
        if (clickTimer) clearTimeout(clickTimer);
        
        // REVEAL immediately
        phaseRef.current = 'revealed';
        setPhase('revealed');
        try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch { /* */ }
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      if (clickTimer) clearTimeout(clickTimer);
    };
  }, []);

  if (phase === 'idle') return null;

  /* ────────────────────────────────────────────────────────────
     REVEALED STATE — full-screen overlay
  ──────────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(12,10,9,0.96)',
        backdropFilter: 'blur(24px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto',
        animation: 'fadeIn 0.5s ease both',
      }}
    >
      {/* Close button */}
      <button
        onClick={() => { setPhase('idle'); }}
        style={{
          position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 10000,
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(201,162,39,0.1)',
          border: '1px solid rgba(201,162,39,0.3)',
          color: 'rgba(245,240,232,0.6)',
          fontSize: '1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        ×
      </button>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content card */}
      <div
        style={{
          maxWidth: 480, width: '100%', textAlign: 'center',
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '2px solid #C9A227',
          background: 'rgba(201,162,39,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 40px rgba(201,162,39,0.3)',
        }}>
          <span style={{ fontSize: '2.25rem' }}>👨‍💻</span>
        </div>

        <div className="section-label mb-3">Behind The Scenes</div>

        <h2
          className="font-display font-black text-gold-gradient mb-2"
          style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}
        >
          Web ini dibuat oleh
        </h2>
        <h3
          className="font-display font-black text-cream mb-2"
          style={{ fontSize: 'clamp(1.8rem, 6vw, 2.8rem)' }}
        >
          Mikhayl
        </h3>
        <p className="text-cream/50 font-body text-sm mb-1">
          Salah satu santri Angkatan 26 yang membuat web yearbook ini
        </p>
        <p className="text-cream/30 font-body text-xs mb-8">
          Dibuat dengan ❤️ dan ☕ · Next.js + Supabase + TailwindCSS
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['Next.js', 'React', 'Supabase', 'TypeScript', 'Tailwind'].map(tech => (
            <span
              key={tech}
              className="px-3 py-1 rounded-full border border-gold/20 text-cream/50 text-[10px] font-heading tracking-wider"
            >
              {tech}
            </span>
          ))}
        </div>

        <a
          href="https://mikhayl.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold text-xs py-3 px-8 inline-flex items-center gap-2"
        >
          Kunjungi Portfolio
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        <div className="divider-gold mt-10 mb-4" />
        <p className="text-cream/20 text-[10px] font-body">
          🥚 Selamat! Kamu menemukan easter egg ini.
        </p>
      </div>
    </div>
  );
}
