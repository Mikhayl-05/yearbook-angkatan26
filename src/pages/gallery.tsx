// src/pages/gallery.tsx
// Optimized: Infinite scroll pagination (24 per page) — menggantikan fetch semua sekaligus
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { supabase, uploadImage } from '@/lib/supabase';
import type { GalleryItem } from '@/lib/supabase';
import toast from 'react-hot-toast';

type Category = 'all' | 'momen' | 'rihlah' | 'wisuda' | 'keseharian' | 'neutrino';

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'Semua',
  momen: '📸 Momen',
  rihlah: '🌙 Rihlah',
  wisuda: '🎓 Wisuda',
  neutrino: '⚡ Neutrino',
  keseharian: '☀️ Keseharian',
};

const PAGE_SIZE = 24; // Maksimal 24 foto per page — aman di HP low-end

export default function GalleryPage() {
  const { user, isAdmin, userName } = useAuth();
  const router = useRouter();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadArticle, setUploadArticle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('momen');
  const [uploadKelas, setUploadKelas] = useState('all');
  const [uploading, setUploading] = useState(false);

  // ── Fetch page dengan pagination ─────────────────────────────────
  const fetchGallery = useCallback(async (pageNum: number, category: Category, reset = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      let query = supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (category !== 'all') {
        query = query.or(`category.eq.${category},kelas.eq.${category}`);
      }

      const { data } = await query;
      const filtered = (data ?? []).filter((g: GalleryItem) => g.url);

      if (reset || pageNum === 0) {
        setGallery(filtered);
      } else {
        setGallery(prev => [...prev, ...filtered]);
      }

      setHasMore(filtered.length === PAGE_SIZE);
    } catch {
      toast.error('Gagal memuat gallery');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Load pertama kali / saat kategori berubah
  useEffect(() => {
    setPage(0);
    setGallery([]);
    setHasMore(true);
    fetchGallery(0, activeCategory, true);
  }, [activeCategory, fetchGallery]);

  // ── IntersectionObserver untuk Infinite Scroll ───────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchGallery(nextPage, activeCategory);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, activeCategory, fetchGallery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 5;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const ALLOWED_EXTS = /\.(jpg|jpeg|png|webp|gif)$/i;

    if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTS.test(file.name)) {
      toast.error('Format tidak didukung! Gunakan JPG, PNG, WEBP, atau GIF.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran file melebihi ${MAX_SIZE_MB}MB. Kompres foto terlebih dahulu.`);
      e.target.value = '';
      return;
    }

    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = () => setUploadPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) { toast.error('Pilih foto dulu!'); return; }
    if (!uploadCaption.trim()) { toast.error('Isi caption!'); return; }
    setUploading(true);
    try {
      const ext = uploadFile.name.split('.').pop();
      const path = `gallery/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const url = await uploadImage(uploadFile, path);

      if (isAdmin) {
        await supabase.from('gallery').insert({
          url, caption: uploadCaption.trim(), article_text: uploadArticle.trim() || null,
          category: uploadCategory, kelas: uploadKelas,
          submitted_name: 'Admin', submitted_by: user?.id,
        });
        toast.success('Foto berhasil diupload! 📸');
        setPage(0);
        setGallery([]);
        fetchGallery(0, activeCategory, true);
      } else {
        await supabase.from('gallery_submissions').insert({
          url, caption: uploadCaption.trim(), article_text: uploadArticle.trim() || null,
          category: uploadCategory, kelas: uploadKelas,
          submitted_name: userName || user?.email?.split('@')[0] || 'Santri',
          submitted_by: user?.id, status: 'pending',
        });
        toast.success('Foto dikirim! Menunggu persetujuan admin 📤');
      }
      setUploadFile(null); setUploadPreview(''); setUploadCaption('');
      setUploadArticle(''); setShowUpload(false);
    } catch {
      toast.error('Gagal upload. Coba lagi!');
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus foto ini?')) return;
    await supabase.from('gallery').delete().eq('id', id);
    setGallery(prev => prev.filter(g => g.id !== id));
    toast.success('Foto dihapus');
  };

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

      {/* HERO */}
      <div className="pt-28 pb-12 px-4 text-center border-b border-gold/10">
        <p className="section-label mb-3">MTS Wahdah Islamiyah · Angkatan 26</p>
        <h1 className="section-title text-gold-gradient mb-4">Gallery Kenangan</h1>
        <p className="text-cream/50 font-body text-sm max-w-lg mx-auto">
          Kumpulan momen berharga perjalanan tiga tahun bersama di MTS Pondok Pesantren Wahdah Islamiyah Bonebolango.
        </p>
      </div>

      {/* FILTERS */}
      <div className="sticky top-16 md:top-20 z-30 bg-charcoal-dark/90 backdrop-blur-md border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-heading tracking-wider transition-all border ${
                  activeCategory === cat
                    ? 'bg-gold/20 text-gold border-gold/60'
                    : 'border-gold/10 text-cream/40 hover:border-gold/30 hover:text-cream/70'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          {user && (
            <button onClick={() => setShowUpload(!showUpload)} className="admin-btn admin-btn-primary text-xs">
              📁 Upload Foto
            </button>
          )}
        </div>
      </div>

      {/* UPLOAD MODAL */}
      {showUpload && user && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowUpload(false); }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-cream text-lg font-bold">Upload Foto Kenangan</h3>
              <button onClick={() => setShowUpload(false)} className="text-cream/40 hover:text-cream text-xl">×</button>
            </div>

            <div className="space-y-4">
              {uploadPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gold/20">
                  <img src={uploadPreview} alt="Preview" className="w-full max-h-64 object-cover" />
                  <button onClick={() => { setUploadFile(null); setUploadPreview(''); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center text-sm">×</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gold/20 rounded-xl cursor-pointer hover:border-gold/40 transition-colors">
                  <span className="text-3xl mb-2">📷</span>
                  <span className="text-cream/40 text-sm">Klik untuk pilih foto</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}

              <div>
                <label className="section-label text-[10px] block mb-2">Caption *</label>
                <input value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} placeholder="Judul/deskripsi singkat..." className="admin-input" />
              </div>

              <div>
                <label className="section-label text-[10px] block mb-2">Artikel / Cerita (opsional)</label>
                <textarea value={uploadArticle} onChange={e => setUploadArticle(e.target.value)} placeholder="Tulis cerita tentang foto ini..." rows={4} className="admin-input resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label text-[10px] block mb-2">Kategori</label>
                  <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)} className="admin-select">
                    <option value="momen">Momen</option>
                    <option value="rihlah">Rihlah</option>
                    <option value="wisuda">Wisuda</option>
                    <option value="neutrino">Neutrino</option>
                    <option value="keseharian">Keseharian</option>
                  </select>
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-2">Kelas</label>
                  <select value={uploadKelas} onChange={e => setUploadKelas(e.target.value)} className="admin-select">
                    <option value="all">Semua</option>
                    <option value="neutrino">Neutrino</option>
                  </select>
                </div>
              </div>

              {!isAdmin && (
                <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 text-cream/50 text-xs">
                  ⏳ Fotomu akan dikirim ke admin untuk disetujui sebelum muncul di gallery.
                </div>
              )}

              <button onClick={handleUpload} disabled={uploading || !uploadFile} className="w-full admin-btn admin-btn-primary py-3 justify-center disabled:opacity-50">
                {uploading ? (
                  <><div className="w-4 h-4 border-2 border-charcoal-dark border-t-transparent rounded-full animate-spin" /> Mengupload...</>
                ) : isAdmin ? '📸 Upload Langsung' : '📤 Kirim ke Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MASONRY GALLERY */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="masonry-gallery">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton rounded-lg mb-3" style={{ height: `${180 + (i % 3) * 70}px` }} />
            ))}
          </div>
        ) : gallery.length > 0 ? (
          <>
            <div className="masonry-gallery">
              {gallery.map((item) => (
                <GalleryCard key={item.id} item={item} isAdmin={isAdmin} onDelete={handleDelete} />
              ))}
            </div>

            {/* Sentinel untuk Infinite Scroll */}
            <div ref={sentinelRef} className="h-8" />

            {loadingMore && (
              <div className="flex justify-center py-6">
                <div className="flex items-center gap-3 text-cream/40 text-xs font-heading tracking-wider">
                  <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
                  Memuat lebih banyak...
                </div>
              </div>
            )}

            {!hasMore && !loadingMore && gallery.length > 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-3 text-cream/20 text-xs font-heading tracking-widest">
                  <div className="w-12 h-px bg-gold/20" />
                  Semua foto sudah ditampilkan ({gallery.length} foto)
                  <div className="w-12 h-px bg-gold/20" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-cream/30">
            <div className="text-4xl mb-4">📷</div>
            <div className="font-display text-xl mb-2">Belum ada foto</div>
            <p className="text-sm font-body">
              {user ? 'Jadilah yang pertama mengupload foto kenangan!' : 'Login untuk mengupload foto kenangan.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryCard({ item, isAdmin, onDelete }: { item: GalleryItem; isAdmin: boolean; onDelete: (id: string) => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="break-inside-avoid mb-3 group relative">
      <Link href={`/gallery/${item.id}`}>
        <div className="overflow-hidden rounded-lg border border-gold/10 hover:border-gold/40 transition-all cursor-pointer relative">
          {!imgLoaded && (
            <div className="skeleton w-full" style={{ height: '250px' }} />
          )}
          <img
            src={item.url}
            alt={item.caption || 'Gallery'}
            className={`w-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={() => setImgLoaded(true)}
            onContextMenu={e => e.preventDefault()}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <div>
              <p className="text-cream text-xs font-body font-bold">{item.caption}</p>
              {item.submitted_name && (
                <p className="text-cream/50 text-[10px]">oleh {item.submitted_name}</p>
              )}
            </div>
          </div>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-heading tracking-wider bg-charcoal-dark/70 text-gold/80 border border-gold/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {item.category}
          </div>
        </div>
      </Link>

      {isAdmin && (
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(item.id); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          ×
        </button>
      )}
    </div>
  );
}
