// src/components/sections/KelasHeader.tsx
import { KelasInfo } from '@/data/students';

export default function KelasHeader({ info }: { info: KelasInfo }) {
  return (
    <div className="relative pt-24 pb-16 px-4 overflow-hidden border-b border-gold/10">
      {/* BG */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url('/images/${info.id}-group.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark/80 to-charcoal-dark" />

      <div className="relative max-w-7xl mx-auto">
        {/* TOP LABEL */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-gold/60" />
          <span className="section-label">{info.label}</span>
        </div>

        {/* TITLE */}
        <h1 className="display-title text-gold-gradient mb-4" style={{ fontSize: 'clamp(3rem,10vw,7rem)' }}>
          {info.nama.toUpperCase()}
        </h1>

        <p className="text-cream/60 font-body text-sm max-w-2xl mb-8 leading-loose">
          {info.deskripsi}
        </p>

        {/* META ROW */}
        <div className="flex flex-wrap gap-6">
          {[
            { label: 'Wali Kelas', value: info.waliKelas },
            { label: 'Ketua',      value: info.ketua },
            ...(info.sekretaris ? [{ label: 'Sekretaris', value: info.sekretaris }] : []),
            ...(info.bendahara   ? [{ label: 'Bendahara',  value: info.bendahara  }] : []),
            { label: 'Tahun', value: info.tahun },
          ].map(item => (
            <div key={item.label} className="card-dark px-4 py-3 min-w-[140px]">
              <div className="section-label text-[9px] mb-1">{item.label}</div>
              <div className="text-cream text-sm font-display font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
