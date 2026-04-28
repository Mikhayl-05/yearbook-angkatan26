// src/pages/drive.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { DriveFolder } from '@/lib/supabase';
import { useInView } from 'react-intersection-observer';
import Head from 'next/head';

// ── DRIVE COLOR PRESETS ─────────────────────────────────────────────────────
export const DRIVE_COLOR_PRESETS: Record<string, {
  label: string;
  bg: string;
  border: string;
  icon: string;
  glow: string;
  text: string;
}> = {
  gold: {
    label: 'Gold Classic',
    bg: 'linear-gradient(135deg, #1a1306 0%, #2d2008 60%, #1a1306 100%)',
    border: '#C9A227',
    icon: '#C9A227',
    glow: 'rgba(201,162,39,0.35)',
    text: '#F0C040',
  },
  gold_shimmer: {
    label: 'Gold Shimmer',
    bg: 'linear-gradient(135deg, #211a07 0%, #3d2f0b 50%, #211a07 100%)',
    border: '#E8B420',
    icon: '#FFD700',
    glow: 'rgba(232,180,32,0.4)',
    text: '#FFD700',
  },
  ocean: {
    label: 'Ocean Blue',
    bg: 'linear-gradient(135deg, #061420 0%, #0a2240 60%, #061420 100%)',
    border: '#1E7BB8',
    icon: '#38B2E0',
    glow: 'rgba(56,178,224,0.35)',
    text: '#5BC8F0',
  },
  sky: {
    label: 'Sky Breeze',
    bg: 'linear-gradient(135deg, #081828 0%, #0d2a40 60%, #081828 100%)',
    border: '#2D9CDB',
    icon: '#56C8FF',
    glow: 'rgba(86,200,255,0.3)',
    text: '#7DD8FF',
  },
  emerald: {
    label: 'Emerald Forest',
    bg: 'linear-gradient(135deg, #041810 0%, #082C18 60%, #041810 100%)',
    border: '#16A34A',
    icon: '#22C55E',
    glow: 'rgba(34,197,94,0.35)',
    text: '#4ADE80',
  },
  sage: {
    label: 'Sage Mint',
    bg: 'linear-gradient(135deg, #081a12 0%, #0f2e1d 60%, #081a12 100%)',
    border: '#10B981',
    icon: '#34D399',
    glow: 'rgba(52,211,153,0.3)',
    text: '#6EE7B7',
  },
  teal: {
    label: 'Teal Aqua',
    bg: 'linear-gradient(135deg, #041818 0%, #082c2c 60%, #041818 100%)',
    border: '#0D9488',
    icon: '#14B8A6',
    glow: 'rgba(20,184,166,0.35)',
    text: '#2DD4BF',
  },
  cyan: {
    label: 'Cyan Frost',
    bg: 'linear-gradient(135deg, #041820 0%, #083040 60%, #041820 100%)',
    border: '#0891B2',
    icon: '#06B6D4',
    glow: 'rgba(6,182,212,0.35)',
    text: '#22D3EE',
  },
  purple: {
    label: 'Royal Purple',
    bg: 'linear-gradient(135deg, #120820 0%, #200f38 60%, #120820 100%)',
    border: '#7C3AED',
    icon: '#A855F7',
    glow: 'rgba(168,85,247,0.35)',
    text: '#C084FC',
  },
  lavender: {
    label: 'Lavender Dream',
    bg: 'linear-gradient(135deg, #14082a 0%, #261040 60%, #14082a 100%)',
    border: '#8B5CF6',
    icon: '#A78BFA',
    glow: 'rgba(167,139,250,0.3)',
    text: '#C4B5FD',
  },
  rose: {
    label: 'Rose Gold',
    bg: 'linear-gradient(135deg, #1a0810 0%, #2e0f1c 60%, #1a0810 100%)',
    border: '#E11D48',
    icon: '#FB7185',
    glow: 'rgba(251,113,133,0.35)',
    text: '#FDA4AF',
  },
  flamingo: {
    label: 'Flamingo Pink',
    bg: 'linear-gradient(135deg, #200814 0%, #380f22 60%, #200814 100%)',
    border: '#DB2777',
    icon: '#F472B6',
    glow: 'rgba(244,114,182,0.35)',
    text: '#F9A8D4',
  },
  sunset: {
    label: 'Sunset Orange',
    bg: 'linear-gradient(135deg, #1a0a04 0%, #2d1508 60%, #1a0a04 100%)',
    border: '#EA580C',
    icon: '#FB923C',
    glow: 'rgba(251,146,60,0.35)',
    text: '#FDBA74',
  },
  amber: {
    label: 'Amber Glow',
    bg: 'linear-gradient(135deg, #1a1004 0%, #2d1e08 60%, #1a1004 100%)',
    border: '#D97706',
    icon: '#F59E0B',
    glow: 'rgba(245,158,11,0.35)',
    text: '#FCD34D',
  },
  crimson: {
    label: 'Crimson Red',
    bg: 'linear-gradient(135deg, #1a0404 0%, #2d0808 60%, #1a0404 100%)',
    border: '#DC2626',
    icon: '#EF4444',
    glow: 'rgba(239,68,68,0.35)',
    text: '#FCA5A5',
  },
  cherry: {
    label: 'Cherry Blossom',
    bg: 'linear-gradient(135deg, #1a060f 0%, #2e0e1a 60%, #1a060f 100%)',
    border: '#BE185D',
    icon: '#EC4899',
    glow: 'rgba(236,72,153,0.3)',
    text: '#F9A8D4',
  },
  midnight: {
    label: 'Midnight Dark',
    bg: 'linear-gradient(135deg, #08080f 0%, #10101e 60%, #08080f 100%)',
    border: '#4338CA',
    icon: '#6366F1',
    glow: 'rgba(99,102,241,0.35)',
    text: '#818CF8',
  },
  steel: {
    label: 'Steel Gray',
    bg: 'linear-gradient(135deg, #0a0a10 0%, #161620 60%, #0a0a10 100%)',
    border: '#475569',
    icon: '#94A3B8',
    glow: 'rgba(148,163,184,0.25)',
    text: '#CBD5E1',
  },
  indigo: {
    label: 'Indigo Night',
    bg: 'linear-gradient(135deg, #090c1a 0%, #121840 60%, #090c1a 100%)',
    border: '#4F46E5',
    icon: '#6366F1',
    glow: 'rgba(99,102,241,0.35)',
    text: '#A5B4FC',
  },
  coral: {
    label: 'Coral Reef',
    bg: 'linear-gradient(135deg, #1a0c08 0%, #2e1810 60%, #1a0c08 100%)',
    border: '#F97316',
    icon: '#FB923C',
    glow: 'rgba(249,115,22,0.35)',
    text: '#FDBA74',
  },
  lime: {
    label: 'Lime Burst',
    bg: 'linear-gradient(135deg, #0c1a04 0%, #182e08 60%, #0c1a04 100%)',
    border: '#65A30D',
    icon: '#84CC16',
    glow: 'rgba(132,204,22,0.3)',
    text: '#BEF264',
  },
  copper: {
    label: 'Copper Bronze',
    bg: 'linear-gradient(135deg, #180c04 0%, #2c1a08 60%, #180c04 100%)',
    border: '#B45309',
    icon: '#D97706',
    glow: 'rgba(217,119,6,0.35)',
    text: '#FCD34D',
  },
  jade: {
    label: 'Jade Temple',
    bg: 'linear-gradient(135deg, #041410 0%, #082318 60%, #041410 100%)',
    border: '#059669',
    icon: '#10B981',
    glow: 'rgba(16,185,129,0.35)',
    text: '#6EE7B7',
  },
  neon_blue: {
    label: 'Neon Blue',
    bg: 'linear-gradient(135deg, #020c1a 0%, #051428 60%, #020c1a 100%)',
    border: '#0284C7',
    icon: '#38BDF8',
    glow: 'rgba(56,189,248,0.45)',
    text: '#7DD3FC',
  },
  neon_green: {
    label: 'Neon Lime',
    bg: 'linear-gradient(135deg, #04140a 0%, #081e10 60%, #04140a 100%)',
    border: '#16A34A',
    icon: '#4ADE80',
    glow: 'rgba(74,222,128,0.45)',
    text: '#86EFAC',
  },
  neon_pink: {
    label: 'Neon Magenta',
    bg: 'linear-gradient(135deg, #160814 0%, #240e20 60%, #160814 100%)',
    border: '#C026D3',
    icon: '#E879F9',
    glow: 'rgba(232,121,249,0.45)',
    text: '#F0ABFC',
  },
  chocolate: {
    label: 'Dark Chocolate',
    bg: 'linear-gradient(135deg, #120804 0%, #200f08 60%, #120804 100%)',
    border: '#92400E',
    icon: '#B45309',
    glow: 'rgba(180,83,9,0.3)',
    text: '#D97706',
  },
  white_pearl: {
    label: 'White Pearl',
    bg: 'linear-gradient(135deg, #141418 0%, #20202a 60%, #141418 100%)',
    border: '#CBD5E1',
    icon: '#F1F5F9',
    glow: 'rgba(241,245,249,0.2)',
    text: '#FFFFFF',
  },
  deep_sea: {
    label: 'Deep Sea',
    bg: 'linear-gradient(135deg, #020c18 0%, #041520 60%, #020c18 100%)',
    border: '#155E75',
    icon: '#0E7490',
    glow: 'rgba(14,116,144,0.4)',
    text: '#22D3EE',
  },
  galaxy: {
    label: 'Galaxy',
    bg: 'linear-gradient(135deg, #08041a 0%, #100838 60%, #08041a 100%)',
    border: '#5B21B6',
    icon: '#8B5CF6',
    glow: 'rgba(139,92,246,0.4)',
    text: '#C4B5FD',
  },
};

function getPreset(color: string) {
  return DRIVE_COLOR_PRESETS[color] || DRIVE_COLOR_PRESETS['gold'];
}

export default function DrivePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const { ref: gridRef, inView: gridInView } = useInView({ triggerOnce: true, threshold: 0.05 });

  // Auth guard — only redirect AFTER auth finishes loading
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/drive');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchFolders();
  }, [user]);

  const fetchFolders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('drive_folders')
      .select('*')
      .order('order_num', { ascending: true });
    if (data) setFolders(data as DriveFolder[]);
    setLoading(false);
  };

  // Show spinner while auth is resolving
  if (authLoading) {
    return (
      <div className="min-h-screen dark-paper flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  // After auth loads: if no user, redirect is in-flight — show nothing
  if (!user) return null;

  return (
    <>
      <Head>
        <title>Drive — Yearbook Angkatan 26</title>
        <meta name="description" content="Folder Google Drive kenangan Angkatan 26 Neutrino" />
      </Head>

      <div className="min-h-screen dark-paper protected-content" onContextMenu={e => e.preventDefault()}>
        <Navbar />

        {/* BACK BUTTON */}
        <div className="fixed top-20 left-3 sm:left-4 md:left-8 z-40">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-charcoal-dark/80 border border-gold/20 backdrop-blur-md text-cream/70 hover:text-gold hover:border-gold/50 transition-all text-[10px] sm:text-xs font-heading tracking-wider"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Kembali</span>
          </button>
        </div>

        {/* HERO */}
        <div className="pt-28 pb-12 px-4 text-center border-b border-gold/10 relative overflow-hidden">
          {/* subtle bg glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.08) 0%, transparent 70%)' }} />
          <p className="section-label mb-3">MTS Wahdah Islamiyah · Angkatan 26</p>
          <h1 className="section-title text-gold-gradient mb-4 flex items-center justify-center gap-3">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gold inline-block" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
            Drive Kenangan
          </h1>
          <p className="text-cream/50 font-body text-sm max-w-lg mx-auto">
            Kumpulan folder Google Drive berisi dokumentasi perjalanan tiga tahun bersama di MTS Pondok Pesantren Wahdah Islamiyah.
          </p>
        </div>

        {/* FOLDER GRID */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl" style={{ height: '180px' }} />
              ))}
            </div>
          ) : folders.length > 0 ? (
            <div
              ref={gridRef}
              className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 scroll-reveal-stagger ${gridInView ? 'revealed' : ''}`}
            >
              {folders.map((folder, idx) => (
                <DriveFolderCard key={folder.id} folder={folder} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-cream/30">
              <div className="text-5xl mb-4">📁</div>
              <div className="font-display text-xl mb-2">Belum ada folder</div>
              <p className="text-sm font-body">Hubungi admin untuk menambahkan folder Drive.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── FOLDER CARD COMPONENT ────────────────────────────────────────────────────
function DriveFolderCard({ folder, index }: { folder: DriveFolder; index: number }) {
  const preset = getPreset(folder.color);

  const handleClick = () => {
    window.open(folder.drive_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="group relative rounded-2xl cursor-pointer overflow-hidden select-none transition-all duration-300 hover:-translate-y-1"
      style={{
        background: preset.bg,
        border: `1px solid ${preset.border}30`,
        transitionDelay: `${index * 40}ms`,
      }}
    >
      {/* glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ boxShadow: `0 0 32px ${preset.glow}, inset 0 0 20px ${preset.glow}40` }}
      />

      {/* border glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ border: `1px solid ${preset.border}80` }}
      />

      {/* content */}
      <div className="relative z-10 p-5 sm:p-6 flex flex-col items-center text-center gap-3 min-h-[160px] justify-center">
        {/* Folder Icon */}
        <div
          className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ filter: `drop-shadow(0 4px 12px ${preset.glow})` }}
        >
          <svg
            className="w-14 h-14 sm:w-16 sm:h-16"
            viewBox="0 0 24 24"
            fill={preset.icon}
          >
            {/* folder back */}
            <path
              d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
              opacity="0.9"
            />
            {/* folder highlight tab */}
            <path
              d="M10 4l2 2h8c1.1 0 2 .9 2 2H4V6c0-1.11.89-2 2-2h4z"
              fill="white"
              opacity="0.15"
            />
          </svg>
        </div>

        {/* Title */}
        <div>
          <h3
            className="font-heading font-bold text-xs sm:text-sm tracking-wide leading-snug line-clamp-2"
            style={{ color: preset.text }}
          >
            {folder.title}
          </h3>
          {folder.description && (
            <p className="text-cream/40 text-[10px] font-body mt-1 line-clamp-2 leading-relaxed">
              {folder.description}
            </p>
          )}
        </div>

        {/* Open indicator */}
        <div
          className="flex items-center gap-1 text-[9px] font-heading tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: preset.text }}
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          BUKA
        </div>
      </div>
    </div>
  );
}
