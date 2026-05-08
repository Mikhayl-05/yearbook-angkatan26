// src/components/ui/GoldParticles.tsx
// Performance-optimized:
// - Pause animasi saat tab tidak aktif (Page Visibility API) → hemat CPU/GPU
// - Tidak render jika user prefer reduced motion
// - Kurangi count di mobile (6 partikel vs 20 di desktop)
import { useEffect, useRef } from 'react';

export default function GoldParticles({ count }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Jangan render particles jika user prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = containerRef.current;
    if (!container) return;

    // Kurangi count di mobile (6 → 12 → 20)
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 1024;
    const defaultCount = isMobile ? 6 : isTablet ? 12 : 20;
    const actualCount = count ?? defaultCount;

    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < actualCount; i++) {
      const el = document.createElement('div');
      const size = Math.random() * 2.5 + 1; // 1–3.5px (sedikit lebih kecil)
      const x = Math.random() * 100;
      const dur = Math.random() * 15 + 12; // lebih lambat = lebih sedikit CPU
      const delay = Math.random() * 15;
      const dx = (Math.random() - 0.5) * 120;

      el.style.cssText = `
        position: fixed;
        left: ${x}vw;
        bottom: -20px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(201,162,39,${Math.random() * 0.45 + 0.1});
        pointer-events: none;
        z-index: 1;
        animation: particleDrift ${dur}s ease-in ${delay}s infinite;
        --dx: ${dx}px;
        will-change: transform, opacity;
        contain: strict;
      `;

      container.appendChild(el);
      particles.push(el);
    }

    // ── PAUSE saat tab tidak aktif (hemat CPU/GPU) ──────────────────
    const handleVisibilityChange = () => {
      const state = document.hidden ? 'paused' : 'running';
      particles.forEach(p => { p.style.animationPlayState = state; });
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      particles.forEach(p => p.remove());
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
