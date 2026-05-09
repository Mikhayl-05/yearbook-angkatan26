// src/pages/index.tsx
// Fixed: PC hero layout, animations after splash, mobile performance
// Optimized: SSR data fetching (no double client-side fetch), prefers-reduced-motion
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import GoldParticles from '@/components/ui/GoldParticles';
import CountdownTimer from '@/components/ui/CountdownTimer';
import EasterEgg from '@/components/ui/EasterEgg';
import { supabase } from '@/lib/supabase';
import { useInView } from 'react-intersection-observer';
import { useMusic } from '@/context/MusicContext';
import Head from 'next/head';

const GRADUATION_DATE = new Date('2026-05-16T08:00:00');

// ── SSR: Ambil SEMUA data sekaligus dengan Promise.all ─────────────────────
// Sebelumnya: 1 query SSR + 3 query client-side = 4 round trips ke Supabase
// Sekarang: 3 query PARALLEL di server = 1 network round trip total
export const getServerSideProps = async () => {
  try {
    const [settingsRes, countRes, ogRes] = await Promise.all([
      supabase.from('site_settings').select('key, value'),
      supabase.from('santri').select('*', { count: 'exact', head: true }).eq('kelas', 'neutrino'),
      supabase.from('site_settings').select('value').eq('key', 'og_image_url').single(),
    ]);

    const settings = settingsRes.data ?? [];
    const bgSetting = settings.find((s: { key: string; value: string }) => s.key === 'neutrino_bg_url');
    const bgMobileSetting = settings.find((s: { key: string; value: string }) => s.key === 'neutrino_bg_mobile_url');
    const logoSetting = settings.find((s: { key: string; value: string }) => s.key === 'neutrino_logo_url');

    return {
      props: {
        ogImageUrl: ogRes.data?.value ?? null,
        neutrinoBg: bgSetting?.value ?? '',
        neutrinoBgMobile: bgMobileSetting?.value ?? '',
        neutrinoLogo: logoSetting?.value ?? '',
        neutrinoCount: countRes.count ?? 29,
      },
    };
  } catch {
    return { props: { ogImageUrl: null, neutrinoBg: '', neutrinoBgMobile: '', neutrinoLogo: '', neutrinoCount: 29 } };
  }
};

export default function HomePage({
  ogImageUrl,
  neutrinoBg,
  neutrinoBgMobile,
  neutrinoLogo,
  neutrinoCount,
}: {
  ogImageUrl: string | null;
  neutrinoBg: string;
  neutrinoBgMobile: string;
  neutrinoLogo: string;
  neutrinoCount: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [splashOut, setSplashOut] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [logoReady, setLogoReady] = useState(!neutrinoLogo); // true jika tidak ada logo (langsung siap)
  const [showShockwave, setShowShockwave] = useState(false);
  // bgLoaded: true saat tidak ada bg sama sekali, atau setelah bg yang relevan selesai dimuat
  const [bgLoaded, setBgLoaded] = useState(!neutrinoBg && !neutrinoBgMobile);
  const { play, isReady } = useMusic();

  const { ref: heroRef, inView: heroInView } = useInView({ triggerOnce: true, threshold: 0.05 });
  const { ref: aboutRef, inView: aboutInView } = useInView({ triggerOnce: true, threshold: 0.12 });
  const { ref: countdownRef, inView: countdownInView } = useInView({ triggerOnce: true, threshold: 0.12 });
  const { ref: linksRef, inView: linksInView } = useInView({ triggerOnce: true, threshold: 0.12 });

  useEffect(() => {
    const seen = sessionStorage.getItem('splash_seen');
    if (seen) { setSplashDone(true); setBgLoaded(true); }
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Preload background image yang relevan berdasarkan ukuran layar
  useEffect(() => {
    // Deteksi apakah mobile (<768px) — hanya bisa di client side
    const isMobile = window.innerWidth < 768;
    // Pilih URL yang akan dipreload: mobile jika ada + layar kecil, fallback ke desktop
    const bgToPreload = (isMobile && neutrinoBgMobile) ? neutrinoBgMobile
      : neutrinoBg ? neutrinoBg
      : null;

    if (!bgToPreload) { setBgLoaded(true); return; }
    const img = new Image();
    img.src = bgToPreload;
    img.onload = () => setBgLoaded(true);
    img.onerror = () => setBgLoaded(true);
  }, [neutrinoBg, neutrinoBgMobile]);

  // Trigger hero animations after splash exits
  const handleSplashEnter = useCallback((isUserClick = false) => {
    setSplashOut(true);
    if (isUserClick) play(0);
    setTimeout(() => {
      setSplashDone(true);
      sessionStorage.setItem('splash_seen', '1');
    }, 700);
  }, [play]);

  // Ensure animations play smoothly even if splash was already seen
  useEffect(() => {
    if (splashDone) {
      const t = setTimeout(() => setHeroVisible(true), 150);
      return () => clearTimeout(t);
    }
  }, [splashDone]);

  const isFullyReady = isReady && bgLoaded && logoReady;

  // Trigger shockwave burst saat transisi loading → ready
  useEffect(() => {
    if (isFullyReady && !splashDone) {
      const t = setTimeout(() => {
        setShowShockwave(true);
        // Reset shockwave setelah animasinya selesai
        setTimeout(() => setShowShockwave(false), 700);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [isFullyReady, splashDone]);


  return (
    <>
      <Head>
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
        {ogImageUrl && <meta property="og:image:secure_url" content={ogImageUrl} />}
        {ogImageUrl && <meta property="og:image:type" content="image/jpeg" />}
        {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
      </Head>

      {/* ── SPLASH ─────────────────────────────────────────────── */}
      {!splashDone && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ${splashOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}
          style={{ background: 'radial-gradient(ellipse at 50% 38%, #231204 0%, #130b04 30%, #0c0a09 60%, #050403 100%)' }}
        >
          {/* ── Latar sinematik: sorot cahaya tengah */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,162,39,0.07) 0%, transparent 70%)' }} />

          {/* ── Particles — lebih banyak, variasi ukuran & kecepatan */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => {
              const size  = i % 3 === 0 ? 'w-1.5 h-1.5' : i % 3 === 1 ? 'w-1 h-1' : 'w-0.5 h-0.5';
              const speed = 6 + (i % 7);
              const delay = i * 0.35;
              const dx    = (i % 2 === 0 ? 1 : -1) * (20 + i * 6);
              return (
                <div
                  key={i}
                  className={`absolute rounded-full bg-gold opacity-0 ${size}`}
                  style={{
                    left: `${(i * 5.1 + 3) % 94}%`,
                    top: `${(i % 5) * 20 + 5}%`,
                    animation: `particleDrift ${speed}s ease-in ${delay}s infinite`,
                    '--dx': `${dx}px`,
                  } as React.CSSProperties}
                />
              );
            })}
            {/* Dot-dot kecil melayang dekat logo */}
            {[...Array(6)].map((_, i) => (
              <div
                key={`fdot-${i}`}
                className="absolute w-0.5 h-0.5 rounded-full bg-gold/60 opacity-0"
                style={{
                  left: `${42 + (i % 2 === 0 ? -1 : 1) * (8 + i * 4)}%`,
                  top: `${35 + i * 5}%`,
                  animation: `floatDot ${3 + i * 0.5}s ease-in-out ${i * 0.6}s infinite`,
                }}
              />
            ))}
          </div>

          {/* ── Garis ornamen horizontal atas & bawah */}
          <div className="absolute top-[12%] left-0 right-0 flex items-center px-8 pointer-events-none">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent splash-line" />
          </div>
          <div className="absolute bottom-[12%] left-0 right-0 flex items-center px-8 pointer-events-none">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent splash-line" />
          </div>

          {/* ── Konten utama */}
          <div className={`relative z-10 text-center px-6 flex flex-col items-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

            {/* ── Logo block dengan loading ring */}
            <div className="relative mb-8 flex items-center justify-center">

              {/* Shockwave ring — muncul sekejap saat transisi loading→ready */}
              {showShockwave && (
                <div
                  className="absolute rounded-full border border-gold/70 splash-shockwave"
                  style={{ width: 112, height: 112 }}
                />
              )}

              {/* Ring loading berputar — hanya saat belum ready */}
              {!isFullyReady && (
                <>
                  {/* Ring luar berputar */}
                  <div
                    className="absolute rounded-full splash-spin-ring"
                    style={{
                      width: 116, height: 116,
                      border: '2px solid transparent',
                      borderTopColor: 'rgba(201,162,39,0.8)',
                      borderRightColor: 'rgba(201,162,39,0.2)',
                    }}
                  />
                  {/* Ring dalam, arah berlawanan, lebih lambat */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 100, height: 100,
                      border: '1.5px solid transparent',
                      borderBottomColor: 'rgba(240,192,64,0.5)',
                      animation: 'spinRing 2.4s linear infinite reverse',
                    }}
                  />
                </>
              )}

              {/* Logo / placeholder */}
              {neutrinoLogo ? (
                <div
                  className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center p-2 border-2 transition-all duration-300 ${
                    isFullyReady
                      ? 'border-gold/60 splash-logo-pop splash-glow-burst'
                      : 'border-gold/25 bg-charcoal-dark/60'
                  }`}
                  style={{ background: isFullyReady ? 'rgba(28,16,4,0.7)' : 'rgba(28,16,4,0.5)' }}
                >
                  {/* Internal spiral spinner when not ready */}
                  {!logoReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-transparent border-t-gold/80 border-b-gold/80 rounded-full animate-spin" />
                      <div className="absolute w-4 h-4 sm:w-5 sm:h-5 border-2 border-transparent border-l-gold/60 border-r-gold/60 rounded-full" style={{ animation: 'spinRing 1.2s linear infinite reverse' }} />
                    </div>
                  )}

                  <img
                    src={neutrinoLogo}
                    alt="Logo Neutrino"
                    className={`w-full h-full object-contain transition-all duration-500 ${
                      logoReady ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                    onLoad={() => setLogoReady(true)}
                    onError={() => setLogoReady(true)}
                  />
                </div>
              ) : (
                <div
                  className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                    isFullyReady
                      ? 'border-gold/70 splash-logo-pop splash-glow-burst'
                      : 'border-gold/30 splash-logo-pulse'
                  }`}
                  style={{ background: 'rgba(28,16,4,0.9)' }}
                >
                  <span className="text-gold font-heading font-bold text-3xl leading-none">16</span>
                  <span className="text-gold/50 font-heading text-[9px] tracking-[0.3em] mt-0.5">XVI</span>
                </div>
              )}
            </div>

            {/* ── Status loading kecil di bawah logo */}
            <div className={`mb-6 transition-all duration-500 ${isFullyReady ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`} style={{ minHeight: 16 }}>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gold/40 animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 rounded-full bg-gold/40 animate-pulse" style={{ animationDelay: '200ms' }} />
                <div className="w-1 h-1 rounded-full bg-gold/40 animate-pulse" style={{ animationDelay: '400ms' }} />
              </div>
            </div>

            {/* ── Label sekolah */}
            <div className="splash-text-1">
              <div className="section-label text-[10px] text-gold/55 mb-4 tracking-[0.5em]">
                MTs Wahdah Islamiyah · Bone Bolango
              </div>
            </div>

            {/* ── Judul utama */}
            <div className="splash-text-2 overflow-hidden">
              <h1
                className="font-display text-gold-gradient font-black leading-[0.88]"
                style={{ fontSize: 'clamp(2.4rem, 11vw, 6.5rem)' }}
              >
                ANGKATAN
              </h1>
            </div>
            <div className="splash-text-3 overflow-hidden mb-5">
              <h1
                className="font-display text-cream font-black leading-[0.88]"
                style={{ fontSize: 'clamp(2.4rem, 11vw, 6.5rem)' }}
              >
                2026
              </h1>
            </div>

            {/* ── Ornamen tengah */}
            <div className="splash-text-4 flex items-center gap-4 mb-2 w-full max-w-[280px]">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/40 splash-line" />
              <span className="font-heading text-[10px] text-gold/70 tracking-[0.35em] uppercase shrink-0">Neutrino</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/40 splash-line" />
            </div>

            {/* ── Sub info */}
            <div className="splash-text-5">
              <p className="text-cream/35 font-body text-xs mb-8 tracking-widest">
                Ikhwa · Putra · 2023 – 2026
              </p>
            </div>

            {/* ── Tombol masuk */}
            <div className="splash-text-6">
              <button
                onClick={() => isFullyReady && handleSplashEnter(true)}
                disabled={!isFullyReady}
                className={`relative text-xs tracking-[0.3em] px-10 py-3.5 transition-all duration-500 overflow-hidden ${
                  isFullyReady
                    ? 'btn-gold hover:scale-105 hover:shadow-[0_0_35px_rgba(201,162,39,0.55)]'
                    : 'card-dark text-cream/30 cursor-wait border border-gold/15'
                }`}
              >
                {isFullyReady ? 'MASUK →' : 'MEMUAT...'}
              </button>
            </div>

          </div>

          {/* ── Sudut ornamen (corner decorations) */}
          <div className="absolute top-6 left-6 w-8 h-8 pointer-events-none opacity-30" style={{ borderTop: '1px solid #C9A227', borderLeft: '1px solid #C9A227' }} />
          <div className="absolute top-6 right-6 w-8 h-8 pointer-events-none opacity-30" style={{ borderTop: '1px solid #C9A227', borderRight: '1px solid #C9A227' }} />
          <div className="absolute bottom-6 left-6 w-8 h-8 pointer-events-none opacity-30" style={{ borderBottom: '1px solid #C9A227', borderLeft: '1px solid #C9A227' }} />
          <div className="absolute bottom-6 right-6 w-8 h-8 pointer-events-none opacity-30" style={{ borderBottom: '1px solid #C9A227', borderRight: '1px solid #C9A227' }} />

        </div>
      )}

      {/* ── MAIN ─────────────────────────────────────────────────── */}
      <div
        className="min-h-screen dark-paper relative overflow-hidden protected-content"
        onContextMenu={e => e.preventDefault()}
        style={{ visibility: splashDone ? 'visible' : 'hidden' }}
      >
        <Navbar />
        <GoldParticles />

        {/* ── HERO — FULL WIDTH ─────────────────────────────────── */}
        <section
          ref={heroRef}
          className="neutrino-hero min-h-screen relative flex items-center justify-center overflow-hidden"
        >
          {/* BG IMAGE — Desktop (md ke atas) */}
          {(neutrinoBg || !neutrinoBgMobile) && (
            <div
              className={neutrinoBgMobile ? 'hidden md:block absolute inset-0' : 'absolute inset-0'}
              style={{
                backgroundImage: neutrinoBg
                  ? `url('${neutrinoBg}')`
                  : `linear-gradient(135deg, #0c0a09 0%, #1a1306 50%, #0c0a09 100%)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: heroVisible ? 'scale(1)' : 'scale(1.15)',
                transition: 'all 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                opacity: heroVisible ? (neutrinoBg ? 0.45 : 1) : 0,
              }}
            />
          )}
          {/* BG IMAGE — Mobile (sm ke bawah, hanya jika ada foto mobile) */}
          {neutrinoBgMobile && (
            <div
              className="block md:hidden absolute inset-0"
              style={{
                backgroundImage: `url('${neutrinoBgMobile}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                transform: heroVisible ? 'scale(1)' : 'scale(1.15)',
                transition: 'all 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                opacity: heroVisible ? 0.45 : 0,
              }}
            />
          )}
          {/* Overlay layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark/80 via-charcoal-dark/20 to-charcoal-dark/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-dark/50 via-transparent to-charcoal-dark/50" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(12,10,9,0.6) 100%)' }} />
          {/* Gold accent lines */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

          {/* HERO CONTENT — Properly layered for all screen sizes */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-10 py-28 sm:py-32 flex flex-col items-center text-center">
            
            {/* Class Badge */}
            <div className={`transition-all duration-700 delay-100 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-4 sm:px-5 py-2 border border-gold/30 rounded-full backdrop-blur-sm bg-charcoal-dark/40">
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="section-label text-[9px] sm:text-[10px]">Ikhwa · Putra · Angkatan XVI</span>
              </div>
            </div>

            {/* Main Title — clamped so it never overflows or crops */}
            <div className={`transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div
                className="display-title text-gold-gradient leading-[0.85] mb-3"
                style={{ fontSize: 'clamp(3.5rem, 13vw, 10rem)' }}
              >
                NEUTRINO
              </div>
            </div>

            {/* Subtitle */}
            <div className={`transition-all duration-700 delay-300 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="font-script text-gold/60 mb-2" style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)' }}>
                of Generation
              </div>
              <div className="section-label text-cream/35 text-[9px] sm:text-[10px] mb-8 sm:mb-10 tracking-[0.4em]">
                MTS Wahdah Islamiyah · Bonebolango · 2023–2026
              </div>
            </div>

            {/* Stats Row */}
            <div className={`transition-all duration-700 delay-400 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="flex justify-center items-center gap-6 sm:gap-12 mb-8 sm:mb-10">
                {[
                  { val: neutrinoCount, label: 'Santri' },
                  null, // divider
                  { val: 3, label: 'Tahun' },
                  null,
                  { val: 'XVI', label: 'Angkatan' },
                ].map((item, i) =>
                  item === null
                    ? <div key={i} className="w-px h-8 bg-gold/20 hidden sm:block" />
                    : (
                      <div key={i} className="text-center">
                        <div className="text-2xl sm:text-4xl font-display font-bold text-gold leading-none">{item.val}</div>
                        <div className="text-cream/40 text-[10px] sm:text-xs font-heading tracking-wider uppercase mt-1">{item.label}</div>
                      </div>
                    )
                )}
              </div>
            </div>

            {/* CTA */}
            <div className={`transition-all duration-700 delay-500 ${heroVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
              <Link
                href="/kelas/neutrino"
                className="btn-gold inline-block text-xs px-8 sm:px-12 py-3 sm:py-4 hover:shadow-[0_0_40px_rgba(201,162,39,0.5)] hover:scale-105 transition-all duration-300"
              >
                Lihat Kelas Neutrino →
              </Link>
            </div>

            {/* Wali Kelas — separated with proper margin so it never overlaps scroll indicator */}
            <div className={`mt-10 sm:mt-14 pt-6 border-t border-gold/10 transition-all duration-700 delay-600 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
              <div className="text-cream/25 text-[9px] sm:text-[10px] font-heading tracking-wider uppercase mb-1">Wali Kelas</div>
              <div className="text-gold/55 text-sm sm:text-base font-display">Ustadz Taufik Hidayat</div>
            </div>
          </div>

          {/* SCROLL INDICATOR — absolute bottom, separate from content flow */}
          <div className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-1 pointer-events-none select-none">
            <span className="text-cream/20 text-[9px] font-heading tracking-widest">SCROLL</span>
            <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-gold/40 to-transparent animate-pulse" />
          </div>
        </section>

        {/* ── COUNTDOWN ─────────────────────────────────────────── */}
        <section
          ref={countdownRef}
          className={`py-16 sm:py-20 px-4 relative scroll-reveal ${countdownInView ? 'revealed' : ''}`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="divider-ornament justify-center mb-10 sm:mb-12">
              <span className="section-label text-xs">Menuju Kelulusan</span>
            </div>
            {neutrinoLogo && (
              <img src={neutrinoLogo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-6 drop-shadow-[0_0_15px_rgba(201,162,39,0.3)]" />
            )}
            <CountdownTimer targetDate={GRADUATION_DATE} />
          </div>
        </section>

        {/* ── ABOUT ─────────────────────────────────────────────── */}
        <section
          ref={aboutRef}
          className={`py-16 sm:py-20 px-4 scroll-reveal ${aboutInView ? 'revealed' : ''}`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <div className="section-label mb-4">Tentang Kami</div>
                <h2 className="section-title text-cream mb-6 leading-tight">
                  Angkatan <span className="text-gold-gradient">XVI</span><br />Wahdah Islamiyah
                </h2>
                <div className="divider-gold w-24" />
                <p className="text-cream/65 font-body text-sm leading-loose mt-4 mb-6">
                  Pondok Pesantren Wahdah Islamiyah Bonebolango mencetak generasi yang berlandaskan iman dan ilmu.
                  Angkatan ke-26 MTS — <strong className="text-gold">Neutrino</strong> (Ikhwa/Putra) — menyelesaikan perjalanan
                  tiga tahun penuh kenangan, hafalan, dan perjuangan.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/timeline" className="btn-gold text-xs py-2 px-5">Timeline →</Link>
                  <Link href="/gallery" className="btn-outline-gold text-xs py-2 px-5">Gallery</Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: 'Total Santri', value: String(neutrinoCount), sub: 'Kelas Neutrino', delay: '0ms' },
                  { label: 'Angkatan Ke', value: 'XVI', sub: 'Sejak Berdiri', delay: '100ms' },
                  { label: 'Tahun Bersama', value: '3', sub: '2023–2026', delay: '200ms' },
                  { label: 'Hafalan', value: '∞', sub: 'Juz Al-Quran', delay: '300ms' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="card-dark p-4 sm:p-6 corner-ornament transition-transform hover:scale-[1.02]"
                    style={{ transitionDelay: aboutInView ? stat.delay : '0ms' }}
                  >
                    <div className="text-3xl sm:text-4xl font-display font-bold text-gold-gradient mb-1">{stat.value}</div>
                    <div className="text-cream text-xs sm:text-sm font-heading tracking-wide">{stat.label}</div>
                    <div className="text-cream/40 text-[10px] font-body mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── QUICK LINKS ───────────────────────────────────────── */}
        <section
          ref={linksRef}
          className={`py-14 sm:py-16 px-4 border-t border-gold/10 scroll-reveal ${linksInView ? 'revealed' : ''}`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <p className="section-label mb-6 sm:mb-8">Eksplorasi Lebih Lanjut</p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {[
                { href: '/gallery', icon: '📸', label: 'Gallery' },
                { href: '/drive', icon: '📁', label: 'Drive' },
                { href: '/timeline', icon: '📅', label: 'Timeline' },
                { href: '/quotes', icon: '📌', label: 'Quotes Wall' },
              ].map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="card-dark px-5 sm:px-6 py-3 sm:py-4 flex items-center gap-3 hover:border-gold/50 hover:scale-105 transition-all duration-300 group"
                  style={{ transitionDelay: linksInView ? `${i * 80}ms` : '0ms' }}
                >
                  <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="font-heading text-xs sm:text-sm tracking-wider text-cream/75 group-hover:text-gold transition-colors">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="easter-egg-trigger" className="py-8 px-4 border-t border-gold/10 text-center cursor-pointer select-none">
          <div className="text-gold font-heading text-xs tracking-[0.3em] uppercase mb-2">Yearbook Angkatan 26 · XVI</div>
          <a
            href="https://maps.google.com/?q=Pesantren+Wahdah+Islamiyah+Bonebolango+Gorontalo"
            target="_blank" rel="noopener noreferrer"
            className="text-cream/30 hover:text-gold/60 text-xs font-body transition-colors inline-flex items-center gap-1"
          >
            📍 MTS Pondok Pesantren Wahdah Islamiyah (Bonebolango) © 2026
          </a>
          <div className="text-cream/20 text-[10px] font-body mt-1">Made with ❤️ oleh Angkatan 26</div>
        </footer>

        <EasterEgg />
      </div>
    </>
  );
}
