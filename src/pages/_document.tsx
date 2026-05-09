// src/pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="id" prefix="og: https://ogp.me/ns#">
      <Head>
        {/* ── STATIC FALLBACK OPEN GRAPH ── */}
        <meta property="og:site_name" content="Yearbook Angkatan 26" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Yearbook Angkatan 26 - Neutrino MTS Wahdah Islamiyah" />
        <meta property="og:description" content="Kenangan digital Angkatan 26 - Neutrino MTS Pondok Pesantren Wahdah Islamiyah Bonebolango 2023-2026" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* ── DNS PREFETCH (mempercepat koneksi awal) ─────────── */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href={`//${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')}`} />

        {/* ── PRECONNECT (prioritas lebih tinggi dari dns-prefetch) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── GOOGLE FONTS — Dikurangi dari 5 family + 15 variants ─
            Sebelum: Playfair(5varian) + Cinzel(3) + Lato(3) + Dancing(2) + JetBrains(2) = 15 variants
            Sesudah: Hanya varian yang BENAR-BENAR DIPAKAI = 8 variants (hemat ~40% bandwidth)
            - Italic Playfair dihapus (tidak ada teks italic di codebase)
            - Lato 300 dihapus (hanya 400 dan 700 yang dipakai)
            - Dancing Script 500 dihapus (hanya 700 dipakai)
            - JetBrains Mono diganti ke system font di CSS
        ─────────────────────────────────────────────────────── */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@400;600;900&family=Lato:wght@400;700&family=Dancing+Script:wght@700&display=swap"
          rel="stylesheet"
        />

        {/* ── THEME ─────────────────────────────────────────────── */}
        <meta name="theme-color" content="#C9A227" />
        <meta name="msapplication-TileColor" content="#0c0a09" />

        {/* ── APPLE ─────────────────────────────────────────────── */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* ── PWA ───────────────────────────────────────────────── */}
        <link rel="manifest" href="/manifest.json" />

        {/* ── ICONS ─────────────────────────────────────────────── */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

