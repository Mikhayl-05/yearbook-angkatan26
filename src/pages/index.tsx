// src/pages/index.tsx
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import GoldParticles from '@/components/ui/GoldParticles';
import CountdownTimer from '@/components/ui/CountdownTimer';
import EasterEgg from '@/components/ui/EasterEgg';
import { supabase } from '@/lib/supabase';
import { useInView } from 'react-intersection-observer';
import { useMusic } from '@/context/MusicContext';
import Head from 'next/head';

// GRADUATION DATE — 16 Mei 2026
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
  const [neutrinoBg, setNeutrinoBg] = useState('');
  const [neutrinoCount, setNeutrinoCount] = useState(29);
  const containerRef = useRef<HTMLDivElement>(null);
  const { play, isReady } = useMusic();

  // Scroll reveal refs
  const { ref: aboutRef, inView: aboutInView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const { ref: countdownRef, inView: countdownInView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const { ref: linksRef, inView: linksInView } = useInView({ triggerOnce: true, threshold: 0.15 });

  // Show splash only once per session
  useEffect(() => {
    const seen = sessionStorage.getItem('splash_seen');
    if (seen) { setSplashDone(true); }
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSplashEnter = (isUserClick = false) => {
    setSplashOut(true);
    if (isUserClick) {
      play(0); // auto-play first track
    }
    setTimeout(() => {
      setSplashDone(true);
      sessionStorage.setItem('splash_seen', '1');
    }, 700);
  };

  // Fetch admin-uploaded background images and student counts
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*');
        if (data) {
          data.forEach((s: { key: string; value: string }) => {
            if (s.key === 'neutrino_bg_url' && s.value) setNeutrinoBg(s.value);
          });
        }
        
        const { count: c1 } = await supabase.from('santri').select('*', { count: 'exact', head: true }).eq('kelas', 'neutrino');
        if (c1 !== null) setNeutrinoCount(c1);
      } catch { /* */ }
    })();
  }, []);

  return (
    <>
      <Head>
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      </Head>

      {/* ── SPLASH SCREEN ──────────────────────────────── */}
      {!splashDone && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ${splashOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          style={{
            background: 'radial-gradient(ellipse at center, #1c1008 0%, #0c0a09 60%, #050403 100%)',
          }}
        >
          {/* Gold particles overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-gold opacity-0"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `particleDrift ${6 + Math.random() * 6}s ease-in infinite`,
                  animationDelay: `${Math.random() * 4}s`,
                  '--dx': `${(Math.random() - 0.5) * 80}px`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Badge */}
          <div className="relative z-10 text-center px-6 flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-full border-2 border-gold/60 flex flex-col items-center justify-center mb-8 shadow-[0_0_40px_rgba(201,162,39,0.4)]"
              style={{ background: 'rgba(28,16,4,0.9)' }}
            >
              <span className="text-gold font-heading font-bold text-2xl leading-none">26</span>
              <span className="text-gold/50 font-heading text-[9px] tracking-widest">XVI</span>
            </div>

            <div className="section-label text-[10px] text-gold/60 mb-3 tracking-[0.5em]">
              MTs Wahdah Islamiyah · Bone Bolango
            </div>

            <h1
              className="font-display text-gold-gradient font-black mb-2"
              style={{ fontSize: 'clamp(2.2rem, 10vw, 6rem)', lineHeight: 0.9 }}
            >
              ANGKATAN
            </h1>
            <h1
              className="font-display text-cream font-black mb-6"
              style={{ fontSize: 'clamp(2.2rem, 10vw, 6rem)', lineHeight: 0.9 }}
            >
              2026
            </h1>

            <div className="flex items-center gap-4 mb-2 text-gold/60">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/50" />
              <span className="font-heading text-xs tracking-widest uppercase">Neutrino</span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/50" />
            </div>

            <p className="text-cream/40 font-body text-xs mb-10">2023 – 2026</p>

            <button
              onClick={() => isReady && handleSplashEnter(true)}
              disabled={!isReady}
              className={`text-xs tracking-widest px-8 py-3 transition-colors ${
                isReady 
                  ? 'btn-gold animate-pulse hover:animate-none' 
                  : 'card-dark text-cream/40 cursor-wait border border-gold/20'
              }`}
            >
              {isReady ? 'Masuk →' : 'Memuat Kenangan...'}
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <div
        className="min-h-screen dark-paper relative overflow-hidden protected-content"
        ref={containerRef}
        onContextMenu={e => e.preventDefault()}
        style={{ visibility: splashDone ? 'visible' : 'hidden' }}
      >
        <Navbar />
        <GoldParticles count={30} />

        {/* ── HERO — FULL WIDTH NEUTRINO ──────────────────── */}
        <div className="neutrino-hero min-h-screen relative flex items-center justify-center overflow-hidden">
          {/* BG IMAGE with cinematic overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] ease-out"
            style={{
              backgroundImage: neutrinoBg
                ? `url('${neutrinoBg}')`
                : `url('/images/neutrino-group.jpg'), linear-gradient(135deg, #0c0a09 0%, #1c1917 100%)`,
              opacity: neutrinoBg ? 0.4 : 1,
              transform: mounted ? 'scale(1)' : 'scale(1.1)',
            }}
          />
          {/* Multi-layer gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark/70 via-charcoal-dark/30 to-charcoal-dark/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-dark/60 via-transparent to-charcoal-dark/60" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(12,10,9,0.7) 100%)' }} />
          
          {/* Animated gold lines */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          {/* CONTENT */}
          <div className={`relative z-10 text-center px-6 sm:px-8 max-w-4xl mx-auto transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {/* Class Badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 border border-gold/30 rounded-full backdrop-blur-sm bg-charcoal-dark/30">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="section-label text-[10px]">Ikhwa · Putra · Angkatan XVI</span>
            </div>

            {/* Main Title */}
            <div className="display-title text-gold-gradient mb-4" style={{ fontSize: 'clamp(4rem, 15vw, 12rem)' }}>NEUTRINO</div>
            <div className="font-script text-gold/70 text-3xl sm:text-4xl mb-2">of Generation</div>
            <div className="section-label text-cream/40 text-[10px] mb-10 tracking-[0.5em]">MTS Wahdah Islamiyah · Bonebolango · 2023–2026</div>

            {/* Stats Row */}
            <div className="flex justify-center gap-6 sm:gap-12 mb-10">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-display font-bold text-gold">{neutrinoCount}</div>
                <div className="text-cream/40 text-xs font-heading tracking-wider uppercase mt-1">Santri</div>
              </div>
              <div className="w-px bg-gold/20 self-stretch" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-display font-bold text-gold">3</div>
                <div className="text-cream/40 text-xs font-heading tracking-wider uppercase mt-1">Tahun</div>
              </div>
              <div className="w-px bg-gold/20 self-stretch" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-display font-bold text-gold">XVI</div>
                <div className="text-cream/40 text-xs font-heading tracking-wider uppercase mt-1">Angkatan</div>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href="/kelas/neutrino"
              className="btn-gold inline-block text-xs px-10 py-4 hover:shadow-[0_0_50px_rgba(201,162,39,0.5)] transition-all duration-500"
            >
              Lihat Kelas Neutrino →
            </Link>

            {/* Wali Kelas */}
            <div className="mt-12 pt-8 border-t border-gold/10">
              <div className="text-cream/25 text-xs font-heading tracking-wider uppercase">Wali Kelas</div>
              <div className="text-gold/60 text-sm font-display mt-1">Ustadz Taufik Hidayat</div>
            </div>
          </div>

          {/* SCROLL INDICATOR */}
          <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-1 text-cream/30 pointer-events-none select-none">
            <span className="section-label text-[9px]">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-gold/40 to-transparent animate-pulse" />
          </div>
        </div>

        {/* ── COUNTDOWN SECTION ────────────────────────────── */}
        <section
          ref={countdownRef}
          className={`py-20 px-4 relative scroll-reveal ${countdownInView ? 'revealed' : ''}`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="divider-ornament justify-center mb-12">
              <span className="section-label text-xs">Menuju Kelulusan</span>
            </div>
            <CountdownTimer targetDate={GRADUATION_DATE} />
          </div>
        </section>

        {/* ── ABOUT SECTION ────────────────────────────────── */}
        <section
          ref={aboutRef}
          className={`py-20 px-4 scroll-reveal ${aboutInView ? 'revealed' : ''}`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="magazine-grid gap-12 items-center">
              <div className="col-span-12 md:col-span-5">
                <div className="section-label mb-4">Tentang Kami</div>
                <h2 className="section-title text-cream mb-6 leading-tight">
                  Angkatan <span className="text-gold-gradient">XVI</span><br />
                  Wahdah Islamiyah
                </h2>
                <div className="divider-gold w-24" />
                <p className="text-cream/70 font-body text-sm leading-loose mt-4 mb-6">
                  Pondok Pesantren Wahdah Islamiyah Bonebolango mencetak generasi yang berlandaskan iman dan ilmu.
                  Angkatan ke-26 MTS — <strong className="text-gold">Neutrino</strong> (Ikhwa/Putra) — menyelesaikan perjalanan
                  tiga tahun penuh kenangan, hafalan, dan perjuangan bersama.
                </p>
                <div className="flex gap-4">
                  <Link href="/timeline" className="btn-gold text-xs py-2 px-5">Timeline →</Link>
                  <Link href="/gallery" className="btn-outline-gold text-xs py-2 px-5">Gallery</Link>
                </div>
              </div>

              <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Santri', value: String(neutrinoCount), sub: 'Kelas Neutrino' },
                  { label: 'Angkatan Ke', value: 'XVI', sub: 'Sejak Berdiri' },
                  { label: 'Tahun Bersama', value: '3', sub: '2023–2026' },
                  { label: 'Hafalan', value: '∞', sub: 'Juz Al-Quran' },
                ].map((stat) => (
                  <div key={stat.label} className="card-dark p-6 corner-ornament">
                    <div className="text-4xl font-display font-bold text-gold-gradient mb-1">{stat.value}</div>
                    <div className="text-cream text-sm font-heading tracking-wide">{stat.label}</div>
                    <div className="text-cream/40 text-xs font-body mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── QUICK LINKS ──────────────────────────────────── */}
        <section
          ref={linksRef}
          className={`py-16 px-4 border-t border-gold/10 scroll-reveal ${linksInView ? 'revealed' : ''}`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <p className="section-label mb-8">Eksplorasi Lebih Lanjut</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { href: '/gallery', icon: '📸', label: 'Gallery' },
                { href: '/timeline', icon: '📅', label: 'Timeline' },
                { href: '/quotes', icon: '📌', label: 'Quotes Wall' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="card-dark px-6 py-4 flex items-center gap-3 hover:border-gold/50 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="font-heading text-sm tracking-wider text-cream/80 group-hover:text-gold transition-colors">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="easter-egg-trigger" className="py-8 px-4 border-t border-gold/10 text-center cursor-pointer">
          <div className="text-gold font-heading text-xs tracking-[0.3em] uppercase mb-2">
            Yearbook Angkatan 26 · XVI
          </div>
          <a
            href="https://maps.google.com/?q=Pesantren+Wahdah+Islamiyah+Bonebolango+Gorontalo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream/30 hover:text-gold/60 text-xs font-body transition-colors inline-flex items-center gap-1"
          >
            📍 MTS Pondok Pesantren Wahdah Islamiyah (Bonebolango) © 2026
          </a>
          <div className="text-cream/20 text-[10px] font-body mt-1">
            Made with ❤️ oleh Angkatan 26
          </div>
        </footer>

        {/* EASTER EGG */}
        <EasterEgg />
      </div>
    </>
  );
}
