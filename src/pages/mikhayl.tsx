// src/pages/mikhayl.tsx
// ── EASTER EGG PAGE ─── Hidden, no navigation link to this page ──
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const MESSAGES = [
  "Selamat! Kamu menemukan halaman rahasia ini.",
  "Halaman ini tidak bisa ditemukan dari menu manapun.",
  "Kamu pasti penasaran... atau memang jeli.",
  "Terima kasih sudah menjelajahi setiap sudut website ini.",
];

export default function EasterEggPage() {
  const [mounted, setMounted] = useState(false);
  const [currentMsg, setCurrentMsg] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 200);
    const t2 = setTimeout(() => setShowContent(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Cycle through messages
  useEffect(() => {
    if (!showContent) return;
    const interval = setInterval(() => {
      setCurrentMsg(prev => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showContent]);

  return (
    <>
      <Head>
        <title>✨ Easter Egg | Yearbook Angkatan 26</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Kamu menemukan halaman tersembunyi dari Yearbook Angkatan 26." />
      </Head>

      <div
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, #1c1008 0%, #0c0a09 50%, #050403 100%)',
        }}
      >
        {/* Ambient particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gold"
              style={{
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0,
                animation: `particleDrift ${6 + Math.random() * 8}s ease-in infinite`,
                animationDelay: `${Math.random() * 6}s`,
                '--dx': `${(Math.random() - 0.5) * 100}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Gold light streaks */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-gold/10 via-transparent to-gold/5 pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-gold/8 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10">
          {/* Initial reveal animation */}
          <div className={`text-center transition-all duration-[2s] ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 border border-gold/20 rounded-full backdrop-blur-sm bg-charcoal-dark/40">
              <span className="text-sm animate-pulse">✨</span>
              <span className="font-heading text-[10px] tracking-[0.4em] text-gold/70 uppercase">Easter Egg Found</span>
              <span className="text-sm animate-pulse">✨</span>
            </div>

            {/* Congratulations */}
            <h1
              className="font-display font-black text-gold-gradient mb-6"
              style={{ fontSize: 'clamp(2rem, 8vw, 5rem)', lineHeight: 0.95 }}
            >
              Selamat!
            </h1>

            {/* Rotating messages */}
            <div className="h-12 flex items-center justify-center overflow-hidden mb-8">
              <p
                key={currentMsg}
                className="text-cream/60 font-body text-sm sm:text-base max-w-md animate-fade-in"
              >
                {MESSAGES[currentMsg]}
              </p>
            </div>
          </div>

          {/* Detailed content - reveals after delay */}
          <div className={`max-w-2xl w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Divider */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
              <div className="w-2 h-2 rounded-full bg-gold/50 animate-pulse" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>

            {/* About this website */}
            <div className="card-dark p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <h2 className="font-display text-cream font-bold text-base">Tentang Website Ini</h2>
                  <p className="text-gold/50 text-[10px] font-heading tracking-widest uppercase">Behind the Scenes</p>
                </div>
              </div>
              <div className="text-cream/60 font-body text-sm leading-relaxed space-y-3">
                <p>
                  Website <strong className="text-gold">Yearbook Angkatan 26</strong> ini dibuat dengan penuh cinta 
                  dan dedikasi sebagai kenangan digital untuk seluruh santri angkatan ke-16 
                  MTS Pondok Pesantren Wahdah Islamiyah Bonebolango.
                </p>
                <p>
                  Dibangun menggunakan <span className="text-gold/80">Next.js</span>, <span className="text-gold/80">Supabase</span>, 
                  dan <span className="text-gold/80">Framer Motion</span>, website ini dirancang untuk mengabadikan 
                  momen-momen berharga selama 3 tahun perjalanan kita bersama.
                </p>
                <p>
                  Dari <em>hafalan Al-Quran</em> hingga <em>rihlah</em> bersama, setiap kenangan tersimpan di sini 
                  agar kita bisa mengingatnya kembali suatu hari nanti.
                </p>
              </div>
            </div>

            {/* Thank you message */}
            <div className="card-dark p-6 sm:p-8 mb-6 border-gold/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <span className="text-lg">❤️</span>
                </div>
                <div>
                  <h2 className="font-display text-cream font-bold text-base">Pesan dari Developer</h2>
                  <p className="text-gold/50 text-[10px] font-heading tracking-widest uppercase">A Personal Note</p>
                </div>
              </div>
              <div className="text-cream/60 font-body text-sm leading-relaxed space-y-3">
                <p>
                  Terima kasih kepada kamu yang menemukan halaman ini. Kamu benar-benar explorer sejati! 🎉
                </p>
                <p>
                  Kepada seluruh santri <strong className="text-gold">Angkatan 26</strong> — terima kasih atas 
                  3 tahun yang luar biasa. Kalian adalah bagian dari cerita yang tidak akan pernah terlupakan.
                </p>
                <p className="font-script text-gold text-lg">
                  &ldquo;Perjalanan 1000 mil dimulai dari satu langkah pertama.&rdquo;
                </p>
              </div>
            </div>

            {/* Gallery placeholder - user can add photos here later */}
            <div className="card-dark p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <span className="text-lg">📸</span>
                </div>
                <div>
                  <h2 className="font-display text-cream font-bold text-base">Momen Spesial</h2>
                  <p className="text-gold/50 text-[10px] font-heading tracking-widest uppercase">Special Moments</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Photo placeholders — replace src with actual photos */}
                {[
                  { emoji: '🏫', label: 'Hari Pertama' },
                  { emoji: '📖', label: 'Hafalan Quran' },
                  { emoji: '⛰️', label: 'Rihlah Bersama' },
                  { emoji: '🏆', label: 'Lomba & Prestasi' },
                  { emoji: '🤝', label: 'Persaudaraan' },
                  { emoji: '🎓', label: 'Wisuda' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl border border-gold/15 bg-charcoal-dark/50 flex flex-col items-center justify-center gap-2 hover:border-gold/40 transition-all group cursor-default"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                    <span className="text-cream/30 text-[10px] font-heading tracking-wider uppercase">{item.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-cream/20 text-[10px] text-center mt-3 font-body">
                Foto-foto kenangan bisa ditambahkan nanti di halaman ini
              </p>
            </div>

            {/* Developer Card */}
            <div className="card-dark p-6 sm:p-8 mb-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/40 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(201,162,39,0.2)]">
                <span className="font-display font-black text-gold text-2xl">M</span>
              </div>
              <h3 className="font-display text-cream font-bold text-lg mb-1">Mikhayl</h3>
              <p className="text-gold/60 text-xs font-heading tracking-widest uppercase mb-4">Developer & Designer</p>
              <p className="text-cream/50 font-body text-sm mb-6 max-w-md mx-auto">
                Membangun hal-hal yang bermakna melalui kode. Saya percaya bahwa teknologi 
                bisa digunakan untuk mengabadikan kenangan yang berharga.
              </p>
              <a
                href="https://mikhayl.my.id"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-xs px-8 py-3 inline-block hover:shadow-[0_0_40px_rgba(201,162,39,0.5)] transition-all"
              >
                🌐 Kunjungi Portfolio →
              </a>
            </div>

            {/* Back to home */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-cream/30 hover:text-gold transition-colors text-xs font-heading tracking-wider"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <div className="text-center py-6 border-t border-gold/5">
          <div className="text-gold/20 font-heading text-[9px] tracking-[0.4em] uppercase">
            Yearbook Angkatan 26 · Neutrino · 2023–2026
          </div>
          <div className="text-cream/10 text-[8px] font-body mt-1">
            Kamu menemukan halaman ini — selamat, kamu spesial ✨
          </div>
        </div>
      </div>
    </>
  );
}
