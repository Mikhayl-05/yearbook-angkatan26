// src/pages/404.tsx
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Custom404() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Head>
        <title>404 — Halaman Tidak Ditemukan | Yearbook Angkatan 26</title>
        <meta name="description" content="Halaman yang kamu cari tidak ditemukan." />
      </Head>

      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center, #1c1008 0%, #0c0a09 60%, #050403 100%)',
        }}
      >
        {/* Subtle gold particle effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold opacity-0"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `particleDrift ${8 + Math.random() * 6}s ease-in infinite`,
                animationDelay: `${Math.random() * 5}s`,
                '--dx': `${(Math.random() - 0.5) * 60}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Decorative top/bottom lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className={`relative z-10 text-center max-w-xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* 404 Number */}
          <div
            className="font-display font-black text-gold-gradient leading-none mb-4"
            style={{ fontSize: 'clamp(6rem, 20vw, 14rem)' }}
          >
            404
          </div>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold/50" />
            <div className="w-3 h-3 rounded-full border border-gold/50 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-gold animate-pulse" />
            </div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold/50" />
          </div>

          {/* Error message */}
          <h1 className="font-heading text-cream text-lg sm:text-xl tracking-wider uppercase mb-3">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-cream/50 font-body text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Maaf, halaman yang kamu cari tidak ada atau telah dipindahkan.
            Mungkin kamu salah ketik URL, atau halaman ini sudah tidak tersedia lagi.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/"
              className="btn-gold text-xs px-8 py-3"
            >
              ← Kembali ke Beranda
            </Link>
            <Link
              href="/gallery"
              className="btn-outline-gold text-xs px-6 py-3"
            >
              Lihat Gallery
            </Link>
          </div>

          {/* Developer contact section */}
          <div className="pt-8 border-t border-gold/10">
            <p className="text-cream/30 text-xs font-body mb-3">
              Ingin mengontak atau berbincang dengan developer web ini?
            </p>
            <a
              href="https://mikhayl.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/30 bg-gold/5 hover:bg-gold/15 text-gold hover:text-gold-light transition-all duration-300 text-xs font-heading tracking-wider group"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">🌐</span>
              <span>mikhayl.my.id</span>
              <svg className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom branding */}
        <div className={`absolute bottom-6 text-center transition-all duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-gold/30 font-heading text-[9px] tracking-[0.4em] uppercase">
            Yearbook Angkatan 26 · Neutrino
          </div>
        </div>
      </div>
    </>
  );
}
