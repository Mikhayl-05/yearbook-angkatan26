// src/components/sections/PhotoMosaic.tsx
// Dynamic Photo Mosaic — foto santri membentuk logo angkatan
// Diaktifkan saat foto santri sudah tersedia di Supabase

import { useEffect, useRef, useState } from 'react';
import { Santri } from '@/data/students';

type Props = {
  santriList: Santri[];
  logoSrc: string;       // Logo SVG/PNG yang akan dibentuk
  title: string;
  width?: number;
  height?: number;
};

export default function PhotoMosaic({ santriList, logoSrc, title, width = 600, height = 400 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || santriList.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tileSize = 32;
    const cols = Math.floor(width / tileSize);
    const rows = Math.floor(height / tileSize);

    // Load logo image
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = logoSrc;

    logoImg.onload = async () => {
      // Draw logo to offscreen canvas to get pixel data
      const offscreen = document.createElement('canvas');
      offscreen.width = cols;
      offscreen.height = rows;
      const offCtx = offscreen.getContext('2d')!;
      offCtx.drawImage(logoImg, 0, 0, cols, rows);

      const imageData = offCtx.getImageData(0, 0, cols, rows);
      const pixels = imageData.data;

      // Load all santri photos
      const photoImages = await Promise.all(
        santriList
          .filter(s => s.foto)
          .map(s => new Promise<HTMLImageElement>(res => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = s.foto!;
            img.onload = () => res(img);
            img.onerror = () => {
              // Fallback: create colored placeholder
              const ph = document.createElement('canvas');
              ph.width = tileSize; ph.height = tileSize;
              const phCtx = ph.getContext('2d')!;
              phCtx.fillStyle = '#C9A22740';
              phCtx.fillRect(0, 0, tileSize, tileSize);
              phCtx.fillStyle = '#C9A227';
              phCtx.font = `bold ${tileSize / 2}px serif`;
              phCtx.textAlign = 'center';
              phCtx.textBaseline = 'middle';
              phCtx.fillText(s.nama[0], tileSize / 2, tileSize / 2);
              const img2 = new Image();
              img2.src = ph.toDataURL();
              res(img2);
            };
          }))
      );

      if (photoImages.length === 0) return;

      // Draw mosaic
      let photoIdx = 0;
      ctx.fillStyle = '#0c0a09';
      ctx.fillRect(0, 0, width, height);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const pixelIdx = (row * cols + col) * 4;
          const alpha = pixels[pixelIdx + 3];

          if (alpha > 128) {
            // This pixel is part of the logo — draw a santri photo here
            const photo = photoImages[photoIdx % photoImages.length];
            const x = col * tileSize;
            const y = row * tileSize;

            ctx.save();
            ctx.beginPath();
            ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2 - 1, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(photo, x, y, tileSize, tileSize);
            ctx.restore();

            // Add gold border
            ctx.beginPath();
            ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2 - 1, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(201,162,39,0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();

            photoIdx++;
          } else {
            // Background tile — subtle dark
            ctx.fillStyle = '#1c191710';
            ctx.fillRect(col * tileSize, row * tileSize, tileSize - 1, tileSize - 1);
          }
        }
      }

      setReady(true);
    };
  }, [santriList, logoSrc, width, height]);

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`rounded-lg transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
      {!ready && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-cream/40 text-xs font-heading tracking-wider">Membangun Mosaik...</p>
          </div>
        </div>
      )}

      {/* Zoom-out hint */}
      {ready && (
        <div className="absolute bottom-3 right-3 bg-charcoal-dark/70 px-2 py-1 rounded text-[10px] text-gold/60 font-heading">
          Zoom out untuk melihat {title}
        </div>
      )}
    </div>
  );
}
