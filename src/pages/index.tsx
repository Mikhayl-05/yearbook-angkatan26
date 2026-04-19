// src/pages/index.tsx
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import GoldParticles from '@/components/ui/GoldParticles';
import CountdownTimer from '@/components/ui/CountdownTimer';
import EasterEgg from '@/components/ui/EasterEgg';
import { supabase } from '@/lib/supabase';
import { useInView } from 'react-intersection-observer';

// GRADUATION DATE — 16 Mei 2026
const GRADUATION_DATE = new Date('2026-05-16T08:00:00');

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [hoverSide, setHoverSide] = useState<null | 'left' | 'right'>(null);
  const [neutrinoBg, setNeutrinoBg] = useState('');
  const [allAxeBg, setAllAxeBg] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll reveal refs
  const { ref: aboutRef, inView: aboutInView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const { ref: countdownRef, inView: countdownInView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const { ref: linksRef, inView: linksInView } = useInView({ triggerOnce: true, threshold: 0.15 });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Fetch admin-uploaded background images
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*');
        if (data) {
          data.forEach((s: { key: string; value: string }) => {
            if (s.key === 'neutrino_bg_url' && s.value) setNeutrinoBg(s.value);
            if (s.key === 'allaxe_bg_url' && s.value) setAllAxeBg(s.value);
          });
        }
      } catch { /* */ }
    })();
  }, []);

  return (
    <div className="min-h-screen dark-paper relative overflow-hidden protected-content" ref={containerRef} onContextMenu={e => e.preventDefault()}>
      <Navbar />
      <GoldParticles count={30} />

      {/* ── HERO SPLIT SCREEN ──────────────────────────────── */}
      <div className="split-screen min-h-screen relative">

        {/* ─── LEFT: NEUTRINO (Ikhwa) ─────────────────────── */}
        <Link
          href="/kelas/neutrino"
          className="relative flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
          onMouseEnter={() => setHoverSide('left')}
          onMouseLeave={() => setHoverSide(null)}
        >
          {/* BG IMAGE */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: neutrinoBg
                ? `url('${neutrinoBg}')`
                : `url('/images/neutrino-group.jpg'), linear-gradient(135deg, #0c0a09 0%, #1c1917 100%)`,
            }}
          />
          {/* GRADIENT OVERLAY — fade effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark/70 via-charcoal-dark/50 to-charcoal-dark/90" />
          {/* GOLD SIDE BORDER */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold to-transparent opacity-60" />

          {/* CONTENT */}
          <div className={`relative z-10 text-center px-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* ANGKATAN BADGE */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 border border-gold/40 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="section-label text-[10px]">Ikhwa · Putra</span>
            </div>

            {/* TITLE */}
            <div className="display-title text-gold-gradient mb-2">
              NEUTRINO
            </div>
            <div className="font-script text-gold/80 text-2xl mb-1">of Generation</div>
            <div className="section-label text-cream/50 text-[10px] mb-6">Angkatan XVI · 2023–2026</div>

            {/* STATS */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-gold">29</div>
                <div className="text-cream/50 text-xs font-heading tracking-wider uppercase">Santri</div>
              </div>
              <div className="w-px bg-gold/20" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-gold">3</div>
                <div className="text-cream/50 text-xs font-heading tracking-wider uppercase">Tahun</div>
              </div>
            </div>

            {/* CTA */}
            <div className={`transition-all duration-500 ${hoverSide === 'left' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="btn-gold inline-block text-xs">Lihat Kelas →</span>
            </div>
          </div>

          {/* WALI KELAS TAG */}
          <div className="absolute bottom-8 left-8 right-8 text-center">
            <div className="text-cream/30 text-xs font-heading tracking-wider uppercase">Wali Kelas</div>
            <div className="text-gold/70 text-sm font-display">Ustadz Taufik Hidayat</div>
          </div>
        </Link>

        {/* ─── RIGHT: ALL AXE (Akhwat) ─────────────────────── */}
        <Link
          href="/kelas/all-axe"
          className="relative flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
          onMouseEnter={() => setHoverSide('right')}
          onMouseLeave={() => setHoverSide(null)}
        >
          {/* BG IMAGE */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: allAxeBg
                ? `url('${allAxeBg}')`
                : `url('/images/allaxe-group.jpg'), linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark/70 via-charcoal-dark/50 to-charcoal-dark/90" />

          {/* CONTENT */}
          <div className={`relative z-10 text-center px-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 border border-gold/40 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-light animate-pulse" />
              <span className="section-label text-[10px]">Akhwat · Putri</span>
            </div>

            <div className="display-title text-gold-gradient mb-2">
              ALL AXE
            </div>
            <div className="font-script text-gold/80 text-2xl mb-1">of Generation</div>
            <div className="section-label text-cream/50 text-[10px] mb-6">Angkatan XVI · 2023–2026</div>

            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-gold">10</div>
                <div className="text-cream/50 text-xs font-heading tracking-wider uppercase">Santri</div>
              </div>
              <div className="w-px bg-gold/20" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-gold">3</div>
                <div className="text-cream/50 text-xs font-heading tracking-wider uppercase">Tahun</div>
              </div>
            </div>

            <div className={`transition-all duration-500 ${hoverSide === 'right' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="btn-gold inline-block text-xs">Lihat Kelas →</span>
            </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8 text-center">
            <div className="text-cream/30 text-xs font-heading tracking-wider uppercase">Wali Kelas</div>
            <div className="text-gold/70 text-sm font-display">Ustadzah Ratna Muhi</div>
          </div>
        </Link>

        {/* CENTER LOGO OVERLAY */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="w-16 h-16 rounded-full border-2 border-gold bg-charcoal-dark/90 backdrop-blur-sm flex flex-col items-center justify-center shadow-gold animate-pulse-gold">
            <div className="text-gold font-heading font-bold text-base leading-none">26</div>
            <div className="text-gold/60 font-heading text-[8px] tracking-widest">XVI</div>
          </div>
        </div>

        {/* SCROLL INDICATOR — centered */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex flex-col items-center gap-1 text-cream/30 animate-bounce pointer-events-none">
          <span className="section-label text-[9px]">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold/50 to-transparent" />
        </div>
      </div>

      {/* ── COUNTDOWN SECTION ──────────────────────────────── */}
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

      {/* ── ABOUT SECTION ──────────────────────────────────── */}
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
                Angkatan ke-26 MTS — terdiri dari <strong className="text-gold">Neutrino</strong> (Ikhwa/Putra)
                dan <strong className="text-gold">All Axe</strong> (Akhwat/Putri) — menyelesaikan perjalanan
                tiga tahun penuh kenangan, hafalan, dan perjuangan bersama.
              </p>
              <div className="flex gap-4">
                <Link href="/timeline" className="btn-gold text-xs py-2 px-5">Timeline →</Link>
                <Link href="/gallery" className="btn-outline-gold text-xs py-2 px-5">Gallery</Link>
              </div>
            </div>

            <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-4">
              {[
                { label: 'Total Santri', value: '39', sub: 'Ikhwa & Akhwat' },
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

      {/* ── QUICK LINKS ────────────────────────────────────── */}
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
  );
}
