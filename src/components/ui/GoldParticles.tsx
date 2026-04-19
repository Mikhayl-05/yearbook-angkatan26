// src/components/ui/GoldParticles.tsx
import { useEffect, useRef } from 'react';

export default function GoldParticles({ count = 20 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const size = Math.random() * 4 + 1;
      const x = Math.random() * 100;
      const dur = Math.random() * 10 + 8;
      const delay = Math.random() * 10;
      const dx = (Math.random() - 0.5) * 200;

      el.style.cssText = `
        position: fixed;
        left: ${x}vw;
        bottom: -20px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(201,162,39,${Math.random() * 0.6 + 0.2});
        pointer-events: none;
        z-index: 1;
        animation: particleDrift ${dur}s ease-in ${delay}s infinite;
        --dx: ${dx}px;
        --dur: ${dur}s;
        --delay: ${delay}s;
        box-shadow: 0 0 ${size * 2}px rgba(201,162,39,0.4);
      `;

      container.appendChild(el);
      particles.push(el);
    }

    return () => particles.forEach(p => p.remove());
  }, [count]);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />;
}
