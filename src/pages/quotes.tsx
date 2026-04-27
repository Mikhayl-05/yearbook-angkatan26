// src/pages/quotes.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { StickyNote } from '@/lib/supabase';
import toast from 'react-hot-toast';

const NOTE_COLORS = [
  { bg: '#F9E4B7', text: '#5C3D11' },
  { bg: '#E8F4F8', text: '#1A3C4A' },
  { bg: '#F0E8F8', text: '#3D1A5C' },
  { bg: '#E8F8EE', text: '#1A3D2A' },
  { bg: '#F8E8E8', text: '#5C1A1A' },
  { bg: '#FFF3CD', text: '#664D03' },
];

export default function QuotesPage() {
  const { user, isAdmin, userName } = useAuth();
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [kelasFilter, setKelasFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchNotes();
    // Realtime subscription
    const channel = supabase.channel('sticky_notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sticky_notes' }, () => fetchNotes())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('sticky_notes').select('*').order('created_at', { ascending: false });
      if (!error && data) setNotes(data as StickyNote[]);
    } catch { /* */ }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) { toast.error('Login dulu yuk!'); return; }
    if (!content.trim()) { toast.error('Isi pesannya dong!'); return; }
    if (content.length > 280) { toast.error('Terlalu panjang! Max 280 karakter.'); return; }

    setSubmitting(true);
    try {
      const noteData = {
        user_id: user.id,
        user_name: userName || user.email?.split('@')[0] || 'Santri',
        content: content.trim(),
        color: NOTE_COLORS[selectedColor].bg,
        rotation: (Math.random() - 0.5) * 6,
        kelas: 'general' as const,
      };
      const { data, error } = await supabase.from('sticky_notes').insert(noteData).select().single();
      if (error) throw error;
      if (data) setNotes(prev => [data as StickyNote, ...prev]);
      setContent('');
      setShowForm(false);
      toast.success('Pesan berhasil ditempel! 📌');
    } catch {
      toast.error('Gagal menambah pesan. Coba lagi!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!user) return;
    const canDelete = user.id === userId || isAdmin;
    if (!canDelete) { toast.error('Bukan pesan kamu!'); return; }
    try {
      await supabase.from('sticky_notes').delete().eq('id', id);
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Pesan dihapus');
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  const filteredNotes = notes.filter(n =>
    kelasFilter === 'all' || n.kelas === kelasFilter || n.kelas === 'general'
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
        <p className="section-label mb-3">Dinding Kenangan · MTS Wahdah Islamiyah</p>
        <h1 className="section-title text-gold-gradient mb-4">📌 Pesan untuk Angkatan</h1>
        <p className="text-cream/50 font-body text-sm max-w-lg mx-auto">
          Tulis pesan, kenangan, atau harapanmu untuk angkatan kita.
          {!user && <span className="block mt-1 text-gold/70">Login untuk menulis pesan.</span>}
        </p>
      </div>

      {/* FILTER + ADD BTN */}
      <div className="sticky top-16 md:top-20 z-30 bg-charcoal-dark/90 backdrop-blur-md border-b border-gold/10 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            {['all','neutrino','general'].map(k => (
              <button
                key={k}
                onClick={() => setKelasFilter(k)}
                className={`px-3 py-1 rounded-full text-xs font-heading tracking-wider uppercase transition-all border ${
                  kelasFilter === k ? 'bg-gold text-charcoal-dark border-gold' : 'border-gold/20 text-cream/40 hover:border-gold/40'
                }`}
              >
                {k === 'all' ? 'Semua' : k === 'neutrino' ? 'Neutrino' : 'Umum'}
              </button>
            ))}
          </div>

          {user ? (
            <button onClick={() => setShowForm(!showForm)} className="admin-btn admin-btn-primary text-xs">
              + Tulis Pesan
            </button>
          ) : (
            <a href="/login" className="btn-outline-gold text-xs py-2 px-5">
              Login untuk Menulis
            </a>
          )}
        </div>
      </div>

      {/* ADD NOTE FORM */}
      {showForm && user && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="admin-modal max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-cream text-lg font-bold">Tulis Pesanmu</h3>
              <button onClick={() => setShowForm(false)} className="text-cream/40 hover:text-cream text-xl">×</button>
            </div>

            {/* COLOR PICKER */}
            <div className="flex gap-2 mb-4">
              <span className="text-cream/40 text-xs self-center mr-1">Warna:</span>
              {NOTE_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === i ? 'scale-125 border-gold shadow-gold-sm' : 'border-transparent hover:scale-110'}`}
                  style={{ background: c.bg }}
                />
              ))}
            </div>

            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tulis pesan, kenangan, atau kutipan favoritmu..."
              maxLength={280}
              rows={5}
              className="w-full rounded-lg p-4 text-sm font-script resize-none focus:outline-none focus:ring-2 focus:ring-gold/30"
              style={{ background: NOTE_COLORS[selectedColor].bg, color: NOTE_COLORS[selectedColor].text, fontSize: '1rem' }}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-cream/40 text-xs">{content.length}/280</span>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="admin-btn admin-btn-ghost text-xs">Batal</button>
                <button onClick={handleSubmit} disabled={submitting} className="admin-btn admin-btn-primary text-xs">
                  {submitting ? 'Menempel...' : '📌 Tempel!'}
                </button>
              </div>
            </div>
            <div className="mt-3 text-cream/30 text-[10px] font-body">
              Akan muncul dengan nama: <span className="text-cream/50">{userName || user.email?.split('@')[0]}</span>
            </div>
          </div>
        </div>
      )}

      {/* NOTES BOARD */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton mb-4 break-inside-avoid" style={{ height: `${120 + (i % 3) * 40}px` }} />
            ))}
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className="sticky-note break-inside-avoid mb-4 relative group"
                style={{
                  background: note.color,
                  color: NOTE_COLORS.find(c => c.bg === note.color)?.text || '#5C3D11',
                  transform: `rotate(${note.rotation}deg)`,
                }}
              >
                {/* DELETE btn for own notes or admin */}
                {user && (user.id === note.user_id || isAdmin) && (
                  <button
                    onClick={() => handleDelete(note.id, note.user_id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md z-10"
                  >
                    ×
                  </button>
                )}

                {/* CONTENT */}
                <p className="text-sm leading-relaxed mb-3" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  &ldquo;{note.content}&rdquo;
                </p>

                {/* AUTHOR */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/20">
                  <span className="text-xs opacity-70 font-sans font-bold">— {note.user_name}</span>
                  <span className="text-[10px] opacity-50 font-sans">
                    {new Date(note.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-cream/30 font-display text-xl">
            Belum ada pesan... jadilah yang pertama! 📌
          </div>
        )}
      </div>
    </div>
  );
}
