// src/pages/guru/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { GuruDB } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';

export default function GuruDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [guru, setGuru] = useState<GuruDB | null>(null);
  const [photos, setPhotos] = useState<{id:string;url:string}[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: g } = await supabase.from('guru').select('*').eq('id', id).single();
      if (g) setGuru(g as GuruDB);
      const { data: p } = await supabase.from('guru_photos').select('*').eq('guru_id', id).order('order_num');
      if (p) setPhotos(p as typeof photos);
      setLoading(false);
    })();
  }, [id]);

  const allPhotos = [
    ...(guru?.foto ? [{ id: 'main', url: guru.foto }] : []),
    ...photos,
  ];

  const nextSlide = () => setCurrentSlide(p => (p + 1) % Math.max(allPhotos.length, 1));
  const prevSlide = () => setCurrentSlide(p => (p - 1 + Math.max(allPhotos.length, 1)) % Math.max(allPhotos.length, 1));
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
  };

  if (loading) return (
    <div className="min-h-screen dark-paper"><Navbar /><div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" /></div></div>
  );

  if (!guru) return (
    <div className="min-h-screen dark-paper"><Navbar /><div className="flex flex-col items-center justify-center min-h-screen gap-4"><div className="text-cream/30 text-xl font-display">Guru tidak ditemukan</div><Link href="/" className="btn-outline-gold text-xs py-2 px-6">Kembali</Link></div></div>
  );

  const accentColor = '#C9A227';
  const initials = guru.nama.split(' ').slice(0, 2).map(w => w[0]).join('');

  return (
    <div className="min-h-screen dark-paper protected-content" onContextMenu={e => e.preventDefault()}>
      <Navbar />
      <div className="fixed top-20 left-4 md:left-8 z-40">
        <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal-dark/80 border border-gold/20 backdrop-blur-md text-cream/70 hover:text-gold hover:border-gold/50 transition-all text-xs font-heading tracking-wider">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Kembali
        </button>
      </div>

      <div className="pt-24 md:pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="lg:w-[55%] flex-shrink-0">
              <div className="photo-slider relative overflow-hidden rounded-xl border border-gold/20" style={{ aspectRatio: '3/4', maxHeight: '600px' }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {allPhotos.length > 0 ? (
                  <>
                    <div className="photo-slider-track h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                      {allPhotos.map((photo, i) => (
                        <div key={photo.id} className="w-full h-full flex-shrink-0"><img src={photo.url} alt={`${guru.nama} foto ${i+1}`} className="w-full h-full object-cover" draggable={false} onContextMenu={e => e.preventDefault()} /></div>
                      ))}
                    </div>
                    {allPhotos.length > 1 && (
                      <>
                        <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-charcoal-dark/70 border border-gold/30 flex items-center justify-center text-gold hover:bg-charcoal-dark/90 transition-all backdrop-blur-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                        <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-charcoal-dark/70 border border-gold/30 flex items-center justify-center text-gold hover:bg-charcoal-dark/90 transition-all backdrop-blur-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                          {allPhotos.map((_, i) => (<button key={i} onClick={() => setCurrentSlide(i)} className={`photo-slider-dot ${i === currentSlide ? 'active' : ''}`} />))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: `radial-gradient(circle, ${accentColor}15 0%, #0c0a09 100%)` }}>
                    <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-display font-black border-2 mb-4" style={{ borderColor: accentColor, color: accentColor, background: `${accentColor}15` }}>{initials}</div>
                    <div className="text-cream/20 text-sm font-heading tracking-wider uppercase">Foto Belum Tersedia</div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-[45%] flex flex-col">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border w-fit" style={{ borderColor: `${accentColor}40` }}>
                <span className="text-sm">🎓</span>
                <span className="font-heading text-[10px] tracking-widest uppercase" style={{ color: accentColor }}>{guru.jabatan_guru} · Neutrino</span>
              </div>
              <h1 className="font-display font-black text-cream text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 text-gold-gradient">{guru.nama}</h1>
              {guru.deskripsi && (
                <div className="mb-6">
                  <h3 className="section-label text-[10px] mb-3">Tentang</h3>
                  <p className="text-cream/60 text-sm font-body leading-relaxed">{guru.deskripsi}</p>
                </div>
              )}
              {(guru.instagram || guru.wa) && (
                <div className="flex flex-wrap gap-3 mt-auto">
                  {guru.instagram && (
                    <a href={`https://instagram.com/${guru.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-500/20 border border-purple-400/30 text-cream/80 hover:text-white transition-all text-sm">
                      📷 @{guru.instagram}
                    </a>
                  )}
                  {guru.wa && (
                    <a href={`https://wa.me/${guru.wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600/20 border border-green-400/30 text-cream/80 hover:text-white transition-all text-sm">
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
