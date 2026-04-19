// src/pages/gallery/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase';
import type { GalleryItem } from '@/lib/supabase';

export default function GalleryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('gallery').select('*').eq('id', id).single();
      if (data) setItem(data as GalleryItem);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen dark-paper">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    </div>
  );

  if (!item) return (
    <div className="min-h-screen dark-paper">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-cream/30 text-xl font-display">Foto tidak ditemukan</div>
        <Link href="/gallery" className="btn-outline-gold text-xs py-2 px-6">Kembali ke Gallery</Link>
      </div>
    </div>
  );

  const CATEGORY_LABELS: Record<string, string> = {
    momen: '📸 Momen',
    rihlah: '🌙 Rihlah',
    wisuda: '🎓 Wisuda',
    keseharian: '☀️ Keseharian',
    neutrino: '⚡ Neutrino',
    'all-axe': '🪓 All Axe',
  };

  return (
    <div className="min-h-screen dark-paper protected-content" onContextMenu={e => e.preventDefault()}>
      <Navbar />

      {/* BACK BUTTON */}
      <div className="fixed top-20 left-4 md:left-8 z-40">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal-dark/80 border border-gold/20 backdrop-blur-md text-cream/70 hover:text-gold hover:border-gold/50 transition-all text-xs font-heading tracking-wider"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
      </div>

      <div className="pt-24 md:pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* IMAGE */}
            <div className="lg:w-[60%] flex-shrink-0">
              <div className="relative rounded-xl overflow-hidden border border-gold/20">
                {!imgLoaded && <div className="skeleton w-full" style={{ height: '500px' }} />}
                <img
                  src={item.url}
                  alt={item.caption || 'Gallery'}
                  className={`w-full object-contain max-h-[80vh] transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  draggable={false}
                  onLoad={() => setImgLoaded(true)}
                  onContextMenu={e => e.preventDefault()}
                />
              </div>
            </div>

            {/* ARTICLE TEXT */}
            <div className="lg:w-[40%] flex flex-col">
              {/* Category badge */}
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-gold/20 w-fit">
                <span className="font-heading text-[10px] tracking-widest uppercase text-gold">
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>
              </div>

              {/* Caption as title */}
              <h1 className="font-display font-black text-cream text-2xl md:text-3xl leading-tight mb-4">
                {item.caption || 'Momen Kenangan'}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mb-6 text-cream/40 text-xs font-body">
                <span>📅 {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {item.submitted_name && <span>👤 {item.submitted_name}</span>}
              </div>

              <div className="h-px bg-gradient-to-r from-gold/30 to-transparent mb-6" />

              {/* Article text */}
              {item.article_text ? (
                <div className="text-cream/70 text-sm font-body leading-relaxed whitespace-pre-wrap">
                  {item.article_text}
                </div>
              ) : (
                <div className="text-cream/30 text-sm font-body italic">
                  Belum ada cerita untuk foto ini.
                </div>
              )}

              {/* Back to gallery */}
              <div className="mt-auto pt-8">
                <Link href="/gallery" className="btn-outline-gold text-xs py-2 px-6 inline-block">
                  ← Kembali ke Gallery
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
