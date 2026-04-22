// src/pages/kelas/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import StudentCard from '@/components/sections/StudentCard';
import KelasHeader from '@/components/sections/KelasHeader';
import { kelasInfo } from '@/data/students';
import { supabase } from '@/lib/supabase';
import type { SantriDB, GuruDB } from '@/lib/supabase';

export default function KelasPage() {
  const router = useRouter();
  const { id: kelasId } = router.query;
  const [search, setSearch] = useState('');
  const [santriList, setSantriList] = useState<SantriDB[]>([]);
  const [guruList, setGuruList] = useState<GuruDB[]>([]);
  const [loading, setLoading] = useState(true);

  const info = kelasId ? kelasInfo[kelasId as string] : null;

  useEffect(() => {
    if (!kelasId) return;
    fetchData();
  }, [kelasId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [santriRes, guruRes] = await Promise.all([
        supabase.from('santri').select('*').eq('kelas', kelasId).order('nama', { ascending: true }),
        supabase.from('guru').select('*').eq('kelas', kelasId),
      ]);
      if (santriRes.data) setSantriList(santriRes.data as SantriDB[]);
      if (guruRes.data) setGuruList(guruRes.data as GuruDB[]);
    } catch { /* */ }
    setLoading(false);
  };

  const filtered = santriList.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.tempat_lahir.toLowerCase().includes(search.toLowerCase())
  );

  if (!kelasId || !info) return null;

  return (
    <div className="min-h-screen dark-paper">
      <Navbar />

      {/* BACK BUTTON */}
      <div className="fixed top-20 left-3 sm:left-4 md:left-8 z-40">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-charcoal-dark/80 border border-gold/20 backdrop-blur-md text-cream/70 hover:text-gold hover:border-gold/50 transition-all text-[10px] sm:text-xs font-heading tracking-wider"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="hidden sm:inline">Beranda</span>
        </button>
      </div>

      {/* HEADER */}
      <KelasHeader info={info} />

      {/* SEARCH BAR */}
      <div className="sticky top-16 md:top-20 z-30 bg-charcoal-dark/90 backdrop-blur-md border-b border-gold/10 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Cari nama atau asal kota..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full admin-input pl-4"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-gold"
              >
                ×
              </button>
            )}
          </div>
          <div className="text-cream/40 text-xs font-heading">
            {filtered.length} / {santriList.length} santri
          </div>
        </div>
      </div>

      {/* GURU SECTION */}
      {guruList.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pt-10">
          <div className="divider-ornament justify-center mb-6">
            <span className="section-label text-[10px]">🎓 Wali Kelas</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-4">
            {guruList.map((guru, i) => (
              <StudentCard
                key={guru.id}
                santri={{
                  id: guru.id,
                  no: 0,
                  nama: guru.nama,
                  tempat_lahir: '',
                  tanggal_lahir: '',
                  kelas: guru.kelas,
                  foto: guru.foto,
                  instagram: guru.instagram,
                  wa: guru.wa,
                  type: 'guru',
                  jabatan_guru: guru.jabatan_guru,
                } as any}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* STUDENT GRID */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {guruList.length > 0 && (
          <div className="divider-ornament justify-center mb-6">
            <span className="section-label text-[10px]">📚 Santri</span>
          </div>
        )}

        {loading ? (
          // Skeleton loading
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img" />
                <div className="skeleton-text mt-4" />
                <div className="skeleton-text short mb-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filtered.map((santri, i) => (
              <StudentCard
                key={santri.id}
                santri={{
                  id: santri.id,
                  no: santri.no,
                  nama: santri.nama,
                  tempat_lahir: santri.tempat_lahir,
                  tanggal_lahir: santri.tanggal_lahir,
                  kelas: santri.kelas,
                  jabatan: santri.jabatan,
                  foto: santri.foto,
                  instagram: santri.instagram,
                  wa: santri.wa,
                  quote: santri.quote,
                }}
                index={i}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-cream/30 font-display text-2xl">
            Tidak ditemukan...
          </div>
        )}
      </div>
    </div>
  );
}
