// src/components/ui/GoldParticles.tsx
// Performance-optimized: reduced count on mobile, uses CSS animations (GPU-composited)
import { useEffect, useRef } from 'react';

export default function GoldParticles({ count }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reduce particle count on mobile for performance
    const isMobile = window.innerWidth < 768;
    const actualCount = count ?? (isMobile ? 10 : 20);

    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < actualCount; i++) {
      const el = document.createElement('div');
      const size = Math.random() * 3 + 1; // 1–4px (slightly smaller)
      const x = Math.random() * 100;
      const dur = Math.random() * 12 + 10; // slower = less CPU
      const delay = Math.random() * 12;
      const dx = (Math.random() - 0.5) * 150;

      el.style.cssText = `
        position: fixed;
        left: ${x}vw;
        bottom: -20px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(201,162,39,${Math.random() * 0.5 + 0.15});
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

    return () => particles.forEach(p => p.remove());
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
