// src/pages/timeline.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';

type TimelineEvent = {
  id: string;
  date: string;
  judul: string;
  deskripsi: string;
  kelas: 'neutrino' | 'all-axe' | 'both';
  type: 'hafalan' | 'lomba' | 'event' | 'asrama' | 'wisuda';
  emoji: string;
};

const TIMELINE_DATA: TimelineEvent[] = [
  // KELAS 7 (2023)
  { id: 't1',  date: 'Juli 2023',     judul: 'Penerimaan Santri Baru',             deskripsi: 'Hari pertama menginjakkan kaki di pesantren. Perkenalan dan adaptasi lingkungan asrama dimulai.',                  kelas: 'both',     type: 'event',   emoji: '🏫' },
  { id: 't2',  date: 'Agustus 2023',  judul: 'MOS & Orientasi Pesantren',          deskripsi: 'Masa orientasi santri baru. Pengenalan peraturan, kegiatan, dan budaya pesantren Wahdah Islamiyah.',            kelas: 'both',     type: 'event',   emoji: '📋' },
  { id: 't3',  date: 'Oktober 2023',  judul: 'Hafalan Perdana — Juz 30',           deskripsi: 'Santri mulai setoran hafalan Quran. Program tahfidz menjadi pilar utama pembelajaran.',                          kelas: 'both',     type: 'hafalan', emoji: '📖' },
  { id: 't4',  date: 'Desember 2023', judul: 'Lomba Antar Asrama',                 deskripsi: 'Kompetisi pertama antar kelas. Semangat dan solidaritas angkatan mulai terbentuk.',                              kelas: 'both',     type: 'lomba',   emoji: '🏆' },
  { id: 't5',  date: 'Januari 2024',  judul: 'Rihlah Perdana',                     deskripsi: 'Perjalanan wisata edukatif pertama bersama angkatan. Momen tak terlupakan mempererat ikatan kelas.',            kelas: 'both',     type: 'asrama',  emoji: '🌴' },
  // KELAS 8 (2024)
  { id: 't6',  date: 'Juli 2024',     judul: 'Naik Kelas 8 — Awal Babak Baru',    deskripsi: 'Memasuki tahun kedua dengan semangat baru. Target hafalan ditingkatkan ke Juz 29.',                            kelas: 'both',     type: 'event',   emoji: '⬆️' },
  { id: 't7',  date: 'September 2024',judul: 'Lomba Tahfidz Tingkat Wilayah',      deskripsi: 'Neutrino mengirim 3 santri ke lomba tahfidz. Prestasi membanggakan untuk angkatan.',                            kelas: 'neutrino', type: 'lomba',   emoji: '🥇' },
  { id: 't8',  date: 'Oktober 2024',  judul: 'Musabaqah Quran All Axe',            deskripsi: 'All Axe meraih juara dalam musabaqah tilawatil Quran tingkat pesantren. Bangga!',                              kelas: 'all-axe',  type: 'lomba',   emoji: '🎖️' },
  { id: 't9',  date: 'November 2024', judul: 'Rihlah Ke-2 — Wisata Alam',         deskripsi: 'Rihlah kedua ke destinasi alam. Foto bersama, permainan seru, dan kenangan manis.',                             kelas: 'both',     type: 'asrama',  emoji: '⛰️' },
  { id: 't10', date: 'Desember 2024', judul: 'Malam Keakraban Angkatan',          deskripsi: 'Event internal angkatan 26. Games, pertunjukan bakat, dan momen emosional kebersamaan.',                        kelas: 'both',     type: 'event',   emoji: '🌟' },
  // KELAS 9 (2025-2026)
  { id: 't11', date: 'Juli 2025',     judul: 'Kelas 9 — Tahun Terakhir',          deskripsi: 'Memasuki tahun final dengan perasaan campur aduk. Semangat lulus tapi berat meninggalkan kenangan.',           kelas: 'both',     type: 'event',   emoji: '⏳' },
  { id: 't12', date: 'Agustus 2025',  judul: 'Try Out Pertama',                   deskripsi: 'Persiapan ujian akhir dimulai. Belajar lebih keras demi kelulusan dan masa depan.',                            kelas: 'both',     type: 'event',   emoji: '📝' },
  { id: 't13', date: 'Oktober 2025',  judul: 'Completions Hafalan Quran',         deskripsi: 'Santri yang berhasil menyelesaikan target hafalan mendapat penghargaan khusus dari pesantren.',                 kelas: 'both',     type: 'hafalan', emoji: '✨' },
  { id: 't14', date: 'Februari 2026', judul: 'Persiapan Wisuda — Foto Kenangan',  deskripsi: 'Foto bersama resmi, pembuatan yearbook, dan berbagai kegiatan perpisahan mulai dipersiapkan.',                 kelas: 'both',     type: 'wisuda',  emoji: '📷' },
  { id: 't15', date: 'Juni 2026',     judul: '🎓 WISUDA ANGKATAN 26',            deskripsi: 'Hari yang ditunggu-tunggu. Selamat kepada seluruh santri Angkatan 26 — Neutrino & All Axe. SOMO LULUS!',       kelas: 'both',     type: 'wisuda',  emoji: '🎓' },
];

const TYPE_COLORS: Record<string, string> = {
  hafalan: '#C9A227',
  lomba:   '#F0C040',
  event:   '#8B9EAE',
  asrama:  '#6BAF92',
  wisuda:  '#E8C5A0',
};

const TYPE_LABELS: Record<string, string> = {
  hafalan: 'Hafalan',
  lomba:   'Prestasi',
  event:   'Event',
  asrama:  'Asrama',
  wisuda:  'Wisuda',
};

export default function TimelinePage() {
  const [filter, setFilter] = useState<string>('all');
  const [kelasFilter, setKelasFilter] = useState<string>('all');
  const router = useRouter();

  const filtered = TIMELINE_DATA.filter(e =>
    (filter === 'all' || e.type === filter) &&
    (kelasFilter === 'all' || e.kelas === kelasFilter || e.kelas === 'both')
  );

  return (
    <div className="min-h-screen dark-paper">
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

      {/* HEADER */}
      <div className="pt-28 pb-12 px-4 text-center border-b border-gold/10">
        <p className="section-label mb-3">Perjalanan 3 Tahun di MTS Wahdah Islamiyah</p>
        <h1 className="section-title text-gold-gradient mb-4">Timeline Angkatan 26</h1>
        <p className="text-cream/50 font-body text-sm max-w-lg mx-auto">
          Setiap momen yang membentuk kami — dari hari pertama hingga hari kelulusan.
        </p>
      </div>

      {/* FILTERS */}
      <div className="sticky top-16 md:top-20 z-30 bg-charcoal-dark/90 backdrop-blur-md border-b border-gold/10 py-3 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2 justify-center">
          {['all', ...Object.keys(TYPE_LABELS)].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-heading tracking-wider uppercase transition-all border ${
                filter === t ? 'border-gold bg-gold/20 text-gold' : 'border-gold/20 text-cream/40 hover:border-gold/40'
              }`}
            >
              {t === 'all' ? 'Semua' : TYPE_LABELS[t]}
            </button>
          ))}
          <div className="w-px bg-gold/20 mx-1" />
          {['all','neutrino','all-axe'].map(k => (
            <button
              key={k}
              onClick={() => setKelasFilter(k)}
              className={`px-3 py-1 rounded-full text-xs font-heading tracking-wider uppercase transition-all border ${
                kelasFilter === k ? 'border-gold-light bg-gold-light/20 text-gold-light' : 'border-gold/10 text-cream/30 hover:border-gold/30'
              }`}
            >
              {k === 'all' ? 'Bersama' : k === 'neutrino' ? 'Neutrino' : 'All Axe'}
            </button>
          ))}
        </div>
      </div>

      {/* TIMELINE */}
      <div className="max-w-4xl mx-auto px-4 py-16 relative">
        {/* CENTER LINE */}
        <div className="timeline-line hidden md:block" />

        <div className="space-y-8 md:space-y-0">
          {filtered.map((event, i) => (
            <TimelineItem key={event.id} event={event} index={i} side={i % 2 === 0 ? 'left' : 'right'} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-cream/30 font-display text-xl">
            Belum ada event untuk filter ini
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineItem({ event, index, side }: { event: TimelineEvent; index: number; side: 'left' | 'right' }) {
  const color = TYPE_COLORS[event.type];

  return (
    <div className={`md:flex items-center gap-8 mb-12 ${side === 'right' ? 'md:flex-row-reverse' : ''}`}>
      {/* CARD */}
      <div className="flex-1 md:max-w-[calc(50%-2rem)]">
        <div
          className="card-dark p-5 corner-ornament transition-all hover:scale-[1.02]"
          style={{ borderColor: `${color}40` }}
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">{event.emoji}</span>
            <div className="flex-1">
              <div className="text-[10px] font-heading tracking-wider mb-1" style={{ color }}>
                {event.date} · {event.kelas === 'both' ? 'Bersama' : event.kelas === 'neutrino' ? 'Neutrino' : 'All Axe'}
              </div>
              <h3 className="font-display font-bold text-cream text-sm leading-tight">{event.judul}</h3>
            </div>
          </div>
          <p className="text-cream/50 text-xs font-body leading-relaxed">{event.deskripsi}</p>
          <div
            className="inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-full text-[10px] font-heading tracking-wider"
            style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}
          >
            {TYPE_LABELS[event.type]}
          </div>
        </div>
      </div>

      {/* DOT (Desktop) */}
      <div className="hidden md:flex items-center justify-center w-8 flex-shrink-0">
        <div
          className="timeline-dot animate-pulse-gold"
          style={{ background: color, boxShadow: `0 0 10px ${color}80` }}
        />
      </div>

      {/* SPACER */}
      <div className="flex-1 hidden md:block" />
    </div>
  );
}
