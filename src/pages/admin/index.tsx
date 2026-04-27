// src/pages/admin/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { supabase, uploadPhoto, uploadImage, deleteFileFromStorage } from '@/lib/supabase';
import type { SantriDB, GalleryItem, GallerySubmission, GuruDB, CustomLink, TimelineItem } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import { LINK_GRADIENT_PRESETS } from '@/components/sections/StudentCard';

type AdminTab = 'dashboard' | 'santri' | 'guru' | 'gallery' | 'submissions' | 'notes' | 'playlist' | 'timeline' | 'settings' | 'users';

const getAccessToken = async (): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
};

const callAdminContent = async (method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body: Record<string, any>) => {
  const token = await getAccessToken();
  const res = await fetch('/api/admin/content', {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: method === 'GET' ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Akses ditolak');
  return data;
};

export default function AdminDashboard() {
  const { user, isAdmin, loading, session, userRole } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState({ santri: 0, photos: 0, notes: 0, tracks: 0, pending: 0 });

  const scopeKelas = userRole === 'manager_ikhwa' ? 'neutrino' : null;
  const isRoot = userRole === 'root';

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error('Akses ditolak!');
      router.replace('/login');
    }
  }, [user, isAdmin, loading]);

  useEffect(() => { fetchStats(); }, [scopeKelas]);

  const fetchStats = async () => {
    try {
      const pendingQuery = supabase
        .from('gallery_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      const scopedPendingQuery = scopeKelas ? pendingQuery.or(`kelas.eq.${scopeKelas},kelas.eq.all,kelas.eq.both`) : pendingQuery;

      const santriQuery = scopeKelas
        ? supabase.from('santri').select('id', { count: 'exact', head: true }).or(`kelas.eq.${scopeKelas},kelas.eq.all,kelas.eq.both`)
        : supabase.from('santri').select('id', { count: 'exact', head: true });
      const galleryQuery = scopeKelas
        ? supabase.from('gallery').select('id', { count: 'exact', head: true }).or(`kelas.eq.${scopeKelas},kelas.eq.all,kelas.eq.both`)
        : supabase.from('gallery').select('id', { count: 'exact', head: true });
      const notesQuery = scopeKelas
        ? supabase.from('sticky_notes').select('id', { count: 'exact', head: true }).or(`kelas.eq.${scopeKelas},kelas.eq.general,kelas.eq.both`)
        : supabase.from('sticky_notes').select('id', { count: 'exact', head: true });
      const playlistQuery = supabase.from('playlist').select('id', { count: 'exact', head: true });

      const [s1, s2, s3, s4, s5] = await Promise.all([
        santriQuery,
        galleryQuery,
        notesQuery,
        playlistQuery,
        scopedPendingQuery,
      ]);
      setStats({ santri: s1.count||0, photos: s2.count||0, notes: s3.count||0, tracks: s4.count||0, pending: s5.count||0 });
    } catch { /* */ }
  };

  if (loading) return (
    <div className="min-h-screen dark-paper flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
    </div>
  );
  if (!user || !isAdmin) return null;

  const TABS: { id: AdminTab; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard',   label: 'Dashboard',    icon: '📊' },
    { id: 'santri',      label: 'Data Santri',  icon: '👥' },
    { id: 'guru',        label: 'Wali Kelas',   icon: '🎓' },
    { id: 'gallery',     label: 'Gallery',      icon: '📸' },
    { id: 'submissions', label: 'Pending',      icon: '📤', badge: stats.pending },
    { id: 'notes',       label: 'Quote Wall',   icon: '📌' },
    { id: 'playlist',    label: 'Playlist',     icon: '🎵' },
    ...(isRoot ? [{ id: 'timeline' as const, label: 'Timeline', icon: '📅' }] : []),
    ...(isRoot ? [{ id: 'settings' as const, label: 'Pengaturan', icon: '⚙️' }] : []),
    ...(isRoot ? [{ id: 'users' as const, label: 'Akun', icon: '🔐' }] : []),
  ];

  return (
    <div className="min-h-screen dark-paper">
      <Navbar />

      <div className="pt-16 md:pt-20 flex">
        {/* SIDEBAR — Desktop */}
        <aside className="hidden lg:block w-64 admin-sidebar fixed top-16 md:top-20 bottom-0 overflow-y-auto py-6 px-3">
          <div className="mb-6 px-3">
            <div className="text-gold font-heading text-xs tracking-[0.3em] uppercase">Admin Panel</div>
            <div className="text-cream/40 text-[10px] font-body mt-1 truncate">{user.email}</div>
          </div>
          <nav className="space-y-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`admin-sidebar-link ${tab === t.id ? 'active' : ''}`}>
                <span className="text-lg">{t.icon}</span>
                <span className="flex-1">{t.label}</span>
                {t.badge ? <span className="admin-badge admin-badge-pending text-[10px]">{t.badge}</span> : null}
              </button>
            ))}
          </nav>
        </aside>

        {/* SIDEBAR — Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-charcoal-dark/95 border-t border-gold/20 backdrop-blur-md safe-area-bottom">
          <div className="px-1 py-1 flex gap-0.5 overflow-x-auto scrollbar-hide">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-col items-center min-w-[48px] py-2 px-1 rounded-lg text-center transition-all relative flex-shrink-0 ${tab === t.id ? 'text-gold bg-gold/10' : 'text-cream/40'}`}>
                <span className="text-sm">{t.icon}</span>
                <span className="text-[7px] font-heading tracking-wider mt-0.5 leading-none">{t.label.split(' ')[0]}</span>
                {t.badge ? <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[7px] flex items-center justify-center">{t.badge}</span> : null}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-x-visible lg:ml-64 px-3 sm:px-4 md:px-8 py-6 sm:py-8 pb-28 lg:pb-8">
          {tab === 'dashboard'   && <DashboardTab stats={stats} setTab={setTab} />}
          {tab === 'santri'      && <SantriTab scopeKelas={scopeKelas} />}
          {tab === 'guru'        && <GuruTab scopeKelas={scopeKelas} />}
          {tab === 'gallery'     && <GalleryTab scopeKelas={scopeKelas} />}
          {tab === 'submissions' && <SubmissionsTab onUpdate={fetchStats} scopeKelas={scopeKelas} />}
          {tab === 'notes'       && <NotesTab scopeKelas={scopeKelas} />}
          {tab === 'playlist'    && <PlaylistTab scopeKelas={scopeKelas} />}
          {tab === 'timeline'    && isRoot && <TimelineTab />}
          {tab === 'settings'    && isRoot && <SettingsTab />}
          {tab === 'users'       && isRoot && <UsersTab session={session} />}
        </main>
      </div>
    </div>
  );
}

// ── DASHBOARD TAB ─────────────────────
function DashboardTab({ stats, setTab }: { stats: any; setTab: (t: AdminTab) => void }) {
  return (
    <div>
      <h1 className="font-display text-cream text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-cream/40 text-sm font-body mb-8">Selamat datang di panel admin Yearbook Angkatan 26</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Santri', value: stats.santri || 39, icon: '👥', color: '#C9A227' },
          { label: 'Foto Gallery', value: stats.photos, icon: '📸', color: '#F0C040' },
          { label: 'Pesan', value: stats.notes, icon: '📌', color: '#E8C5A0' },
          { label: 'Pending', value: stats.pending, icon: '📤', color: stats.pending > 0 ? '#fbbf24' : '#6BAF92' },
        ].map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              </div>
            </div>
            <div className="text-3xl font-display font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-cream/50 text-xs font-body mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      {stats.pending > 0 && (
        <button onClick={() => setTab('submissions')} className="admin-btn admin-btn-primary w-full py-3 justify-center">
          📤 Ada {stats.pending} foto menunggu persetujuan →
        </button>
      )}
    </div>
  );
}

// ── SANTRI TAB ────────────────────────
function SantriTab({ scopeKelas }: { scopeKelas: string | null }) {
  const [santri, setSantri] = useState<SantriDB[]>([]);
  const [search, setSearch] = useState('');
  const [kelasFilter, setKelasFilter] = useState(scopeKelas ?? 'all');
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<SantriDB | null>(null);
  const [addModal, setAddModal] = useState(false);

  useEffect(() => { fetchSantri(); }, []);

  const fetchSantri = async (background = false) => {
    if (!background) setLoading(true);
    const { data } = await supabase.from('santri').select('*').order('nama', { ascending: true });
    if (data) setSantri(data as SantriDB[]);
    setLoading(false);
  };

  useEffect(() => {
    if (editModal || addModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [editModal, addModal]);

  const effectiveKelasFilter = scopeKelas ?? kelasFilter;
  const filtered = santri.filter(s =>
    (effectiveKelasFilter === 'all' || s.kelas === effectiveKelasFilter || s.kelas as any === 'both' || s.kelas as any === 'all') &&
    (s.nama.toLowerCase().includes(search.toLowerCase()) || s.tempat_lahir.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-cream text-xl font-bold">Data Santri</h2>
          <p className="text-cream/40 text-xs font-body">{santri.length} santri terdaftar · urutan A–Z</p>
        </div>
        <button onClick={() => setAddModal(true)} className="admin-btn admin-btn-primary text-xs">+ Tambah Santri</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama..." className="admin-input max-w-xs" />
        {!scopeKelas ? (
          <select value={kelasFilter} onChange={e => setKelasFilter(e.target.value)} className="admin-select max-w-[160px]">
            <option value="all">Semua Kelas</option>
            <option value="neutrino">Neutrino</option>
          </select>
        ) : (
          <div className="admin-badge admin-badge-approved text-xs px-3 py-2">{scopeKelas}</div>
        )}
      </div>

      <div className="overflow-x-auto block w-full min-w-0 rounded-xl border border-gold/15" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="admin-table min-w-[800px] w-full">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Nama</th>
              <th>Kelas</th>
              <th>Jabatan</th>
              <th>Foto</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6}><div className="skeleton h-8 w-full" /></td></tr>
              ))
            ) : filtered.map((s, idx) => (
              <tr key={s.id}>
                <td className="font-mono text-gold/50 text-xs">{idx + 1}</td>
                <td className="font-display font-bold text-sm whitespace-nowrap">{s.nama}</td>
                <td><span className={`admin-badge admin-badge-approved`}>{s.kelas}</span></td>
                <td className="text-cream/50 text-xs capitalize whitespace-nowrap">{s.jabatan || 'anggota'}</td>
                <td>{s.foto ? <div className="w-8 h-8 rounded-md overflow-hidden border border-gold/20"><img src={s.foto} className="w-full h-full object-cover" /></div> : <span className="text-cream/20 text-xs">—</span>}</td>
                <td className="whitespace-nowrap">
                  <div className="flex gap-2">
                    <button onClick={() => setEditModal(s)} className="admin-btn admin-btn-ghost text-[10px] py-1 px-2">Edit</button>
                    <button onClick={async () => {
                      if(!confirm(`Hapus ${s.nama}?`)) return;
                      try {
                        await callAdminContent('DELETE', { resource: 'santri', id: s.id });
                        if (s.foto) await deleteFileFromStorage(s.foto);
                        fetchSantri();
                        toast.success('Dihapus');
                      } catch (err: any) {
                        toast.error(err?.message || 'Gagal menghapus');
                      }
                    }} className="admin-btn admin-btn-danger text-[10px] py-1 px-2">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editModal && <EditSantriModal scopeKelas={scopeKelas} santri={editModal} onClose={() => setEditModal(null)} onSave={() => { setEditModal(null); fetchSantri(true); }} />}
      {addModal && <AddSantriModal scopeKelas={scopeKelas} onClose={() => setAddModal(false)} onSave={() => { setAddModal(false); fetchSantri(true); }} />}
    </div>
  );
}

// ── CUSTOM LINKS EDITOR COMPONENT ─────
function CustomLinksEditor({ links, onChange }: { links: CustomLink[]; onChange: (links: CustomLink[]) => void }) {
  const addLink = () => onChange([...links, { label: '', url: '', type: 'link', color: 'gold' }]);
  const removeLink = (i: number) => onChange(links.filter((_, idx) => idx !== i));
  const updateLink = (i: number, updates: Partial<CustomLink>) => {
    const newLinks = [...links];
    newLinks[i] = { ...newLinks[i], ...updates };
    onChange(newLinks);
  };

  // Auto-detect type from URL input
  const autoDetect = (i: number, value: string) => {
    const cleaned = value.replace(/[\s\-()]/g, '');
    const isPhone = /^(\+62|62|08)\d+$/.test(cleaned);
    updateLink(i, { url: value, type: isPhone ? 'phone' : 'link' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="section-label text-[10px]">Custom Links</label>
        <button onClick={addLink} type="button" className="admin-btn admin-btn-ghost text-[10px] py-0.5 px-2">+ Tambah Link</button>
      </div>
      <div className="space-y-3">
        {links.map((link, i) => (
          <div key={i} className="card-dark p-3 space-y-2">
            <div className="flex gap-2">
              <input
                value={link.label}
                onChange={e => updateLink(i, { label: e.target.value })}
                placeholder="Label button (misal: Portfolio)"
                className="admin-input flex-1 text-xs"
              />
              <button onClick={() => removeLink(i)} className="admin-btn admin-btn-danger text-[10px] py-1 px-2 flex-shrink-0">✕</button>
            </div>
            <input
              value={link.url}
              onChange={e => autoDetect(i, e.target.value)}
              placeholder="URL atau nomor HP (misal: mikhayl.my.id atau 081234567890)"
              className="admin-input text-xs"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-cream/30 text-[10px]">Tipe: <span className={`font-bold ${link.type === 'phone' ? 'text-green-400' : 'text-blue-400'}`}>{link.type === 'phone' ? '📱 Telepon/WA' : '🔗 Website'}</span></span>
              <span className="text-cream/20">|</span>
              <span className="text-cream/30 text-[10px]">Warna:</span>
              <div className="flex gap-1 flex-wrap">
                {Object.entries(LINK_GRADIENT_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => updateLink(i, { color: key })}
                    className={`w-6 h-6 rounded-full border-2 transition-all text-[8px] ${link.color === key ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ background: preset.bg, borderColor: link.color === key ? preset.text : 'transparent' }}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
        {links.length === 0 && (
          <p className="text-cream/20 text-[10px] text-center py-2">Belum ada custom link. Klik "+ Tambah Link" untuk menambahkan.</p>
        )}
      </div>
    </div>
  );
}

// ── EDIT SANTRI MODAL ─────────────────
function EditSantriModal({ scopeKelas, santri, onClose, onSave }: { scopeKelas: string | null; santri: SantriDB; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ ...santri });
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(() => {
    try {
      if (Array.isArray(santri.custom_links)) return santri.custom_links;
      if (typeof santri.custom_links === 'string') return JSON.parse(santri.custom_links);
      return [];
    } catch { return []; }
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = (shouldRefresh = false) => {
    setIsClosing(true);
    setTimeout(() => {
      if (shouldRefresh) onSave();
      else onClose();
    }, 300);
  };

  const handleSave = async () => {
    setSaving(true);
    const { id, created_at, updated_at, ...updates } = form;
    (updates as any).custom_links = customLinks;
    try {
      await callAdminContent('PATCH', { resource: 'santri', id: santri.id, updates });
      toast.success('Data diperbarui!');
      handleClose(true);
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + (err?.message || ''));
    }
    setSaving(false);
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const oldPhoto = form.foto;
      const url = await uploadImage(file, `santri/${santri.id}_${Date.now()}.webp`);
      setForm(f => ({ ...f, foto: url }));
      if (oldPhoto) await deleteFileFromStorage(oldPhoto);
      toast.success('Foto diupload (WebP optimized)!');
    } catch (err: any) { toast.error('Gagal upload: ' + (err?.message || 'Unknown error')); }
    setUploading(false);
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Hapus foto santri? Foto akan direset ke default.')) return;
    const oldPhoto = form.foto;
    setForm(f => ({ ...f, foto: '' }));
    if (oldPhoto) await deleteFileFromStorage(oldPhoto);
    toast.success('Foto dihapus dari storage.');
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out-fast' : 'animate-fade-in-fast'}`} 
        onClick={() => handleClose()}
      />
      
      {/* Modal Card */}
      <div className={`relative w-full max-w-lg bg-[#1a1a1a] border border-gold/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] ${isClosing ? 'animate-premium-exit' : 'animate-premium-zoom'}`}>
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gold/5 blur-[50px] rounded-full pointer-events-none" />
        
        {/* Header - Compact */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/5 opacity-0 animate-fade-in-fast animate-stagger-1">
          <div>
            <h3 className="font-display text-cream text-base font-bold leading-tight truncate max-w-[200px]">Edit: {santri.nama}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-5 h-[1px] bg-gold/30" />
              <p className="text-[7px] text-gold/60 uppercase tracking-[0.3em] font-heading">Manajemen Profil</p>
            </div>
          </div>
          <button 
            onClick={() => handleClose()} 
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-cream/30 hover:text-white hover:bg-red-500/20 transition-all duration-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="relative flex-1 overflow-y-auto p-5 pt-4 custom-scrollbar">
          <div className="space-y-6">
            {/* Photo Section */}
            <div className="opacity-0 animate-fade-in-fast animate-stagger-2">
              <label className="section-label text-[8px] block mb-2 uppercase tracking-[0.2em] font-bold">Foto Profil</label>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {form.foto ? (
                    <img src={form.foto} className="w-16 h-16 rounded-xl object-cover border border-gold/30 shadow-lg shadow-gold/5" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cream/20">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`admin-btn bg-white/5 border border-white/10 hover:border-gold/30 text-[9px] py-1.5 px-3 cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? 'UPLOADING...' : 'GANTI FOTO'}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
                  </label>
                  {form.foto && (
                    <button onClick={handleDeletePhoto} className="text-red-400/50 hover:text-red-400 text-[8px] font-bold uppercase tracking-widest pl-1 transition-colors">
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-0 animate-fade-in-fast animate-stagger-3">
              <div className="sm:col-span-2">
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Nama Lengkap</label>
                <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} className="admin-input text-xs py-2" />
              </div>
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Tempat Lahir</label>
                <input value={form.tempat_lahir} onChange={e => setForm(f => ({ ...f, tempat_lahir: e.target.value }))} className="admin-input text-xs py-2" />
              </div>
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Tanggal Lahir</label>
                <input type="date" value={form.tanggal_lahir} onChange={e => setForm(f => ({ ...f, tanggal_lahir: e.target.value }))} className="admin-input text-xs py-2" />
              </div>
            </div>

            {/* Role & Class */}
            <div className="grid grid-cols-2 gap-4 opacity-0 animate-fade-in-fast animate-stagger-4">
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Jabatan</label>
                <select value={form.jabatan || 'anggota'} onChange={e => setForm(f => ({ ...f, jabatan: e.target.value }))} className="admin-select text-xs py-2">
                  <option value="anggota">Anggota</option>
                  <option value="ketua">Ketua</option>
                  <option value="sekretaris">Sekretaris</option>
                  <option value="bendahara">Bendahara</option>
                </select>
              </div>
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Kelas</label>
                <select
                  value={scopeKelas ?? form.kelas}
                  onChange={e => setForm(f => ({ ...f, kelas: e.target.value as any }))}
                  className="admin-select text-xs py-2"
                  disabled={!!scopeKelas}
                >
                  <option value="neutrino">Neutrino</option>
                </select>
              </div>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-2 gap-4 opacity-0 animate-fade-in-fast animate-stagger-5">
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Instagram</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/20 text-[10px]">@</span>
                  <input value={form.instagram || ''} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="username" className="admin-input pl-7 text-xs py-2" />
                </div>
              </div>
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">WhatsApp</label>
                <input value={form.wa || ''} onChange={e => setForm(f => ({ ...f, wa: e.target.value }))} placeholder="08xxx" className="admin-input text-xs py-2" />
              </div>
            </div>

            {/* Custom Links */}
            <div className="opacity-0 animate-fade-in-fast animate-stagger-5">
              <CustomLinksEditor links={customLinks} onChange={setCustomLinks} />
            </div>

            {/* Quotes & Bio */}
            <div className="space-y-4 opacity-0 animate-fade-in-fast animate-stagger-5 pb-2">
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Quote Utama</label>
                <textarea value={form.quote || ''} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} rows={2} className="admin-input resize-none text-xs py-2" placeholder="Kata mutiara..." />
              </div>
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Deskripsi / Bio</label>
                <textarea value={(form as any).deskripsi || ''} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value } as any))} rows={3} className="admin-input resize-none text-xs py-2" placeholder="Tentang santri ini..." />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="relative p-5 pt-3 border-t border-white/5 bg-[#1a1a1a]/80 backdrop-blur-md opacity-0 animate-fade-in-fast animate-stagger-5">
          <div className="flex gap-2">
            <button 
              onClick={() => handleClose()} 
              className="flex-1 py-2.5 rounded-xl text-[9px] font-bold font-heading tracking-widest text-cream/40 hover:text-cream bg-white/5 border border-white/5 transition-all"
            >
              BATAL
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="flex-[1.5] py-2.5 rounded-xl text-[9px] font-bold font-heading tracking-widest bg-gradient-to-r from-gold-dark to-gold text-charcoal-dark shadow-lg shadow-gold/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? 'SAVING...' : 'SIMPAN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADD SANTRI MODAL ──────────────────
function AddSantriModal({ scopeKelas, onClose, onSave }: { scopeKelas: string | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ id: '', no: 0, nama: '', tempat_lahir: '', tanggal_lahir: '', kelas: (scopeKelas ?? 'neutrino') as any, jabatan: 'anggota', instagram: '', wa: '', quote: '', link: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.nama || !form.tempat_lahir || !form.tanggal_lahir) { toast.error('Isi data lengkap!'); return; }
    setSaving(true);
    const id = `n-${String(form.no).padStart(2,'0')}`;
    try {
      await callAdminContent('POST', { resource: 'santri', data: { ...form, id } });
    } catch (err: any) {
      toast.error('Gagal: ' + (err?.message || ''));
      setSaving(false);
      return;
    }
    toast.success('Santri ditambahkan!');
    setSaving(false);
    onSave();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-cream text-lg font-bold">Tambah Santri Baru</h3>
          <button onClick={onClose} className="text-cream/40 hover:text-cream text-xl">×</button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label text-[10px] block mb-2">Kelas</label>
              <select value={scopeKelas ?? form.kelas} onChange={e => setForm(f=>({...f,kelas:e.target.value as any}))} className="admin-select" disabled={!!scopeKelas}>
                <option value="neutrino">Neutrino</option>
              </select>
            </div>
          </div>
          <div><label className="section-label text-[10px] block mb-2">Nama Lengkap</label><input value={form.nama} onChange={e => setForm(f=>({...f,nama:e.target.value}))} className="admin-input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="section-label text-[10px] block mb-2">Tempat Lahir</label><input value={form.tempat_lahir} onChange={e => setForm(f=>({...f,tempat_lahir:e.target.value}))} className="admin-input" /></div>
            <div><label className="section-label text-[10px] block mb-2">Tanggal Lahir</label><input type="date" value={form.tanggal_lahir} onChange={e => setForm(f=>({...f,tanggal_lahir:e.target.value}))} className="admin-input" /></div>
          </div>
          <div><label className="section-label text-[10px] block mb-2">Jabatan</label><select value={form.jabatan} onChange={e => setForm(f=>({...f,jabatan:e.target.value}))} className="admin-select"><option value="anggota">Anggota</option><option value="ketua">Ketua</option><option value="sekretaris">Sekretaris</option><option value="bendahara">Bendahara</option></select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="section-label text-[10px] block mb-2">Instagram</label><input value={form.instagram} onChange={e => setForm(f=>({...f,instagram:e.target.value}))} placeholder="username" className="admin-input" /></div>
            <div><label className="section-label text-[10px] block mb-2">WhatsApp</label><input value={form.wa} onChange={e => setForm(f=>({...f,wa:e.target.value}))} placeholder="6281..." className="admin-input" /></div>
          </div>
          <div><label className="section-label text-[10px] block mb-2">Link Card</label><input value={form.link} onChange={e => setForm(f=>({...f,link:e.target.value}))} placeholder="https://..." className="admin-input" /></div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="admin-btn admin-btn-ghost flex-1 py-2.5 justify-center btn-press-active">Batal</button>
          <button onClick={handleSave} disabled={saving} className={`admin-btn admin-btn-primary flex-1 py-2.5 justify-center btn-press-active ${saving ? 'btn-loading-shimmer opacity-80' : ''}`}>{saving ? 'Menyimpan...' : '+ Tambah'}</button>
        </div>
      </div>
    </div>
  );
}

// ── GURU TAB ──────────────────────────
function GuruTab({ scopeKelas }: { scopeKelas: string | null }) {
  const [guru, setGuru] = useState<GuruDB[]>([]);
  const [editModal, setEditModal] = useState<GuruDB|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGuru(); }, []);
  const fetchGuru = async () => {
    setLoading(true);
    let query = supabase.from('guru').select('*');
    if (scopeKelas) query = query.or(`kelas.eq.${scopeKelas},kelas.eq.all,kelas.eq.both`);
    const { data } = await query;
    if (data) setGuru(data as GuruDB[]);
    setLoading(false);
  };

  return (
    <div>
      <h2 className="font-display text-cream text-xl font-bold mb-6">Wali Kelas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guru.map(g => (
          <div key={g.id} className="card-dark p-6 flex items-center gap-4">
            {g.foto ? <img src={g.foto} className="w-16 h-16 rounded-full object-cover border border-gold/20" /> : <div className="w-16 h-16 rounded-full skeleton" />}
            <div className="flex-1">
              <h3 className="font-display text-cream font-bold">{g.nama}</h3>
              <p className="text-gold/70 text-xs">{g.jabatan_guru} · {g.kelas}</p>
            </div>
            <button onClick={() => setEditModal(g)} className="admin-btn admin-btn-ghost text-xs btn-press-active">Edit</button>
          </div>
        ))}
      </div>
      {editModal && <EditGuruModal guru={editModal} onClose={() => setEditModal(null)} onSave={() => { setEditModal(null); fetchGuru(); }} />}
    </div>
  );
}

function EditGuruModal({ guru, onClose, onSave }: { guru: GuruDB; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ ...guru });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = (shouldRefresh = false) => {
    setIsClosing(true);
    setTimeout(() => {
      if (shouldRefresh) onSave();
      else onClose();
    }, 300);
  };

  const handleSave = async () => {
    setSaving(true);
    const { id, created_at, updated_at, ...updates } = form;
    try {
      await callAdminContent('PATCH', { resource: 'guru', id: guru.id, updates });
      toast.success('Data guru diperbarui!');
      handleClose(true);
    } catch (err: any) {
      toast.error('Gagal: ' + (err?.message || ''));
    }
    setSaving(false);
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const oldPhoto = form.foto;
      const url = await uploadImage(file, `guru/${guru.id}_${Date.now()}.webp`);
      setForm(f => ({ ...f, foto: url }));
      if (oldPhoto) await deleteFileFromStorage(oldPhoto);
      toast.success('Foto diupload (WebP optimized)!');
    } catch (err: any) { toast.error('Gagal: ' + (err?.message || '')); }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out-fast' : 'animate-fade-in-fast'}`} 
        onClick={() => handleClose()}
      />
      
      {/* Modal Card */}
      <div className={`relative w-full max-w-lg bg-[#1a1a1a] border border-gold/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] ${isClosing ? 'animate-premium-exit' : 'animate-premium-zoom'}`}>
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gold/5 blur-[50px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/5 opacity-0 animate-fade-in-fast animate-stagger-1">
          <div>
            <h3 className="font-display text-cream text-base font-bold leading-tight">Edit Wali: {guru.nama}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-5 h-[1px] bg-gold/30" />
              <p className="text-[7px] text-gold/60 uppercase tracking-[0.3em] font-heading">Data Tenaga Pendidik</p>
            </div>
          </div>
          <button 
            onClick={() => handleClose()} 
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-cream/30 hover:text-white hover:bg-red-500/20 transition-all duration-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="relative flex-1 overflow-y-auto p-5 pt-4 custom-scrollbar">
          <div className="space-y-6">
            {/* Photo Section */}
            <div className="opacity-0 animate-fade-in-fast animate-stagger-2">
              <label className="section-label text-[8px] block mb-2 uppercase tracking-[0.2em] font-bold">Foto Profil</label>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {form.foto ? (
                    <img src={form.foto} className="w-16 h-16 rounded-full object-cover border border-gold/30 shadow-lg shadow-gold/5" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cream/20">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <label className={`admin-btn bg-white/5 border border-white/10 hover:border-gold/30 text-[9px] py-1.5 px-3 cursor-pointer transition-all btn-press-active ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading ? 'UPLOADING...' : '📷 GANTI FOTO'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4 opacity-0 animate-fade-in-fast animate-stagger-3">
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Nama Lengkap</label>
                <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} className="admin-input text-xs py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Instagram</label>
                  <input value={form.instagram || ''} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} className="admin-input text-xs py-2" placeholder="username" />
                </div>
                <div>
                  <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">WhatsApp</label>
                  <input value={form.wa || ''} onChange={e => setForm(f => ({ ...f, wa: e.target.value }))} className="admin-input text-xs py-2" placeholder="08xxx" />
                </div>
              </div>
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Deskripsi / Moto</label>
                <textarea value={form.deskripsi || ''} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} rows={3} className="admin-input resize-none text-xs py-2" placeholder="Kata-kata mutiara..." />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative p-5 pt-3 border-t border-white/5 bg-[#1a1a1a]/80 backdrop-blur-md opacity-0 animate-fade-in-fast animate-stagger-5">
          <div className="flex gap-2">
            <button 
              onClick={() => handleClose()} 
              className="flex-1 py-2.5 rounded-xl text-[9px] font-bold font-heading tracking-widest text-cream/40 hover:text-cream bg-white/5 border border-white/5 transition-all btn-press-active"
            >
              BATAL
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className={`flex-[1.5] py-2.5 rounded-xl text-[9px] font-bold font-heading tracking-widest bg-gradient-to-r from-gold-dark to-gold text-charcoal-dark shadow-lg shadow-gold/20 transition-all btn-press-active ${saving ? 'btn-loading-shimmer opacity-80' : ''}`}
            >
              {saving ? 'SAVING...' : 'SIMPAN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GALLERY TAB ───────────────────────
function GalleryTab({ scopeKelas }: { scopeKelas: string | null }) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const { user } = useAuth();

  useEffect(() => { fetchGallery(); }, []);
  const fetchGallery = async (background = false) => {
    if (!background) setLoading(true);
    let query = supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (scopeKelas) query = query.or(`kelas.eq.${scopeKelas},kelas.eq.all,kelas.eq.both`);
    const { data } = await query;
    if (data) setGallery(data as GalleryItem[]);
    setLoading(false);
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Hapus foto ini? Foto ini juga akan dihapus dari storage.')) return;
    try {
      await callAdminContent('DELETE', { resource: 'gallery', id });
      if (url) await deleteFileFromStorage(url);
      setGallery(g => g.filter(x => x.id !== id));
      toast.success('Dihapus');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-cream text-xl font-bold">Gallery ({gallery.length})</h2>
        <button 
          onClick={() => setShowAdd(true)} 
          className="admin-btn admin-btn-primary text-xs btn-press-active"
        >
          + Upload Foto
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-lg" />)
        ) : gallery.map(g => (
          <div key={g.id} className="relative group rounded-lg overflow-hidden border border-gold/10">
            <img src={g.url} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-charcoal-dark/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <button onClick={() => handleDelete(g.id, g.url)} className="admin-btn admin-btn-danger text-xs btn-press-active">🗑 Hapus</button>
            </div>
            <div className="p-2 bg-charcoal-dark/50 backdrop-blur-md">
              <p className="text-cream/70 text-[10px] truncate">{g.caption || '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddPhotoModal 
          scopeKelas={scopeKelas} 
          onClose={() => setShowAdd(false)} 
          onSave={() => { setShowAdd(false); fetchGallery(true); }} 
        />
      )}
    </div>
  );
}

function AddPhotoModal({ scopeKelas, onClose, onSave }: { scopeKelas: string | null; onClose: () => void; onSave: () => void }) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [article, setArticle] = useState('');
  const [category, setCategory] = useState('momen');
  const [kelas, setKelas] = useState(scopeKelas ?? 'all');
  const [uploading, setUploading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = (shouldRefresh = false) => {
    setIsClosing(true);
    setTimeout(() => {
      if (shouldRefresh) onSave();
      else onClose();
    }, 300);
  };

  const allowedCategories = scopeKelas
    ? ['momen', 'rihlah', 'wisuda', 'keseharian', scopeKelas]
    : ['momen', 'rihlah', 'wisuda', 'neutrino', 'keseharian'];

  const handleUpload = async () => {
    if (!uploadFile) { toast.error('Pilih foto!'); return; }
    setUploading(true);
    try {
      const url = await uploadImage(uploadFile, `gallery/${Date.now()}.webp`);
      await callAdminContent('POST', {
        resource: 'gallery',
        data: { url, caption, article_text: article || null, category, kelas: scopeKelas ?? kelas, submitted_name: 'Admin', submitted_by: user?.id },
      });
      toast.success('Foto diupload (WebP optimized)!');
      handleClose(true);
    } catch (err: any) {
      toast.error('Gagal upload: ' + (err?.message || 'Cek koneksi dan storage bucket'));
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out-fast' : 'animate-fade-in-fast'}`} 
        onClick={() => handleClose()}
      />
      
      <div className={`relative w-full max-w-lg bg-[#1a1a1a] border border-gold/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${isClosing ? 'animate-premium-exit' : 'animate-premium-zoom'}`}>
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h3 className="font-display text-cream text-base font-bold leading-tight">Upload Foto Gallery</h3>
            <p className="text-[7px] text-gold/60 uppercase tracking-[0.3em] font-heading mt-0.5">Tambah Kenangan Baru</p>
          </div>
          <button onClick={() => handleClose()} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-cream/30 hover:text-white transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Photo Picker */}
          <div className="opacity-0 animate-fade-in-fast animate-stagger-1">
            {uploadPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gold/20 shadow-xl group">
                <img src={uploadPreview} className="w-full h-48 object-cover" />
                <button 
                  onClick={() => { setUploadFile(null); setUploadPreview(''); }} 
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-red-500 transition-all btn-press-active"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center py-12 border-2 border-dashed border-gold/10 hover:border-gold/30 rounded-2xl cursor-pointer transition-all bg-white/[0.02] group btn-press-active">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-cream/50 text-xs font-heading tracking-wider">PILIH FOTO</span>
                <span className="text-cream/20 text-[9px] mt-1">PNG, JPG, WEBP (Max 50MB)</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadFile(f);
                      const r = new FileReader();
                      r.onload = () => setUploadPreview(r.result as string);
                      r.readAsDataURL(f);
                    }
                  }} 
                />
              </label>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4 opacity-0 animate-fade-in-fast animate-stagger-2">
            <div>
              <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Caption Foto</label>
              <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Judul momen..." className="admin-input text-xs py-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Kategori</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="admin-select text-xs py-2">
                  {allowedCategories.map(cat => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Target Kelas</label>
                <select value={scopeKelas ?? kelas} onChange={e => setKelas(e.target.value)} className="admin-select text-xs py-2" disabled={!!scopeKelas}>
                  <option value="all">Semua Kelas</option>
                  <option value="neutrino">Neutrino</option>
                </select>
              </div>
            </div>

            <div>
              <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Cerita / Artikel (Opsional)</label>
              <textarea value={article} onChange={e => setArticle(e.target.value)} placeholder="Ceritakan detail momen ini..." rows={3} className="admin-input resize-none text-xs py-2" />
            </div>
          </div>
        </div>

        <div className="relative p-5 pt-3 border-t border-white/5 bg-[#1a1a1a]/80 backdrop-blur-md">
          <div className="flex gap-2">
            <button 
              onClick={() => handleClose()} 
              className="flex-1 py-2.5 rounded-xl text-[9px] font-bold font-heading tracking-widest text-cream/40 hover:text-cream bg-white/5 border border-white/5 transition-all btn-press-active"
            >
              BATAL
            </button>
            <button 
              onClick={handleUpload} 
              disabled={uploading} 
              className={`flex-[1.5] py-2.5 rounded-xl text-[9px] font-bold font-heading tracking-widest bg-gradient-to-r from-gold-dark to-gold text-charcoal-dark shadow-lg shadow-gold/20 transition-all btn-press-active ${uploading ? 'btn-loading-shimmer opacity-80' : ''}`}
            >
              {uploading ? 'UPLOADING...' : 'PUBLISH FOTO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SUBMISSIONS TAB ───────────────────
function SubmissionsTab({ onUpdate, scopeKelas }: { onUpdate: () => void; scopeKelas: string | null }) {
  const [subs, setSubs] = useState<GallerySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSubs(); }, []);
  const fetchSubs = async () => {
    setLoading(true);
    let query = supabase.from('gallery_submissions').select('*').order('created_at', { ascending: false });
    if (scopeKelas) query = query.or(`kelas.eq.${scopeKelas},kelas.eq.all,kelas.eq.both`);
    const { data } = await query;
    if (data) setSubs(data as GallerySubmission[]);
    setLoading(false);
  };

  const handleApprove = async (sub: GallerySubmission) => {
    try {
      await callAdminContent('POST', {
        resource: 'gallery',
        data: { url:sub.url, caption:sub.caption, article_text:sub.article_text, category:sub.category, kelas:sub.kelas, submitted_by:sub.submitted_by, submitted_name:sub.submitted_name },
      });
      await callAdminContent('PATCH', { resource: 'submission', id: sub.id, status: 'approved' });
      toast.success('Foto disetujui! ✅'); fetchSubs(); onUpdate();
    } catch { toast.error('Gagal'); }
  };

  const handleReject = async (id: string) => {
    try {
      await callAdminContent('PATCH', { resource: 'submission', id, status: 'rejected' });
      const sub = subs.find(s => s.id === id);
      if (sub?.url) await deleteFileFromStorage(sub.url);
      toast.success('Ditolak'); fetchSubs(); onUpdate();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menolak');
    }
  };

  const pending = subs.filter(s => s.status === 'pending');
  const processed = subs.filter(s => s.status !== 'pending');

  return (
    <div>
      <h2 className="font-display text-cream text-xl font-bold mb-6">Foto Pending ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="card-dark p-8 text-center text-cream/30"><p className="text-2xl mb-2">✅</p><p>Tidak ada foto yang menunggu persetujuan</p></div>
      ) : (
        <div className="space-y-4 mb-8">
          {pending.map(sub => (
            <div key={sub.id} className="card-dark p-4 flex flex-col sm:flex-row gap-4">
              <img src={sub.url} className="w-full sm:w-40 h-40 object-cover rounded-lg border border-gold/20" />
              <div className="flex-1">
                <h4 className="font-display text-cream font-bold text-sm">{sub.caption || 'Tanpa caption'}</h4>
                <p className="text-cream/40 text-xs mt-1">oleh {sub.submitted_name} · {new Date(sub.created_at).toLocaleDateString('id-ID')}</p>
                {sub.article_text && <p className="text-cream/50 text-xs mt-2 line-clamp-3">{sub.article_text}</p>}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleApprove(sub)} className="admin-btn admin-btn-success text-xs btn-press-active">✅ Setujui</button>
                  <button onClick={() => handleReject(sub.id)} className="admin-btn admin-btn-danger text-xs btn-press-active">❌ Tolak</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {processed.length > 0 && (
        <>
          <h3 className="font-display text-cream/50 text-sm font-bold mb-4">Riwayat ({processed.length})</h3>
          <div className="space-y-2">
            {processed.slice(0,10).map(sub => (
              <div key={sub.id} className="card-dark p-3 flex items-center gap-3">
                <img src={sub.url} className="w-10 h-10 rounded object-cover" />
                <div className="flex-1"><span className="text-cream/70 text-xs">{sub.caption||'—'}</span><span className="text-cream/30 text-[10px] ml-2">oleh {sub.submitted_name}</span></div>
                <span className={`admin-badge ${sub.status==='approved'?'admin-badge-approved':'admin-badge-rejected'}`}>{sub.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── NOTES TAB ─────────────────────────
function NotesTab({ scopeKelas }: { scopeKelas: string | null }) {
  const [notes, setNotes] = useState<{id:string;user_name:string;content:string;created_at:string;kelas?:string}[]>([]);

  const fetchNotes = async () => {
    let query = supabase.from('sticky_notes').select('*').order('created_at',{ascending:false});
    if (scopeKelas) query = query.or(`kelas.eq.${scopeKelas},kelas.eq.general,kelas.eq.both`);
    const { data } = await query;
    if (data) setNotes(data as typeof notes);
  };

  useEffect(() => { fetchNotes(); }, [scopeKelas]);
  const deleteNote = async (id: string) => {
    try {
      await callAdminContent('DELETE', { resource: 'note', id });
      setNotes(n=>n.filter(x=>x.id!==id));
      toast.success('Dihapus');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus');
    }
  };
  return (
    <div>
      <h2 className="font-display text-cream text-xl font-bold mb-6">Quote Wall ({notes.length})</h2>
      <div className="space-y-3 max-w-2xl">
        {notes.length === 0 && <p className="text-cream/30 text-sm">Belum ada pesan.</p>}
        {notes.map(note => (
          <div key={note.id} className="card-dark p-4 flex items-start gap-3">
            <div className="flex-1">
              <div className="text-gold text-xs font-heading mb-1">{note.user_name}</div>
              <p className="text-cream/70 text-sm font-body">{note.content}</p>
              <p className="text-cream/30 text-[10px] mt-1">{new Date(note.created_at).toLocaleString('id-ID')}</p>
            </div>
            <button onClick={()=>deleteNote(note.id)} className="admin-btn admin-btn-danger text-[10px] py-1 px-2">Hapus</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PLAYLIST TAB ──────────────────────
import { motion, AnimatePresence } from 'framer-motion';

function PlaylistTab({ scopeKelas }: { scopeKelas: string | null }) {
  const [tracks, setTracks] = useState<{ id: string; title: string; artist: string; url: string; order_num: number; kelas?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);

  const fetchTracks = async (background = false) => {
    if (!background) setLoading(true);
    const { data } = await supabase.from('playlist').select('*').order('order_num', { ascending: true });
    if (data) setTracks(data as any[]);
    setLoading(false);
  };

  useEffect(() => { fetchTracks(); }, [scopeKelas]);

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Hapus lagu ini? File audio juga akan dihapus dari storage.')) return;
    try {
      await callAdminContent('DELETE', { resource: 'playlist', id });
      if (url) await deleteFileFromStorage(url);
      setTracks(t => t.filter(x => x.id !== id));
      toast.success('Dihapus');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tracks.length) return;

    const newTracks = [...tracks];
    const temp = newTracks[index].order_num;
    newTracks[index].order_num = newTracks[newIndex].order_num;
    newTracks[newIndex].order_num = temp;

    // Swap positions for UI feel
    const item = newTracks.splice(index, 1)[0];
    newTracks.splice(newIndex, 0, item);
    setTracks(newTracks);

    try {
      await Promise.all([
        supabase.from('playlist').update({ order_num: newTracks[index].order_num }).eq('id', newTracks[index].id),
        supabase.from('playlist').update({ order_num: newTracks[newIndex].order_num }).eq('id', newTracks[newIndex].id)
      ]);
    } catch (err) {
      toast.error('Gagal merubah urutan');
      fetchTracks(true);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-cream text-xl font-bold">Playlist Musik</h2>
          <p className="text-cream/40 text-xs font-body">Atur urutan lagu untuk player utama</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)} 
          className="admin-btn admin-btn-primary text-xs btn-press-active"
        >
          + Tambah Lagu
        </button>
      </div>

      <div className="max-w-2xl">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : tracks.length === 0 ? (
          <div className="card-dark p-8 text-center text-cream/30 border-dashed border-white/10">
            <p>Belum ada lagu di playlist.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {tracks.map((t, i) => (
                <motion.div 
                  key={t.id} 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    layout: { duration: 0.4 }
                  }}
                  className="card-dark p-3 flex items-center gap-4 group hover:border-gold/30 transition-all relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/[0.02] transition-colors pointer-events-none" />

                  <div className="flex flex-col gap-1.5 shrink-0 z-10">
                    <button 
                      onClick={() => handleMove(i, 'up')} 
                      disabled={i === 0}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-cream/20 hover:text-gold hover:bg-gold/20 hover:scale-110 disabled:opacity-0 transition-all btn-press-active border border-white/5 hover:border-gold/30"
                      title="Pindahkan ke atas"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleMove(i, 'down')} 
                      disabled={i === tracks.length - 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-cream/20 hover:text-gold hover:bg-gold/20 hover:scale-110 disabled:opacity-0 transition-all btn-press-active border border-white/5 hover:border-gold/30"
                      title="Pindahkan ke bawah"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-gold border border-white/5 group-hover:border-gold/30 group-hover:bg-gold/10 transition-all shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0 z-10">
                    <div className="text-cream text-sm font-display font-bold truncate group-hover:text-gold transition-colors">{t.title}</div>
                    <div className="text-cream/40 text-[9px] uppercase tracking-[0.2em] font-heading mt-0.5">{t.artist}</div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 z-10">
                    <button 
                      onClick={() => setEditingTrack(t)}
                      className="p-2.5 rounded-xl bg-white/5 text-cream/40 hover:text-cream hover:bg-white/10 transition-all btn-press-active border border-white/5"
                      title="Edit Nama/Artis"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id, t.url)}
                      className="p-2.5 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all btn-press-active border border-red-500/10"
                      title="Hapus Lagu"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {showAdd && (
        <AddMusicModal 
          scopeKelas={scopeKelas}
          nextOrder={tracks.length + 1}
          onClose={() => setShowAdd(false)}
          onSave={() => { setShowAdd(false); fetchTracks(true); }}
        />
      )}

      {editingTrack && (
        <EditMusicModal 
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
          onSave={() => { setEditingTrack(null); fetchTracks(true); }}
        />
      )}
    </div>
  );
}

function AddMusicModal({ scopeKelas, nextOrder, onClose, onSave }: { scopeKelas: string | null; nextOrder: number; onClose: () => void; onSave: () => void }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = (shouldRefresh = false) => {
    setIsClosing(true);
    setTimeout(() => {
      if (shouldRefresh) onSave();
      else onClose();
    }, 300);
  };

  const handleAdd = async () => {
    if (!title) { toast.error('Isi judul!'); return; }
    if (!audioFile) { toast.error('Pilih file audio!'); return; }
    setUploading(true);
    try {
      const url = await uploadPhoto(audioFile, `playlist/${Date.now()}_${audioFile.name}`);
      await callAdminContent('POST', {
        resource: 'playlist',
        data: {
          title,
          artist: artist || 'Angkatan 26',
          url,
          kelas: scopeKelas ?? 'all',
          order_num: nextOrder,
        },
      });
      toast.success('Lagu ditambahkan!');
      handleClose(true);
    } catch (err: any) { toast.error('Gagal: ' + (err?.message || 'Cek storage bucket')); }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out-fast' : 'animate-fade-in-fast'}`} onClick={() => handleClose()} />
      <div className={`relative w-full max-w-md bg-[#1a1a1a] border border-gold/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isClosing ? 'animate-premium-exit' : 'animate-premium-zoom'}`}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-display text-cream text-base font-bold">Tambah Musik</h3>
            <p className="text-[7px] text-gold/60 uppercase tracking-[0.3em] font-heading mt-0.5">Background Player</p>
          </div>
          <button onClick={() => handleClose()} className="text-cream/30 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Judul Lagu</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Misal: Laskar Pelangi" className="admin-input text-xs py-2" />
          </div>
          <div>
            <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Nama Artis</label>
            <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Misal: Nidji" className="admin-input text-xs py-2" />
          </div>
          <div>
            <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">File Audio</label>
            <label className="flex flex-col items-center py-6 border-2 border-dashed border-gold/10 hover:border-gold/30 rounded-xl cursor-pointer transition-all bg-white/[0.02] btn-press-active">
              <svg className="w-8 h-8 text-gold/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
              <span className="text-cream/50 text-[10px] font-heading">{audioFile ? audioFile.name : 'PILIH FILE MP3/WAV'}</span>
              <input type="file" accept="audio/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setAudioFile(e.target.files[0]); }} />
            </label>
          </div>
        </div>
        <div className="p-5 pt-0">
          <button onClick={handleAdd} disabled={uploading} className={`admin-btn admin-btn-primary w-full py-2.5 justify-center btn-press-active ${uploading ? 'btn-loading-shimmer' : ''}`}>
            {uploading ? 'UPLOADING...' : 'TAMBAH KE PLAYLIST'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditMusicModal({ track, onClose, onSave }: { track: any; onClose: () => void; onSave: () => void }) {
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = (shouldRefresh = false) => {
    setIsClosing(true);
    setTimeout(() => {
      if (shouldRefresh) onSave();
      else onClose();
    }, 300);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await callAdminContent('PATCH', { resource: 'playlist', id: track.id, updates: { title, artist } });
      toast.success('Lagu diperbarui!');
      handleClose(true);
    } catch (err: any) { toast.error('Gagal: ' + err.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out-fast' : 'animate-fade-in-fast'}`} onClick={() => handleClose()} />
      <div className={`relative w-full max-w-md bg-[#1a1a1a] border border-gold/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isClosing ? 'animate-premium-exit' : 'animate-premium-zoom'}`}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-display text-cream text-base font-bold">Edit Musik</h3>
          <button onClick={() => handleClose()} className="text-cream/30 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Judul Lagu</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="admin-input text-xs py-2" />
          </div>
          <div>
            <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Nama Artis</label>
            <input value={artist} onChange={e => setArtist(e.target.value)} className="admin-input text-xs py-2" />
          </div>
        </div>
        <div className="p-5 pt-0">
          <button onClick={handleSave} disabled={saving} className={`admin-btn admin-btn-primary w-full py-2.5 justify-center btn-press-active ${saving ? 'btn-loading-shimmer' : ''}`}>
            {saving ? 'SAVING...' : 'SIMPAN PERUBAHAN'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS TAB ──────────────────────
function SettingsTab() {
  const [neutrinoBg, setNeutrinoBg] = useState('');
  const [allAxeBg, setAllAxeBg] = useState('');
  const [ogBg, setOgBg] = useState('');
  const [saving, setSaving] = useState<string|null>(null);

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({data}) => {
      if(data) data.forEach((s:{key:string;value:string}) => {
        if(s.key==='neutrino_bg_url') setNeutrinoBg(s.value||'');
        if(s.key==='allaxe_bg_url') setAllAxeBg(s.value||'');
        if(s.key==='og_image_url') setOgBg(s.value||'');
      });
    });
  }, []);

  const handleUploadBg = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    setSaving(key);
    try {
      const oldUrl = key === 'neutrino_bg_url' ? neutrinoBg : key === 'allaxe_bg_url' ? allAxeBg : ogBg;
      const url = await uploadImage(file, `settings/${key}_${Date.now()}.webp`);
      const { error } = await supabase.from('site_settings').upsert({key, value:url, updated_at:new Date().toISOString()}, { onConflict: 'key' });
      if (error) throw error;
      if (oldUrl) await deleteFileFromStorage(oldUrl);
      if(key==='neutrino_bg_url') setNeutrinoBg(url);
      if(key==='allaxe_bg_url') setAllAxeBg(url);
      if(key==='og_image_url') setOgBg(url);
      toast.success('Pengaturan diupdate (WebP optimized)!');
    } catch (err: any) { toast.error('Gagal: ' + (err?.message || '')); }
    setSaving(null);
  };

  const handleResetBg = async (key: string, oldUrl: string) => {
    if (!confirm('Reset background ke default? Foto yang diupload akan dihapus dari pengaturan.')) return;
    setSaving(key + '_reset');
    try {
      const { error } = await supabase.from('site_settings').upsert({key, value:'', updated_at:new Date().toISOString()}, { onConflict: 'key' });
      if (error) throw error;
      if (oldUrl) await deleteFileFromStorage(oldUrl);
      if(key==='neutrino_bg_url') setNeutrinoBg('');
      if(key==='allaxe_bg_url') setAllAxeBg('');
      if(key==='og_image_url') setOgBg('');
      toast.success('Pengaturan direset ke default!');
    } catch (err: any) { toast.error('Gagal reset: ' + (err?.message || '')); }
    setSaving(null);
  };

  return (
    <div>
      <h2 className="font-display text-cream text-xl font-bold mb-2">Pengaturan</h2>
      <p className="text-cream/40 text-xs font-body mb-8">Kelola tampilan halaman utama</p>
      <div className="space-y-6 max-w-lg">
        {/* Neutrino BG */}
        <div className="card-dark p-6">
          <h3 className="text-cream text-sm font-display font-bold mb-1">Background Neutrino</h3>
          <p className="text-cream/40 text-xs mb-4">Foto latar di panel Neutrino (halaman beranda). Foto akan ditampilkan dengan opacity rendah + efek fade agar teks tetap terbaca.</p>
          {neutrinoBg ? (
            <div className="relative mb-3">
              <img src={neutrinoBg} className="w-full h-32 object-cover rounded-lg border border-gold/20" style={{opacity:0.6}} />
              <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark/50 to-charcoal-dark/80 rounded-lg" />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleResetBg('neutrino_bg_url', neutrinoBg)}
                  disabled={saving === 'neutrino_bg_url_reset'}
                  className="admin-btn admin-btn-danger text-[10px] py-1 px-2"
                >
                  🗑 Reset ke Default
                </button>
              </div>
              <p className="absolute bottom-2 left-3 text-cream/60 text-[10px]">Preview (dengan efek fade)</p>
            </div>
          ) : (
            <div className="h-24 rounded-lg border-2 border-dashed border-gold/20 flex items-center justify-center mb-3">
              <span className="text-cream/30 text-xs">Menggunakan foto default</span>
            </div>
          )}
          <label className={`admin-btn admin-btn-ghost w-full py-2.5 justify-center cursor-pointer text-xs block text-center btn-press-active ${saving === 'neutrino_bg_url' ? 'btn-loading-shimmer opacity-50' : ''}`}>
            {saving === 'neutrino_bg_url' ? '⏳ Uploading...' : '📷 Upload Background Neutrino'}
            <input type="file" accept="image/*" className="hidden" onChange={e => handleUploadBg('neutrino_bg_url', e)} disabled={!!saving} />
          </label>
        </div>

        {/* OG Image Preview */}
        <div className="card-dark p-6">
          <h3 className="text-cream text-sm font-display font-bold mb-1">Foto Preview Web (Open Graph)</h3>
          <p className="text-cream/40 text-xs mb-4">Foto yang akan muncul saat link web ini dibagikan di WhatsApp, Telegram, atau Medsos lainnya.</p>
          {ogBg ? (
            <div className="relative mb-3">
              <img src={ogBg} className="w-full h-32 object-cover rounded-lg border border-gold/20" />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleResetBg('og_image_url', ogBg)}
                  disabled={saving === 'og_image_url_reset'}
                  className="admin-btn admin-btn-danger text-[10px] py-1 px-2"
                >
                  🗑 Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="h-24 rounded-lg border-2 border-dashed border-gold/20 flex items-center justify-center mb-3">
              <span className="text-cream/30 text-xs bg-charcoal-dark/50 px-3 py-1 rounded">Tidak ada foto kustom</span>
            </div>
          )}
          <label className={`admin-btn admin-btn-ghost w-full py-2.5 justify-center cursor-pointer text-xs block text-center btn-press-active ${saving === 'og_image_url' ? 'btn-loading-shimmer opacity-50' : ''}`}>
            {saving === 'og_image_url' ? '⏳ Uploading...' : '📷 Upload Foto Preview URL'}
            <input type="file" accept="image/*" className="hidden" onChange={e => handleUploadBg('og_image_url', e)} disabled={!!saving} />
          </label>
        </div>
      </div>
    </div>
  );
}

// ── USERS / ACCOUNTS TAB ──────────────
type UserRow = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in: string | null;
  role: 'root' | 'manager_ikhwa' | null;
  is_admin: boolean;
  is_owner?: boolean;
  is_hardcoded_root?: boolean;
  confirmed: boolean;
};

function UsersTab({ session }: { session: any }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  // Form state untuk user baru
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'root' | 'manager_ikhwa' | null>(null);
  const [creating, setCreating] = useState(false);

  const getToken = async (): Promise<string> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || session?.access_token || '';
  };

  const fetchUsers = async (background = false) => {
    if (!background) setLoading(true); 
    setError('');
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Gagal memuat'); setLoading(false); return; }
      setUsers(data.users || []);
    } catch { setError('Tidak bisa terhubung ke server'); }
    setLoading(false);
  };

  useEffect(() => {
    if (editingUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [editingUser]);

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!newEmail || !newPassword) { toast.error('Email dan password wajib'); return; }
    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: newEmail, password: newPassword, full_name: newName, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); setCreating(false); return; }
      toast.success(`Akun ${newEmail} berhasil dibuat!`);
      setNewEmail(''); setNewPassword(''); setNewName(''); setNewRole(null); setShowAdd(false);
      fetchUsers();
    } catch { toast.error('Gagal membuat akun'); }
    setCreating(false);
  };

  const handleDelete = async (user: UserRow) => {
    if (user.is_owner || user.is_hardcoded_root) {
      toast.error('Akun root utama tidak dapat dihapus.');
      return;
    }
    if (!confirm(`Hapus akun ${user.email}? Tindakan ini tidak bisa dibatalkan!`)) return;
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: user.id, email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Akun dihapus');
      fetchUsers();
    } catch { toast.error('Gagal menghapus akun'); }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-cream text-xl font-bold">Manajemen Akun</h2>
          <p className="text-cream/40 text-xs font-body">{users.length} akun terdaftar</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="admin-btn admin-btn-primary text-xs">+ Buat Akun Baru</button>
      </div>

      {error && (
        <div className="card-dark border border-red-500/30 p-5 mb-6 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-400 font-heading text-sm font-bold mb-1">Tidak bisa memuat akun</p>
              <p className="text-cream/50 text-xs">{error}</p>
            </div>
          </div>
          <button onClick={() => fetchUsers()} className="admin-btn admin-btn-ghost text-xs mt-4">🔄 Coba Lagi</button>
        </div>
      )}

      {showAdd && (
        <div className="card-dark p-6 mb-6 border-l-2 border-gold animate-in slide-in-from-top-2 duration-300">
          <h3 className="text-cream text-sm font-display font-bold mb-4">Buat Akun Baru</h3>
          <div className="space-y-3 max-w-md">
            <div>
              <label className="section-label text-[10px] block mb-1">Nama Lengkap</label>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nama santri / admin..." className="admin-input" />
            </div>
            <div>
              <label className="section-label text-[10px] block mb-1">Email</label>
              <input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="email@contoh.com" className="admin-input" />
            </div>
            <div>
              <label className="section-label text-[10px] block mb-1">Password</label>
              <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Min. 6 karakter" className="admin-input" />
            </div>
            <div>
              <label className="section-label text-[10px] block mb-1">Role</label>
              <select value={newRole ?? ''} onChange={e => setNewRole((e.target.value || null) as any)} className="admin-select">
                <option value="">Santri (tanpa akses admin)</option>
                <option value="manager_ikhwa">Manager (Ikhwa)</option>
                <option value="root">Admin Root</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="admin-btn admin-btn-ghost flex-1 py-2 justify-center text-xs btn-press-active">Batal</button>
              <button onClick={handleCreate} disabled={creating} className={`admin-btn admin-btn-primary flex-1 py-2 justify-center text-xs btn-press-active ${creating ? 'btn-loading-shimmer opacity-80' : ''}`}>
                {creating ? '⏳ Membuat...' : '+ Buat Akun'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <input 
        type="search"
        name="q_ref_v1"
        id="q_ref_v1"
        value={search} 
        onChange={e=>setSearch(e.target.value)} 
        placeholder="Cari email / nama..." 
        className="admin-input max-w-xs mb-4" 
        autoComplete="new-password"
        readOnly
        onFocus={(e) => e.target.removeAttribute('readonly')}
      />

      {/* Users Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </div>
      ) : (
        <div className="overflow-x-auto block w-full min-w-0 rounded-xl border border-gold/15 pr-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="admin-table w-full min-w-[900px]">
            <thead>
              <tr className="text-left">
                <th>Nama</th>
                <th>Email</th>
                <th>Aksi</th>
                <th>Status</th>
                <th>Login Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-cream/30 py-8">Tidak ada akun ditemukan</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gold/5 transition-colors group">
                  <td className="font-display font-bold text-sm text-cream/90">{u.full_name || '—'}</td>
                  <td className="text-xs font-body text-cream/50">{u.email}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingUser(u)}
                        className="p-2 rounded-lg bg-gold/10 text-gold hover:bg-gold hover:text-charcoal transition-all duration-300"
                        title="Edit User"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(u)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                        title="Hapus User"
                        disabled={u.is_owner || u.is_hardcoded_root}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {u.role === 'root' && <span className="admin-badge admin-badge-approved">👑 Root</span>}
                      {u.role === 'manager_ikhwa' && <span className="admin-badge admin-badge-approved">🧔 Manager Ikhwa</span>}
                      {!u.role && <span className="admin-badge" style={{background:'rgba(201,162,39,0.08)',color:'rgba(245,240,232,0.4)',border:'1px solid rgba(201,162,39,0.15)'}}>Santri</span>}
                      {u.is_owner && <span className="admin-badge admin-badge-approved">Root Utama</span>}
                    </div>
                  </td>
                  <td className="text-cream/30 text-[10px] font-mono uppercase">
                    {u.last_sign_in ? new Date(u.last_sign_in).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : 'Belum pernah'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={() => { setEditingUser(null); fetchUsers(true); }} 
        />
      )}
    </div>
  );
}

// ── EDIT USER MODAL ───────────────────
function EditUserModal({ user, onClose, onSave }: { user: UserRow; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    full_name: user.full_name || '',
    role: user.role || '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = (shouldRefresh = false) => {
    setIsClosing(true);
    setTimeout(() => {
      if (shouldRefresh) onSave();
      else onClose();
    }, 300);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || '';
      
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          email: user.email, 
          full_name: form.full_name, 
          role: form.role === '' ? null : form.role,
          password: form.password || undefined
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan perubahan');
      
      toast.success('Akun berhasil diperbarui!');
      handleClose(true); // Exit animation then refresh
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out-fast' : 'animate-fade-in-fast'}`} 
        onClick={() => handleClose()}
      />
      
      {/* Modal Card */}
      <div className={`relative w-full max-w-md bg-[#1a1a1a] border border-gold/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] ${isClosing ? 'animate-premium-exit' : 'animate-premium-zoom'}`}>
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gold/5 blur-[50px] rounded-full pointer-events-none" />
        
        {/* Header - More Compact */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/5 opacity-0 animate-fade-in-fast animate-stagger-1">
          <div className="">
            <h3 className="font-display text-cream text-base font-bold leading-tight">Pengaturan Akun</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-5 h-[1px] bg-gold/30" />
              <p className="text-[7px] text-gold/60 uppercase tracking-[0.3em] font-heading">Edit Profile</p>
            </div>
          </div>
          <button 
            onClick={() => handleClose()} 
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-cream/30 hover:text-white hover:bg-red-500/20 transition-all duration-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - More Compact */}
        <div className="relative flex-1 overflow-y-auto p-5 pt-4 custom-scrollbar">
          <div className="space-y-5">
            {/* User Info Card */}
            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 opacity-0 animate-fade-in-fast animate-stagger-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] text-cream/40 uppercase tracking-widest font-heading mb-0.5">Account Email</p>
                  <p className="text-cream font-body text-xs font-semibold truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Full Name Input */}
            <div className="opacity-0 animate-fade-in-fast animate-stagger-3">
              <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] pl-1 font-bold">Nama Lengkap</label>
              <div className="relative group">
                <input 
                  value={form.full_name} 
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} 
                  className="admin-input pl-9 focus:ring-1 focus:ring-gold/30 transition-all bg-white/[0.03] text-xs py-2"
                  placeholder="Nama santri..."
                  autoComplete="new-password" 
                  id="edit_full_name"
                  name="edit_full_name"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/20 group-focus-within:text-gold transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="opacity-0 animate-fade-in-fast animate-stagger-4">
              <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] pl-1 font-bold">Wewenang Akun</label>
              <div className="space-y-1.5">
                {[
                  { id: '', label: 'Santri', desc: 'Akses lihat konten', icon: '📖' },
                  { id: 'manager_ikhwa', label: 'Manager Ikhwa', desc: 'Data Neutrino', icon: '🧔' },
                  { id: 'root', label: 'Root Admin', desc: 'Akses penuh', icon: '👑' },
                ].map((roleOption) => {
                  const isSelected = form.role === roleOption.id;
                  const isLocked = (user.is_owner || user.is_hardcoded_root);
                  
                  if (isLocked && !isSelected) return null;

                  return (
                    <button
                      key={roleOption.id}
                      onClick={() => !isLocked && setForm(f => ({ ...f, role: roleOption.id as any }))}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-300 text-left relative ${
                        isSelected 
                          ? 'bg-gold/10 border-gold/40' 
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                      } ${isLocked ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${isSelected ? 'bg-gold/20' : 'bg-white/5'}`}>
                        {roleOption.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-bold font-heading tracking-wide ${isSelected ? 'text-gold' : 'text-cream/80'}`}>{roleOption.label}</p>
                        <p className="text-[8px] text-cream/40 font-body truncate">{roleOption.desc}</p>
                      </div>
                      {!isLocked && (
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-gold border-gold' : 'border-white/10'}`}>
                          {isSelected && (
                            <svg className="w-2 h-2 text-charcoal-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password Input */}
            <div className="pb-1 opacity-0 animate-fade-in-fast animate-stagger-5">
              <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] pl-1 font-bold">Keamanan</label>
              <div className="relative group">
                <input 
                  type="password"
                  value={form.password} 
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                  className="admin-input pl-9 focus:ring-1 focus:ring-gold/30 transition-all bg-white/[0.03] text-xs py-2"
                  placeholder="Password Baru (Opsional)"
                  autoComplete="new-password"
                  id="edit_password"
                  name="edit_password"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/20 group-focus-within:text-gold transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - More Compact */}
        <div className="relative p-5 pt-3 border-t border-white/5 bg-[#1a1a1a]/80 backdrop-blur-md opacity-0 animate-fade-in-fast animate-stagger-5">
          <div className="flex gap-2">
            <button 
              onClick={() => handleClose()} 
              className="flex-1 py-2.5 rounded-xl text-[9px] font-bold font-heading tracking-widest text-cream/40 hover:text-cream bg-white/5 border border-white/5 transition-all btn-press-active"
            >
              BATAL
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className={`flex-[1.5] py-2.5 rounded-xl text-[9px] font-bold font-heading tracking-widest bg-gradient-to-r from-gold-dark to-gold text-charcoal-dark shadow-lg shadow-gold/20 active:scale-95 transition-all disabled:opacity-50 btn-press-active ${saving ? 'btn-loading-shimmer opacity-80' : ''}`}
            >
              {saving ? 'SAVING...' : 'SIMPAN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TIMELINE TAB ────────────────────────
function TimelineTab() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditItem] = useState<TimelineItem | 'new' | null>(null);

  useEffect(() => { fetchTimeline(); }, []);

  const fetchTimeline = async () => {
    setLoading(true);
    const { data } = await supabase.from('timeline').select('*').order('created_at', { ascending: false });
    if (data) setItems(data as TimelineItem[]);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus event timeline ini?')) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch('/api/admin/timeline', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Dihapus');
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      toast.error('Gagal menghapus: ' + (err?.message || ''));
    }
  };

  const typeColors: Record<string, string> = {
    hafalan: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    lomba: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    event: 'text-green-400 bg-green-400/10 border-green-400/20',
    asrama: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    wisuda: 'text-gold bg-gold/10 border-gold/20'
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-cream text-xl font-bold">Timeline Perjalanan</h2>
          <p className="text-cream/40 text-xs font-body">{items.length} event terdaftar</p>
        </div>
        <button onClick={() => setEditItem('new')} className="admin-btn admin-btn-primary text-xs flex-shrink-0 btn-press-active">
          + Tambah Event
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl max-w-3xl" />)}
        </div>
      ) : (
        <div className="space-y-3 max-w-4xl">
          {items.map((item) => (
            <div key={item.id} className="card-dark p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 group hover:border-gold/30 transition-all">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-charcoal flex items-center justify-center text-2xl flex-shrink-0 border border-gold/10 group-hover:scale-110 transition-transform">
                  {item.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-gold font-mono text-[10px] uppercase tracking-wider">{item.date}</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full border font-bold tracking-widest uppercase ${typeColors[item.type] || typeColors.event}`}>{item.type}</span>
                    {item.kelas !== 'both' && (
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 uppercase tracking-widest">{item.kelas}</span>
                    )}
                  </div>
                  <h3 className="font-display text-cream font-bold leading-tight truncate">{item.judul}</h3>
                  <p className="text-cream/50 text-[11px] mt-1 line-clamp-1 group-hover:line-clamp-none transition-all duration-500">{item.deskripsi}</p>
                </div>
              </div>
              
              <div className="flex sm:flex-col gap-2 mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto border-t border-white/5 sm:border-0 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                <button onClick={() => setEditItem(item)} className="admin-btn admin-btn-ghost text-[10px] py-1.5 px-3 btn-press-active">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="admin-btn admin-btn-danger text-[10px] py-1.5 px-3 btn-press-active">Hapus</button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center p-12 border border-dashed border-gold/10 rounded-2xl bg-white/[0.01]">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cream/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-cream/30 text-sm font-heading tracking-widest uppercase">Belum ada jejak perjalanan</p>
            </div>
          )}
        </div>
      )}

      {editingItem && (
        <EditTimelineModal 
          item={editingItem === 'new' ? null : editingItem} 
          onClose={() => setEditItem(null)} 
          onSave={() => { setEditItem(null); fetchTimeline(); }} 
        />
      )}
    </div>
  );
}

function EditTimelineModal({ item, onClose, onSave }: { item: TimelineItem | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState<Omit<TimelineItem, 'id' | 'created_at'>>(
    item ? { ...item } : { date: '', judul: '', deskripsi: '', kelas: 'both', type: 'event', emoji: '📅' }
  );
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = (shouldRefresh = false) => {
    setIsClosing(true);
    setTimeout(() => {
      if (shouldRefresh) onSave();
      else onClose();
    }, 300);
  };

  const handleSave = async () => {
    if (!form.judul || !form.date || !form.deskripsi) {
      toast.error('Lengkapi data wajib!');
      return;
    }
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const method = item ? 'PATCH' : 'POST';
      const body = item ? { id: item.id, ...form } : form;
      
      const res = await fetch('/api/admin/timeline', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(item ? 'Update Berhasil!' : 'Event Ditambahkan!');
      handleClose(true);
    } catch (err: any) {
      toast.error('Gagal: ' + (err?.message || 'Error'));
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out-fast' : 'animate-fade-in-fast'}`} onClick={() => handleClose()} />
      <div className={`relative w-full max-w-lg bg-[#1a1a1a] border border-gold/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isClosing ? 'animate-premium-exit' : 'animate-premium-zoom'}`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-gold/5 to-transparent">
          <div>
            <h3 className="font-display text-cream text-base font-bold">{item ? 'Edit Perjalanan' : 'Tambah Jejak Baru'}</h3>
            <p className="text-[7px] text-gold/60 uppercase tracking-[0.3em] font-heading mt-0.5">Timeline Editor</p>
          </div>
          <button onClick={() => handleClose()} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-cream/30 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="opacity-0 animate-fade-in-fast animate-stagger-1">
              <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Judul Event</label>
              <input value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))} className="admin-input text-xs py-2" placeholder="Judul..." />
            </div>
            <div className="opacity-0 animate-fade-in-fast animate-stagger-2">
              <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Waktu (Bulan/Tahun)</label>
              <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="admin-input text-xs py-2 font-mono" placeholder="Mei 2024..." />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="opacity-0 animate-fade-in-fast animate-stagger-3">
              <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Emoji Ikon</label>
              <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} className="admin-input text-center text-xl bg-white/5 py-1.5" />
            </div>
            <div className="opacity-0 animate-fade-in-fast animate-stagger-4 md:col-span-2">
              <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Kategori</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className="admin-select text-xs py-2 capitalize">
                <option value="event">Event Umum</option>
                <option value="hafalan">Hafalan Quran</option>
                <option value="lomba">Perlombaan</option>
                <option value="asrama">Kegiatan Asrama</option>
                <option value="wisuda">Wisuda</option>
              </select>
            </div>
          </div>

          <div className="opacity-0 animate-fade-in-fast animate-stagger-5">
            <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Target Kelas</label>
            <div className="grid grid-cols-3 gap-2">
              {['both', 'neutrino'].map(k => (
                <button 
                  key={k} 
                  onClick={() => setForm(f => ({ ...f, kelas: k as any }))}
                  className={`py-2 rounded-xl text-[9px] font-bold border transition-all uppercase tracking-wider ${form.kelas === k ? 'bg-gold/10 border-gold/40 text-gold' : 'bg-white/5 border-white/5 text-cream/30 hover:bg-white/10'}`}
                >
                  {k === 'both' ? 'Semua' : k}
                </button>
              ))}
            </div>
          </div>

          <div className="opacity-0 animate-fade-in-fast animate-stagger-6">
            <label className="section-label text-[8px] block mb-1.5 uppercase tracking-[0.2em] font-bold">Deskripsi & Kenangan</label>
            <textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} rows={4} className="admin-input resize-none text-xs py-2 custom-scrollbar" placeholder="Ceritakan detail..." />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-3 border-t border-white/5 bg-[#1a1a1a]/80 backdrop-blur-md">
          <div className="flex gap-2">
            <button onClick={() => handleClose()} className="flex-1 py-2.5 rounded-xl text-[9px] font-bold font-heading tracking-widest text-cream/40 hover:text-cream bg-white/5 border border-white/5 transition-all btn-press-active">BATAL</button>
            <button onClick={handleSave} disabled={saving} className={`flex-[2] py-2.5 rounded-xl text-[9px] font-bold font-heading tracking-widest bg-gradient-to-r from-gold-dark to-gold text-charcoal-dark shadow-lg shadow-gold/20 active:scale-95 transition-all btn-press-active ${saving ? 'btn-loading-shimmer' : ''}`}>
              {saving ? 'SAVING...' : (item ? 'SIMPAN PERUBAHAN' : 'PUBLISH EVENT')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
