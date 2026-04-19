// src/components/sections/StudentCard.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

type CustomLink = {
  label: string;
  url: string;
  type: 'link' | 'phone';
  color?: string; // gradient preset key or custom
};

type SantriCardData = {
  id: string;
  no: number;
  nama: string;
  tempat_lahir?: string;
  tempatLahir?: string;
  tanggal_lahir?: string;
  tanggalLahir?: string;
  kelas: string;
  jabatan?: string;
  foto?: string;
  instagram?: string;
  wa?: string;
  quote?: string;
  link?: string;
  custom_links?: CustomLink[];
  type?: 'santri' | 'guru';
  jabatan_guru?: string;
};

const JABATAN_LABELS: Record<string, string> = {
  ketua: '👑 Ketua Kelas',
  sekretaris: '📝 Sekretaris',
  bendahara: '💰 Bendahara',
};

// Gradient presets for custom link buttons
export const LINK_GRADIENT_PRESETS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  gold: { bg: 'linear-gradient(135deg, rgba(201,162,39,0.15), rgba(240,192,64,0.25))', border: 'rgba(201,162,39,0.5)', text: '#F0C040', label: '✨ Emas' },
  purple: { bg: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(192,132,252,0.25))', border: 'rgba(139,92,246,0.5)', text: '#c084fc', label: '💜 Ungu' },
  blue: { bg: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(96,165,250,0.25))', border: 'rgba(59,130,246,0.5)', text: '#60a5fa', label: '💙 Biru' },
  green: { bg: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(74,222,128,0.25))', border: 'rgba(34,197,94,0.5)', text: '#4ade80', label: '💚 Hijau' },
  pink: { bg: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(244,114,182,0.25))', border: 'rgba(236,72,153,0.5)', text: '#f472b6', label: '💗 Pink' },
  orange: { bg: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,146,60,0.25))', border: 'rgba(249,115,22,0.5)', text: '#fb923c', label: '🧡 Oranye' },
  red: { bg: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(248,113,113,0.25))', border: 'rgba(239,68,68,0.5)', text: '#f87171', label: '❤️ Merah' },
  cyan: { bg: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(34,211,238,0.25))', border: 'rgba(6,182,212,0.5)', text: '#22d3ee', label: '🩵 Cyan' },
};

const normalizeUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(https?:\/\/)/.test(trimmed)) return trimmed;
  if (/^(wa\.me|t\.me|instagram\.com)/.test(trimmed)) return `https://${trimmed}`;
  if (/^[a-zA-Z0-9]/.test(trimmed) && trimmed.includes('.')) return `https://${trimmed}`;
  return trimmed;
};

const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('08')) return '62' + cleaned.slice(1);
  if (cleaned.startsWith('+62')) return cleaned.slice(1);
  if (cleaned.startsWith('62')) return cleaned;
  return cleaned;
};

const getPlaceholderAvatar = (nama: string, kelas: string) => {
  const initials = nama.split(' ').slice(0, 2).map(w => w[0]).join('');
  const colorMap: Record<string, string> = {
    neutrino: '#C9A227',
    'all-axe': '#E8C5A0',
  };
  const color = colorMap[kelas] || '#C9A227';
  return { initials, color };
};

type Props = {
  santri: SantriCardData;
  index: number;
};

export default function StudentCard({ santri, index }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { initials, color } = getPlaceholderAvatar(santri.nama, santri.kelas);
  const isGuru = santri.type === 'guru';
  const tempatLahir = santri.tempat_lahir || santri.tempatLahir || '';
  const tanggalLahir = santri.tanggal_lahir || santri.tanggalLahir || '';
  const linkHref = isGuru ? `/guru/${santri.id}` : `/santri/${santri.id}`;

  // Parse custom_links
  const customLinks: CustomLink[] = (() => {
    try {
      if (Array.isArray(santri.custom_links)) return santri.custom_links;
      if (typeof santri.custom_links === 'string') return JSON.parse(santri.custom_links);
      return [];
    } catch { return []; }
  })();

  const handleLinkClick = (e: React.MouseEvent, link: CustomLink) => {
    e.preventDefault();
    e.stopPropagation();
    if (link.type === 'phone') {
      window.open(`https://wa.me/${normalizePhone(link.url)}`, '_blank');
    } else {
      window.open(normalizeUrl(link.url), '_blank');
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${Math.min(index * 80, 600)}ms` }}
    >
      <Link href={linkHref} className="block">
        <div className="card-dark group cursor-pointer h-full flex flex-col protected-content">
          {/* PHOTO SECTION */}
          <div className="student-photo-frame relative" style={{ aspectRatio: '3/4', maxHeight: '300px' }}>
            {santri.foto ? (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 skeleton" />
                )}
                <img
                  src={santri.foto}
                  alt={santri.nama}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="lazy"
                  onLoad={() => setImgLoaded(true)}
                  draggable={false}
                  onContextMenu={e => e.preventDefault()}
                />
              </>
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center"
                style={{ background: `radial-gradient(circle at center, ${color}22 0%, #0c0a0999 100%)` }}
              >
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-display font-black border-2 mb-4"
                  style={{ borderColor: color, color, background: `${color}15` }}
                >
                  {initials}
                </div>
                <div className="text-cream/20 text-[10px] sm:text-xs font-heading tracking-wider uppercase">
                  Foto Belum Tersedia
                </div>
              </div>
            )}

            {/* NO CARD */}
            {!isGuru && (
              <div
                className="absolute top-2 left-2 sm:top-3 sm:left-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-heading font-bold border z-[2]"
                style={{ borderColor: `${color}60`, color, background: 'rgba(12,10,9,0.8)' }}
              >
                {santri.no}
              </div>
            )}

            {/* GURU BADGE */}
            {isGuru && (
              <div
                className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-heading tracking-wider z-[2]"
                style={{ background: `${color}33`, color, border: `1px solid ${color}60` }}
              >
                🎓 {santri.jabatan_guru || 'Wali Kelas'}
              </div>
            )}

            {/* JABATAN BADGE */}
            {!isGuru && santri.jabatan && santri.jabatan !== 'anggota' && (
              <div
                className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-heading tracking-wider z-[2]"
                style={{ background: `${color}33`, color, border: `1px solid ${color}60` }}
              >
                {santri.jabatan === 'ketua' ? '👑' : santri.jabatan === 'sekretaris' ? '📝' : '💰'}
              </div>
            )}

            {/* VIEW PROFILE HINT */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 z-[2]">
              <span className="text-gold text-[10px] sm:text-xs font-heading tracking-wider bg-charcoal-dark/70 px-3 py-1 rounded-full backdrop-blur-sm">
                Lihat Profil →
              </span>
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="p-3 sm:p-4 flex-1 flex flex-col">
            <h3 className="font-display font-bold text-cream text-xs sm:text-sm leading-tight mb-1 line-clamp-2 group-hover:text-gold transition-colors">
              {santri.nama}
            </h3>
            {!isGuru && santri.jabatan && santri.jabatan !== 'anggota' && (
              <div className="text-[9px] sm:text-[10px] font-heading tracking-wider mb-2" style={{ color }}>
                {JABATAN_LABELS[santri.jabatan]}
              </div>
            )}
            {isGuru && (
              <div className="text-[9px] sm:text-[10px] font-heading tracking-wider mb-2" style={{ color }}>
                🎓 {santri.jabatan_guru || 'Wali Kelas'}
              </div>
            )}
            <div className="text-cream/40 text-[10px] sm:text-xs font-body mt-auto">
              {tempatLahir && (
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                  <span>📍</span>
                  <span className="truncate">{tempatLahir}</span>
                </div>
              )}
              {tanggalLahir && (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span>🎂</span>
                  <span>{new Date(tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>

            {/* SOCIAL & CUSTOM LINKS */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gold/10">
              {santri.instagram && (
                <span
                  onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(`https://instagram.com/${santri.instagram}`, '_blank'); }}
                  className="flex items-center gap-1 text-cream/40 hover:text-gold transition-colors text-[10px] sm:text-xs cursor-pointer min-h-[28px]"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="hidden sm:inline">@{santri.instagram}</span>
                  <span className="sm:hidden">IG</span>
                </span>
              )}
              {santri.wa && (
                <span
                  onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/${normalizePhone(santri.wa!)}`, '_blank'); }}
                  className="flex items-center gap-1 text-cream/40 hover:text-green-400 transition-colors text-[10px] sm:text-xs cursor-pointer min-h-[28px]"
                >
                  <span>💬</span> WA
                </span>
              )}
              {/* CUSTOM LINKS */}
              {customLinks.map((link, i) => {
                const preset = LINK_GRADIENT_PRESETS[link.color || 'gold'] || LINK_GRADIENT_PRESETS.gold;
                return (
                  <span
                    key={i}
                    role="button"
                    onClick={e => handleLinkClick(e, link)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-heading tracking-wider transition-all hover:scale-105 min-h-[28px] cursor-pointer"
                    style={{
                      background: link.color?.startsWith('custom:') ? link.color.replace('custom:', '') : preset.bg,
                      border: `1px solid ${link.color?.startsWith('custom:') ? 'rgba(255,255,255,0.2)' : preset.border}`,
                      color: link.color?.startsWith('custom:') ? '#fff' : preset.text,
                    }}
                  >
                    {link.type === 'phone' ? '📱' : '🔗'} {link.label}
                  </span>
                );
              })}
              {/* Legacy link support */}
              {santri.link && customLinks.length === 0 && (
                <span
                  role="button"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(normalizeUrl(santri.link!), '_blank'); }}
                  className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded border border-gold/30 bg-gold/5 text-gold hover:bg-gold/10 transition-colors text-[9px] font-heading tracking-wider uppercase min-h-[28px] cursor-pointer"
                >
                  🔗 Link
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
