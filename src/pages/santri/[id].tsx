// src/pages/santri/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { SantriDB, SantriPhoto, CustomLink } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import { LINK_GRADIENT_PRESETS } from '@/components/sections/StudentCard';

export default function SantriDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [santri, setSantri] = useState<SantriDB | null>(null);
  const [photos, setPhotos] = useState<SantriPhoto[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: s } = await supabase.from('santri').select('*').eq('id', id).single();
      if (s) setSantri(s as SantriDB);
      const { data: p } = await supabase.from('santri_photos').select('*').eq('santri_id', id).order('order_num');
      if (p) setPhotos(p as SantriPhoto[]);
    } catch { /* */ }
    setLoading(false);
  };

  // All photos: main foto + additional photos
  const allPhotos = [
    ...(santri?.foto ? [{ id: 'main', url: santri.foto, santri_id: santri.id, order_num: 0, created_at: '' }] : []),
    ...photos,
  ];

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % Math.max(allPhotos.length, 1));
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + Math.max(allPhotos.length, 1)) % Math.max(allPhotos.length, 1));

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
  };

  const birthDate = santri ? new Date(santri.tanggal_lahir) : null;
  const formattedBirth = birthDate
    ? birthDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  if (loading) {
    return (
      <div className="min-h-screen dark-paper">
        <Navbar />
        <div className="pt-24 md:pt-28 pb-16 px-4">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-12">
            <div className="lg:w-[55%] skeleton rounded-xl" style={{ aspectRatio: '3/4', maxHeight: '500px' }} />
            <div className="lg:w-[45%] space-y-4">
              <div className="skeleton h-6 w-32 rounded-full" />
              <div className="skeleton h-10 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="skeleton h-20 rounded-lg" />
                <div className="skeleton h-20 rounded-lg" />
                <div className="skeleton h-20 rounded-lg" />
                <div className="skeleton h-20 rounded-lg" />
              </div>
              <div className="skeleton h-24 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!santri) {
    return (
      <div className="min-h-screen dark-paper">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-cream/30 text-xl font-display">Santri tidak ditemukan</div>
          <Link href="/" className="btn-outline-gold text-xs py-2 px-6">Kembali</Link>
        </div>
      </div>
    );
  }

  const colorMap: Record<string, string> = { neutrino: '#C9A227', 'all-axe': '#E8C5A0' };
  const accentColor = colorMap[santri.kelas] || '#C9A227';
  const initials = santri.nama.split(' ').slice(0, 2).map(w => w[0]).join('');

  return (
    <div className="min-h-screen dark-paper protected-content" onContextMenu={e => e.preventDefault()}>
      <Navbar />

      {/* BACK BUTTON */}
      <div className="fixed top-20 left-3 sm:left-4 md:left-8 z-40">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-charcoal-dark/80 border border-gold/20 backdrop-blur-md text-cream/70 hover:text-gold hover:border-gold/50 transition-all text-[10px] sm:text-xs font-heading tracking-wider"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="hidden sm:inline">Kembali</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="pt-24 md:pt-28 pb-16 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">

            {/* LEFT: PHOTO SLIDER */}
            <div className="lg:w-[55%] flex-shrink-0">
              <div
                className="photo-slider relative overflow-hidden rounded-xl border border-gold/20"
                style={{ aspectRatio: '3/4', maxHeight: '600px' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {allPhotos.length > 0 ? (
                  <>
                    <div
                      className="photo-slider-track h-full"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {allPhotos.map((photo, i) => (
                        <div key={photo.id} className="w-full h-full flex-shrink-0 relative">
                          {!imgLoaded && i === currentSlide && (
                            <div className="absolute inset-0 skeleton" />
                          )}
                          <img
                            src={photo.url}
                            alt={`${santri.nama} foto ${i + 1}`}
                            className="w-full h-full object-cover"
                            draggable={false}
                            onLoad={() => i === currentSlide && setImgLoaded(true)}
                            onContextMenu={e => e.preventDefault()}
                          />
                        </div>
                      ))}
                    </div>

                    {/* ARROWS */}
                    {allPhotos.length > 1 && (
                      <>
                        <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-charcoal-dark/70 border border-gold/30 flex items-center justify-center text-gold hover:bg-charcoal-dark/90 hover:border-gold/60 transition-all backdrop-blur-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-charcoal-dark/70 border border-gold/30 flex items-center justify-center text-gold hover:bg-charcoal-dark/90 hover:border-gold/60 transition-all backdrop-blur-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </>
                    )}

                    {/* DOTS */}
                    {allPhotos.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {allPhotos.map((_, i) => (
                          <button key={i} onClick={() => setCurrentSlide(i)} className={`photo-slider-dot ${i === currentSlide ? 'active' : ''}`} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: `radial-gradient(circle, ${accentColor}15 0%, #0c0a09 100%)` }}>
                    <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-display font-black border-2 mb-4" style={{ borderColor: accentColor, color: accentColor, background: `${accentColor}15` }}>
                      {initials}
                    </div>
                    <div className="text-cream/20 text-sm font-heading tracking-wider uppercase">Foto Belum Tersedia</div>
                  </div>
                )}
              </div>

              {/* PHOTO COUNT */}
              {allPhotos.length > 1 && (
                <div className="text-center mt-3 text-cream/30 text-xs font-body">
                  {currentSlide + 1} / {allPhotos.length} foto
                </div>
              )}
            </div>

            {/* RIGHT: INFO */}
            <div className="lg:w-[45%] flex flex-col">
              {/* KELAS BADGE */}
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border w-fit" style={{ borderColor: `${accentColor}40` }}>
                <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
                <span className="font-heading text-[10px] tracking-widest uppercase" style={{ color: accentColor }}>
                  {santri.kelas === 'neutrino' ? 'Neutrino · Ikhwa' : 'All Axe · Akhwat'}
                </span>
              </div>

              {/* NAME */}
              <h1 className="font-display font-black text-cream text-3xl md:text-4xl lg:text-5xl leading-tight mb-2 text-gold-gradient">
                {santri.nama}
              </h1>

              {/* JABATAN */}
              {santri.jabatan && santri.jabatan !== 'anggota' && (
                <div className="text-sm font-heading tracking-wider mb-4" style={{ color: accentColor }}>
                  {santri.jabatan === 'ketua' ? '👑 Ketua Kelas' : santri.jabatan === 'sekretaris' ? '📝 Sekretaris' : '💰 Bendahara'}
                </div>
              )}

              {/* QUOTE */}
              {santri.quote && (
                <div className="mb-6 pl-4 border-l-2" style={{ borderColor: `${accentColor}60` }}>
                  <p className="font-script text-lg text-cream/70 italic leading-relaxed">
                    &ldquo;{santri.quote}&rdquo;
                  </p>
                </div>
              )}

              {/* INFO CARDS */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="card-dark p-4">
                  <div className="text-cream/30 text-[10px] font-heading tracking-wider uppercase mb-1">Tempat Lahir</div>
                  <div className="text-cream text-sm font-display font-bold">📍 {santri.tempat_lahir}</div>
                </div>
                <div className="card-dark p-4">
                  <div className="text-cream/30 text-[10px] font-heading tracking-wider uppercase mb-1">Tanggal Lahir</div>
                  <div className="text-cream text-sm font-display font-bold">🎂 {formattedBirth}</div>
                </div>
                <div className="card-dark p-4">
                  <div className="text-cream/30 text-[10px] font-heading tracking-wider uppercase mb-1">Kelas</div>
                  <div className="text-cream text-sm font-display font-bold">🏫 {santri.kelas === 'neutrino' ? 'Neutrino 9A' : 'All Axe 9B'}</div>
                </div>
              </div>

              {/* DESKRIPSI */}
              {santri.deskripsi && (
                <div className="mb-6">
                  <h3 className="section-label text-[10px] mb-3">Tentang</h3>
                  <p className="text-cream/60 text-sm font-body leading-relaxed">{santri.deskripsi}</p>
                </div>
              )}

              {/* SOCIAL LINKS */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-auto">
                {santri.instagram && (
                  <a
                    href={`https://instagram.com/${santri.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-500/20 border border-purple-400/30 text-cream/80 hover:text-white hover:border-purple-400/60 transition-all text-xs sm:text-sm"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    @{santri.instagram}
                  </a>
                )}
                {santri.wa && (
                  <a
                    href={`https://wa.me/${santri.wa.startsWith('08') ? '62' + santri.wa.slice(1) : santri.wa.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-green-600/20 border border-green-400/30 text-cream/80 hover:text-white hover:border-green-400/60 transition-all text-xs sm:text-sm"
                  >
                    💬 WhatsApp
                  </a>
                )}
                {/* CUSTOM LINKS */}
                {(() => {
                  let links: CustomLink[] = [];
                  try {
                    if (Array.isArray(santri.custom_links)) links = santri.custom_links;
                    else if (typeof santri.custom_links === 'string') links = JSON.parse(santri.custom_links);
                  } catch {}
                  return links.map((link, i) => {
                    const preset = LINK_GRADIENT_PRESETS[link.color || 'gold'] || LINK_GRADIENT_PRESETS.gold;
                    const normalizeUrl = (url: string) => {
                      if (!url) return '';
                      if (/^https?:\/\//.test(url)) return url;
                      if (/^[a-zA-Z0-9]/.test(url) && url.includes('.')) return `https://${url}`;
                      return url;
                    };
                    const normalizePhone = (p: string) => {
                      const c = p.replace(/[\s\-()]/g, '');
                      if (c.startsWith('08')) return '62' + c.slice(1);
                      if (c.startsWith('+62')) return c.slice(1);
                      return c;
                    };
                    const href = link.type === 'phone' ? `https://wa.me/${normalizePhone(link.url)}` : normalizeUrl(link.url);
                    return (
                      <a
                        key={i}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border transition-all hover:scale-105 text-xs sm:text-sm"
                        style={{
                          background: link.color?.startsWith('custom:') ? link.color.replace('custom:', '') : preset.bg,
                          borderColor: link.color?.startsWith('custom:') ? 'rgba(255,255,255,0.2)' : preset.border,
                          color: link.color?.startsWith('custom:') ? '#fff' : preset.text,
                        }}
                      >
                        {link.type === 'phone' ? '📱' : '🔗'} {link.label}
                      </a>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
