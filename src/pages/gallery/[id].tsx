// src/pages/gallery/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase';
import type { GalleryItem } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function GalleryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('gallery').select('*').eq('id', id).single();
      if (data) setItem(data as GalleryItem);
      setLoading(false);
    })();
  }, [id]);

  // Handle ESC key to close zoom
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomed(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

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
  };

  return (
    <div className="min-h-screen dark-paper protected-content" onContextMenu={e => e.preventDefault()}>
      <Navbar />


      <div className="pt-24 md:pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* IMAGE CONTAINER */}
            <div className="lg:w-[60%] flex-shrink-0 flex justify-center items-start">
              <motion.div 
                layoutId="gallery-img-container"
                onClick={() => setIsZoomed(true)}
                className="relative rounded-xl overflow-hidden border border-gold/20 cursor-zoom-in w-full max-w-2xl h-fit shadow-2xl shadow-gold/5 group"
              >
                {!imgLoaded && <div className="skeleton w-full h-[400px]" />}
                <motion.img
                  layoutId="gallery-img"
                  src={item.url}
                  alt={item.caption || 'Gallery'}
                  className={`w-full h-auto max-h-[80vh] object-contain transition-opacity duration-500 block ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  draggable={false}
                  onLoad={() => setImgLoaded(true)}
                />
                <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-white font-heading tracking-widest border border-white/20">KLIK UNTUK ZOOM</span>
                </div>
              </motion.div>
            </div>

            {/* ARTICLE TEXT */}
            <div className="lg:w-[40%] flex flex-col">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-gold/20 w-fit">
                <span className="font-heading text-[10px] tracking-widest uppercase text-gold">
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>
              </div>

              <h1 className="font-display font-black text-cream text-2xl md:text-3xl leading-tight mb-4">
                {item.caption || 'Momen Kenangan'}
              </h1>

              <div className="flex flex-wrap gap-4 mb-6 text-cream/40 text-xs font-body">
                <span>📅 {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {item.submitted_name && <span>👤 {item.submitted_name}</span>}
              </div>

              <div className="h-px bg-gradient-to-r from-gold/30 to-transparent mb-6" />

              {item.article_text ? (
                <div className="text-cream/70 text-sm font-body leading-relaxed whitespace-pre-wrap">
                  {item.article_text}
                </div>
              ) : (
                <div className="text-cream/30 text-sm font-body italic">
                  Belum ada cerita untuk foto ini.
                </div>
              )}

              <div className="mt-auto pt-8">
                <Link href="/gallery" className="btn-outline-gold text-xs py-2 px-6 inline-block">
                  ← Kembali ke Gallery
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ZOOM OVERLAY */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1001] flex items-center justify-center p-6 sm:p-20 bg-black/95 backdrop-blur-2xl cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            {/* Zoomed Image Container */}
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <motion.div 
                layoutId="gallery-img-container"
                className="relative rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-black"
              >
                <motion.img
                  layoutId="gallery-img"
                  src={item.url}
                  alt={item.caption}
                  className="w-auto h-auto max-w-[85vw] max-h-[75vh] md:max-h-[80vh] object-contain block"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </motion.div>
              
              {/* Zoomed Caption */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-center"
              >
                <p className="text-white font-display font-bold text-base md:text-xl tracking-wide">{item.caption}</p>
                <p className="text-gold/60 text-[10px] uppercase tracking-[0.3em] font-heading mt-2">KLIK DI MANA SAJA UNTUK MENUTUP</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
