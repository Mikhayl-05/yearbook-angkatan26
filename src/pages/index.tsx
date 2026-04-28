// src/pages/index.tsx
// Fixed: PC hero layout, animations after splash, mobile performance
import { useEffect, useRef, useState, useCallback } from 'react';
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

export const getServerSideProps = async () => {
  let ogImageUrl = null;
  try {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'og_image_url').single();
    if (data?.value) ogImageUrl = data.value;
  } catch { /* ignore */ }
  return { props: { ogImageUrl } };
};

export default function HomePage({ ogImageUrl }: { ogImageUrl: string | null }) {
  const [mounted, setMounted] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [splashOut, setSplashOut] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [neutrinoBg, setNeutrinoBg] = useState('');
  const [bgLoaded, setBgLoaded] = useState(false);
  const [neutrinoCount, setNeutrinoCount] = useState(29);
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

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*');
        if (data) {
          let bgUrl = '';
          data.forEach((s: { key: string; value: string }) => {
            if (s.key === 'neutrino_bg_url' && s.value) {
              bgUrl = s.value;
              setNeutrinoBg(s.value);
            }
          });
          if (bgUrl) {
            const img = new Image();
            img.src = bgUrl;
            img.onload = () => setBgLoaded(true);
            img.onerror = () => setBgLoaded(true);
          } else {
            setBgLoaded(true);
          }
        } else {
          setBgLoaded(true);
        }
        const { count: c1 } = await supabase.from('santri').select('*', { count: 'exact', head: true }).eq('kelas', 'neutrino');
        if (c1 !== null) setNeutrinoCount(c1);
      } catch { setBgLoaded(true); }
    })();
  }, []);

  const isFullyReady = isReady && bgLoaded;

  return (
    <>
      <Head>
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      </Head>

      {/* ── SPLASH ─────────────────────────────────────────────── */}
      {!splashDone && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ${splashOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}
          style={{ background: 'radial-gradient(ellipse at center, #1c1008 0%, #0c0a09 60%, #050403 100%)' }}
        >
          {/* Splash particles - CSS only, no JS heavy lifting */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute w-1 h-1 rounded-full bg-gold opacity-0"
                style={{
                  left: `${(i * 8.3 + 5)}%`, top: `${(i % 4) * 25 + 12}%`,
                  animation: `particleDrift ${7 + i % 5}s ease-in ${i * 0.4}s infinite`,
                  '--dx': `${(i % 2 === 0 ? 1 : -1) * (30 + i * 5)}px`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          <div className={`relative z-10 text-center px-6 flex flex-col items-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-20 h-20 rounded-full border-2 border-gold/60 flex flex-col items-center justify-center mb-8 shadow-[0_0_40px_rgba(201,162,39,0.4)]"
              style={{ background: 'rgba(28,16,4,0.9)' }}>
              <span className="text-gold font-heading font-bold text-2xl leading-none">16</span>
              <span className="text-gold/50 font-heading text-[9px] tracking-widest">XVI</span>
            </div>
            <div className="section-label text-[10px] text-gold/60 mb-3 tracking-[0.5em]">MTs Wahdah Islamiyah · Bone Bolango</div>
            <h1 className="font-display text-gold-gradient font-black" style={{ fontSize: 'clamp(2.2rem, 10vw, 6rem)', lineHeight: 0.9 }}>ANGKATAN</h1>
            <h1 className="font-display text-cream font-black mb-6" style={{ fontSize: 'clamp(2.2rem, 10vw, 6rem)', lineHeight: 0.9 }}>2026</h1>
            <div className="flex items-center gap-4 mb-2 text-gold/60">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/50" />
              <span className="font-heading text-xs tracking-widest uppercase">Neutrino</span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/50" />
            </div>
            <p className="text-cream/40 font-body text-xs mb-10">2023 – 2026</p>
            <button
              onClick={() => isFullyReady && handleSplashEnter(true)}
              disabled={!isFullyReady}
              className={`text-xs tracking-widest px-8 py-3 transition-all ${
                isFullyReady ? 'btn-gold hover:scale-105 hover:shadow-[0_0_30px_rgba(201,162,39,0.5)]' : 'card-dark text-cream/40 cursor-wait border border-gold/20'
              }`}
            >
              {isFullyReady ? 'Masuk →' : 'Memuat...'}
            </button>
          </div>
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
          {/* BG IMAGE */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: neutrinoBg
                ? `url('${neutrinoBg}')`
                : `linear-gradient(135deg, #0c0a09 0%, #1a1306 50%, #0c0a09 100%)`,
              transform: heroVisible ? 'scale(1)' : 'scale(1.15)',
              transition: 'all 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              opacity: heroVisible ? (neutrinoBg ? 0.45 : 1) : 0,
            }}
          />
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
