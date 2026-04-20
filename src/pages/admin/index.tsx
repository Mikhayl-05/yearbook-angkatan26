// src/pages/admin/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { supabase, uploadPhoto } from '@/lib/supabase';
import type { SantriDB, GalleryItem, GallerySubmission, GuruDB, CustomLink } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import { LINK_GRADIENT_PRESETS } from '@/components/sections/StudentCard';

type AdminTab = 'dashboard' | 'santri' | 'guru' | 'gallery' | 'submissions' | 'notes' | 'playlist' | 'settings' | 'users';

export default function AdminDashboard() {
  const { user, isAdmin, loading, session } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState({ santri: 0, photos: 0, notes: 0, tracks: 0, pending: 0 });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error('Akses ditolak!');
      router.replace('/login');
    }
  }, [user, isAdmin, loading]);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [s1, s2, s3, s4, s5] = await Promise.all([
        supabase.from('santri').select('id', { count: 'exact', head: true }),
        supabase.from('gallery').select('id', { count: 'exact', head: true }),
        supabase.from('sticky_notes').select('id', { count: 'exact', head: true }),
        supabase.from('playlist').select('id', { count: 'exact', head: true }),
        supabase.from('gallery_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
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
    { id: 'settings',    label: 'Pengaturan',   icon: '⚙️' },
    { id: 'users',       label: 'Akun',         icon: '🔐' },
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
        <main className="flex-1 lg:ml-64 px-3 sm:px-4 md:px-8 py-6 sm:py-8 pb-28 lg:pb-8">
          {tab === 'dashboard'   && <DashboardTab stats={stats} setTab={setTab} />}
          {tab === 'santri'      && <SantriTab />}
          {tab === 'guru'        && <GuruTab />}
          {tab === 'gallery'     && <GalleryTab />}
          {tab === 'submissions' && <SubmissionsTab onUpdate={fetchStats} />}
          {tab === 'notes'       && <NotesTab />}
          {tab === 'playlist'    && <PlaylistTab />}
          {tab === 'settings'    && <SettingsTab />}
          {tab === 'users'       && <UsersTab session={session} />}
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
function SantriTab() {
  const [santri, setSantri] = useState<SantriDB[]>([]);
  const [search, setSearch] = useState('');
  const [kelasFilter, setKelasFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<SantriDB | null>(null);
  const [addModal, setAddModal] = useState(false);

  useEffect(() => { fetchSantri(); }, []);

  const fetchSantri = async () => {
    setLoading(true);
    const { data } = await supabase.from('santri').select('*').order('nama', { ascending: true });
    if (data) setSantri(data as SantriDB[]);
    setLoading(false);
  };

  const filtered = santri.filter(s =>
    (kelasFilter === 'all' || s.kelas === kelasFilter) &&
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
        <select value={kelasFilter} onChange={e => setKelasFilter(e.target.value)} className="admin-select max-w-[160px]">
          <option value="all">Semua Kelas</option>
          <option value="neutrino">Neutrino</option>
          <option value="all-axe">All Axe</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gold/15">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th><th>Nama</th><th>Kelas</th><th>Jabatan</th><th>Foto</th><th>Aksi</th>
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
                <td className="font-display font-bold text-sm">{s.nama}</td>
                <td><span className={`admin-badge ${s.kelas === 'neutrino' ? 'admin-badge-approved' : 'admin-badge-pending'}`}>{s.kelas}</span></td>
                <td className="text-cream/50 text-xs capitalize">{s.jabatan || 'anggota'}</td>
                <td>{s.foto ? <div className="w-8 h-8 rounded-md overflow-hidden border border-gold/20"><img src={s.foto} className="w-full h-full object-cover" /></div> : <span className="text-cream/20 text-xs">—</span>}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => setEditModal(s)} className="admin-btn admin-btn-ghost text-[10px] py-1 px-2">Edit</button>
                    <button onClick={async () => { if(!confirm(`Hapus ${s.nama}?`)) return; await supabase.from('santri').delete().eq('id',s.id); fetchSantri(); toast.success('Dihapus'); }} className="admin-btn admin-btn-danger text-[10px] py-1 px-2">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editModal && <EditSantriModal santri={editModal} onClose={() => setEditModal(null)} onSave={() => { setEditModal(null); fetchSantri(); }} />}
      {addModal && <AddSantriModal onClose={() => setAddModal(false)} onSave={() => { setAddModal(false); fetchSantri(); }} />}
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
function EditSantriModal({ santri, onClose, onSave }: { santri: SantriDB; onClose: () => void; onSave: () => void }) {
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

  const handleSave = async () => {
    setSaving(true);
    const { id, created_at, updated_at, ...updates } = form;
    (updates as any).custom_links = customLinks;
    const { error } = await supabase.from('santri').update(updates).eq('id', santri.id);
    if (error) { toast.error('Gagal menyimpan: ' + error.message); setSaving(false); return; }
    toast.success('Data diperbarui!');
    setSaving(false);
    onSave();
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file, `santri/${santri.id}_${Date.now()}.${file.name.split('.').pop()}`);
      setForm(f => ({ ...f, foto: url }));
      toast.success('Foto diupload!');
    } catch (err: any) { toast.error('Gagal upload: ' + (err?.message || 'Unknown error')); }
    setUploading(false);
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Hapus foto santri? Foto akan direset ke default.')) return;
    setForm(f => ({ ...f, foto: '' }));
    toast.success('Foto dihapus, simpan untuk konfirmasi.');
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="font-display text-cream text-base sm:text-lg font-bold truncate pr-4">Edit: {santri.nama}</h3>
          <button onClick={onClose} className="text-cream/40 hover:text-cream text-xl flex-shrink-0">×</button>
        </div>
        <div className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto pr-1 sm:pr-2">
          <div>
            <label className="section-label text-[10px] block mb-2">Foto Utama</label>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {form.foto
                ? <img src={form.foto} className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-gold/20 flex-shrink-0" />
                : <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg skeleton flex-shrink-0 flex items-center justify-center text-cream/20 text-xs">No foto</div>
              }
              <div className="flex flex-col gap-2">
                <label className={`admin-btn admin-btn-ghost text-xs cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                  {uploading ? '⏳ Uploading...' : '📷 Ganti Foto'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
                </label>
                {form.foto && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    className="admin-btn admin-btn-danger text-[10px] py-1 px-2"
                  >
                    🗑 Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="section-label text-[10px] block mb-2">Nama</label>
            <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} className="admin-input" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="section-label text-[10px] block mb-2">Tempat Lahir</label>
              <input value={form.tempat_lahir} onChange={e => setForm(f => ({ ...f, tempat_lahir: e.target.value }))} className="admin-input" />
            </div>
            <div>
              <label className="section-label text-[10px] block mb-2">Tanggal Lahir</label>
              <input type="date" value={form.tanggal_lahir} onChange={e => setForm(f => ({ ...f, tanggal_lahir: e.target.value }))} className="admin-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label text-[10px] block mb-2">Jabatan</label>
              <select value={form.jabatan || 'anggota'} onChange={e => setForm(f => ({ ...f, jabatan: e.target.value }))} className="admin-select">
                <option value="anggota">Anggota</option>
                <option value="ketua">Ketua</option>
                <option value="sekretaris">Sekretaris</option>
                <option value="bendahara">Bendahara</option>
              </select>
            </div>
            <div>
              <label className="section-label text-[10px] block mb-2">Kelas</label>
              <select value={form.kelas} onChange={e => setForm(f => ({ ...f, kelas: e.target.value as any }))} className="admin-select">
                <option value="neutrino">Neutrino</option>
                <option value="all-axe">All Axe</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="section-label text-[10px] block mb-2">Instagram (tanpa @)</label>
              <input value={form.instagram || ''} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="username" className="admin-input" />
            </div>
            <div>
              <label className="section-label text-[10px] block mb-2">WhatsApp</label>
              <input value={form.wa || ''} onChange={e => setForm(f => ({ ...f, wa: e.target.value }))} placeholder="08xxx atau +62xxx" className="admin-input" />
            </div>
          </div>
          <CustomLinksEditor links={customLinks} onChange={setCustomLinks} />
          <div>
            <label className="section-label text-[10px] block mb-2">Quote</label>
            <textarea value={form.quote || ''} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} rows={2} className="admin-input resize-none" placeholder="Quote santri..." />
          </div>
          <div>
            <label className="section-label text-[10px] block mb-2">Deskripsi</label>
            <textarea value={(form as any).deskripsi || ''} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value } as any))} rows={3} className="admin-input resize-none" placeholder="Deskripsi tentang santri..." />
          </div>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-6">
          <button onClick={onClose} className="admin-btn admin-btn-ghost flex-1 py-2.5 justify-center">Batal</button>
          <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary flex-1 py-2.5 justify-center">{saving ? 'Menyimpan...' : '💾 Simpan'}</button>
        </div>
      </div>
    </div>
  );
}

// ── ADD SANTRI MODAL ──────────────────
function AddSantriModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ id: '', no: 0, nama: '', tempat_lahir: '', tanggal_lahir: '', kelas: 'neutrino' as const, jabatan: 'anggota', instagram: '', wa: '', quote: '', link: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.nama || !form.tempat_lahir || !form.tanggal_lahir) { toast.error('Isi data lengkap!'); return; }
    setSaving(true);
    const id = form.kelas === 'neutrino' ? `n-${String(form.no).padStart(2,'0')}` : `a-${String(form.no).padStart(2,'0')}`;
    const { error } = await supabase.from('santri').insert({ ...form, id });
    if (error) { toast.error('Gagal: ' + error.message); setSaving(false); return; }
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
            <div><label className="section-label text-[10px] block mb-2">No Absen (opsional)</label><input type="number" value={form.no||''} onChange={e => setForm(f=>({...f,no:Number(e.target.value)}))} className="admin-input" /></div>
            <div><label className="section-label text-[10px] block mb-2">Kelas</label><select value={form.kelas} onChange={e => setForm(f=>({...f,kelas:e.target.value as any}))} className="admin-select"><option value="neutrino">Neutrino</option><option value="all-axe">All Axe</option></select></div>
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
          <button onClick={onClose} className="admin-btn admin-btn-ghost flex-1 py-2.5 justify-center">Batal</button>
          <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary flex-1 py-2.5 justify-center">{saving ? 'Menyimpan...' : '+ Tambah'}</button>
        </div>
      </div>
    </div>
  );
}

// ── GURU TAB ──────────────────────────
function GuruTab() {
  const [guru, setGuru] = useState<GuruDB[]>([]);
  const [editModal, setEditModal] = useState<GuruDB|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGuru(); }, []);
  const fetchGuru = async () => { setLoading(true); const {data} = await supabase.from('guru').select('*'); if(data) setGuru(data as GuruDB[]); setLoading(false); };

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
            <button onClick={() => setEditModal(g)} className="admin-btn admin-btn-ghost text-xs">Edit</button>
          </div>
        ))}
      </div>
      {editModal && <EditGuruModal guru={editModal} onClose={() => setEditModal(null)} onSave={() => { setEditModal(null); fetchGuru(); }} />}
    </div>
  );
}

function EditGuruModal({ guru, onClose, onSave }: { guru: GuruDB; onClose: ()=>void; onSave: ()=>void }) {
  const [form, setForm] = useState({...guru});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const {id, created_at, updated_at, ...updates} = form;
    const { error } = await supabase.from('guru').update(updates).eq('id', guru.id);
    if (error) { toast.error('Gagal: ' + error.message); setSaving(false); return; }
    toast.success('Data guru diperbarui!'); setSaving(false); onSave();
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file, `guru/${guru.id}_${Date.now()}.${file.name.split('.').pop()}`);
      setForm(f=>({...f,foto:url})); toast.success('Foto diupload!');
    } catch (err: any) { toast.error('Gagal: ' + (err?.message || '')); }
    setUploading(false);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-cream text-lg font-bold">Edit: {guru.nama}</h3>
          <button onClick={onClose} className="text-cream/40 hover:text-cream text-xl">×</button>
        </div>
        <div className="space-y-3 sm:space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="flex items-center gap-3 sm:gap-4">
            {form.foto ? <img src={form.foto} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-gold/20" /> : <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full skeleton" />}
            <label className={`admin-btn admin-btn-ghost text-xs cursor-pointer ${uploading?'opacity-50':''}`}>{uploading?'Uploading...':'📷 Ganti Foto'}<input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} /></label>
          </div>
          <div><label className="section-label text-[10px] block mb-2">Nama</label><input value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))} className="admin-input" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="section-label text-[10px] block mb-2">Instagram</label><input value={form.instagram||''} onChange={e=>setForm(f=>({...f,instagram:e.target.value}))} className="admin-input" placeholder="username" /></div>
            <div><label className="section-label text-[10px] block mb-2">WhatsApp</label><input value={form.wa||''} onChange={e=>setForm(f=>({...f,wa:e.target.value}))} className="admin-input" placeholder="08xxx atau +62xxx" /></div>
          </div>
          <div><label className="section-label text-[10px] block mb-2">Deskripsi</label><textarea value={form.deskripsi||''} onChange={e=>setForm(f=>({...f,deskripsi:e.target.value}))} rows={3} className="admin-input resize-none" /></div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="admin-btn admin-btn-ghost flex-1 py-2.5 justify-center">Batal</button>
          <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary flex-1 py-2.5 justify-center">{saving?'Menyimpan...':'💾 Simpan'}</button>
        </div>
      </div>
    </div>
  );
}

// ── GALLERY TAB ───────────────────────
function GalleryTab() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { fetchGallery(); }, []);
  const fetchGallery = async () => { setLoading(true); const {data} = await supabase.from('gallery').select('*').order('created_at',{ascending:false}); if(data) setGallery(data as GalleryItem[]); setLoading(false); };

  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File|null>(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [article, setArticle] = useState('');
  const [category, setCategory] = useState('momen');
  const [kelas, setKelas] = useState('all');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if(!uploadFile){toast.error('Pilih foto!');return;}
    setUploading(true);
    try {
      const url = await uploadPhoto(uploadFile, `gallery/${Date.now()}.${uploadFile.name.split('.').pop()}`);
      const { error } = await supabase.from('gallery').insert({ url, caption, article_text:article||null, category, kelas, submitted_name:'Admin', submitted_by:user?.id });
      if (error) throw error;
      toast.success('Foto diupload!'); fetchGallery(); setShowUpload(false); setUploadFile(null); setUploadPreview(''); setCaption(''); setArticle('');
    } catch (err: any) { toast.error('Gagal upload: ' + (err?.message || 'Cek koneksi dan storage bucket')); }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Hapus foto ini?')) return;
    await supabase.from('gallery').delete().eq('id',id); setGallery(g=>g.filter(x=>x.id!==id)); toast.success('Dihapus');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-cream text-xl font-bold">Gallery ({gallery.length})</h2>
        <button onClick={()=>setShowUpload(!showUpload)} className="admin-btn admin-btn-primary text-xs">+ Upload Foto</button>
      </div>

      {showUpload && (
        <div className="card-dark p-6 mb-6">
          <div className="space-y-4">
            {uploadPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-gold/20 max-h-48"><img src={uploadPreview} className="w-full object-cover max-h-48" /><button onClick={()=>{setUploadFile(null);setUploadPreview('');}} className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">×</button></div>
            ) : (
              <label className="flex flex-col items-center py-8 border-2 border-dashed border-gold/20 rounded-lg cursor-pointer hover:border-gold/40"><span className="text-2xl mb-1">📷</span><span className="text-cream/40 text-xs">Pilih foto (max 50MB)</span><input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f){setUploadFile(f);const r=new FileReader();r.onload=()=>setUploadPreview(r.result as string);r.readAsDataURL(f);}}} /></label>
            )}
            <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..." className="admin-input" />
            <textarea value={article} onChange={e=>setArticle(e.target.value)} placeholder="Artikel / cerita (opsional)..." rows={3} className="admin-input resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={category} onChange={e=>setCategory(e.target.value)} className="admin-select"><option value="momen">Momen</option><option value="rihlah">Rihlah</option><option value="wisuda">Wisuda</option><option value="neutrino">Neutrino</option><option value="all-axe">All Axe</option><option value="keseharian">Keseharian</option></select>
              <select value={kelas} onChange={e=>setKelas(e.target.value)} className="admin-select"><option value="all">Semua</option><option value="neutrino">Neutrino</option><option value="all-axe">All Axe</option></select>
            </div>
            <button onClick={handleUpload} disabled={uploading} className="admin-btn admin-btn-primary w-full py-2.5 justify-center">{uploading?'⏳ Uploading...':'📸 Upload'}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {gallery.map(g => (
          <div key={g.id} className="relative group rounded-lg overflow-hidden border border-gold/10">
            <img src={g.url} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-charcoal-dark/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={()=>handleDelete(g.id)} className="admin-btn admin-btn-danger text-xs">🗑 Hapus</button>
            </div>
            <div className="p-2"><p className="text-cream/70 text-[10px] truncate">{g.caption||'—'}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SUBMISSIONS TAB ───────────────────
function SubmissionsTab({ onUpdate }: { onUpdate: () => void }) {
  const [subs, setSubs] = useState<GallerySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSubs(); }, []);
  const fetchSubs = async () => { setLoading(true); const {data} = await supabase.from('gallery_submissions').select('*').order('created_at',{ascending:false}); if(data) setSubs(data as GallerySubmission[]); setLoading(false); };

  const handleApprove = async (sub: GallerySubmission) => {
    try {
      await supabase.from('gallery').insert({ url:sub.url, caption:sub.caption, article_text:sub.article_text, category:sub.category, kelas:sub.kelas, submitted_by:sub.submitted_by, submitted_name:sub.submitted_name });
      await supabase.from('gallery_submissions').update({status:'approved'}).eq('id',sub.id);
      toast.success('Foto disetujui! ✅'); fetchSubs(); onUpdate();
    } catch { toast.error('Gagal'); }
  };

  const handleReject = async (id: string) => {
    await supabase.from('gallery_submissions').update({status:'rejected'}).eq('id',id);
    toast.success('Ditolak'); fetchSubs(); onUpdate();
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
                  <button onClick={() => handleApprove(sub)} className="admin-btn admin-btn-success text-xs">✅ Setujui</button>
                  <button onClick={() => handleReject(sub.id)} className="admin-btn admin-btn-danger text-xs">❌ Tolak</button>
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
function NotesTab() {
  const [notes, setNotes] = useState<{id:string;user_name:string;content:string;created_at:string}[]>([]);
  useEffect(() => { supabase.from('sticky_notes').select('*').order('created_at',{ascending:false}).then(({data})=>{if(data) setNotes(data as typeof notes);}); }, []);
  const deleteNote = async (id: string) => { await supabase.from('sticky_notes').delete().eq('id',id); setNotes(n=>n.filter(x=>x.id!==id)); toast.success('Dihapus'); };
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
function PlaylistTab() {
  const [tracks, setTracks] = useState<{id:string;title:string;artist:string;url:string}[]>([]);
  const [title, setTitle] = useState(''); const [artist, setArtist] = useState('');
  const [uploading, setUploading] = useState(false);
  const [audioFile, setAudioFile] = useState<File|null>(null);

  useEffect(() => { supabase.from('playlist').select('*').order('order_num').then(({data})=>{if(data) setTracks(data as typeof tracks);}); }, []);

  const handleAdd = async () => {
    if(!title) {toast.error('Isi judul!');return;}
    if(!audioFile) {toast.error('Pilih file audio!');return;}
    setUploading(true);
    try {
      const url = await uploadPhoto(audioFile, `playlist/${Date.now()}_${audioFile.name}`);
      const { error } = await supabase.from('playlist').insert({title, artist:artist||'Angkatan 26', url, order_num:tracks.length + 1});
      if (error) throw error;
      toast.success('Lagu ditambahkan!');
      const {data} = await supabase.from('playlist').select('*').order('order_num');
      if(data) setTracks(data as typeof tracks);
      setTitle(''); setArtist(''); setAudioFile(null);
    } catch (err: any) { toast.error('Gagal: ' + (err?.message || 'Cek storage bucket')); }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('playlist').delete().eq('id',id);
    setTracks(t=>t.filter(x=>x.id!==id)); toast.success('Dihapus');
  };

  return (
    <div>
      <h2 className="font-display text-cream text-xl font-bold mb-6">Playlist Musik</h2>
      <div className="card-dark p-6 max-w-lg mb-8">
        <h3 className="text-cream text-sm font-display font-bold mb-4">Tambah Lagu</h3>
        <div className="space-y-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Judul lagu..." className="admin-input" />
          <input value={artist} onChange={e=>setArtist(e.target.value)} placeholder="Artis..." className="admin-input" />
          <label className="admin-btn admin-btn-ghost w-full py-2.5 justify-center cursor-pointer text-xs block text-center">
            {audioFile ? `🎵 ${audioFile.name}` : '🎵 Pilih File Audio (MP3/WAV)'}
            <input type="file" accept="audio/*" className="hidden" onChange={e=>{if(e.target.files?.[0]) setAudioFile(e.target.files[0]);}} />
          </label>
          <button onClick={handleAdd} disabled={uploading} className="admin-btn admin-btn-primary w-full py-2.5 justify-center">{uploading?'⏳ Mengupload...':'+ Tambah Lagu'}</button>
        </div>
      </div>
      <div className="space-y-2 max-w-lg">
        {tracks.map((t,i) => (
          <div key={t.id} className="card-dark p-3 flex items-center gap-3">
            <span className="text-gold/40 text-xs font-mono w-6">{i+1}</span>
            <div className="flex-1">
              <div className="text-cream text-sm font-display font-bold">{t.title}</div>
              <div className="text-cream/40 text-[10px]">{t.artist}</div>
            </div>
            {t.url && <audio controls src={t.url} className="h-7 max-w-[120px]" />}
            <button onClick={()=>handleDelete(t.id)} className="admin-btn admin-btn-danger text-[10px] py-1 px-2">🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SETTINGS TAB ──────────────────────
function SettingsTab() {
  const [neutrinoBg, setNeutrinoBg] = useState('');
  const [allAxeBg, setAllAxeBg] = useState('');
  const [saving, setSaving] = useState<string|null>(null);

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({data}) => {
      if(data) data.forEach((s:{key:string;value:string}) => {
        if(s.key==='neutrino_bg_url') setNeutrinoBg(s.value||'');
        if(s.key==='allaxe_bg_url') setAllAxeBg(s.value||'');
      });
    });
  }, []);

  const handleUploadBg = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    setSaving(key);
    try {
      const url = await uploadPhoto(file, `settings/${key}_${Date.now()}.${file.name.split('.').pop()}`);
      const { error } = await supabase.from('site_settings').upsert({key, value:url, updated_at:new Date().toISOString()});
      if (error) throw error;
      if(key==='neutrino_bg_url') setNeutrinoBg(url);
      if(key==='allaxe_bg_url') setAllAxeBg(url);
      toast.success('Background diupdate!');
    } catch (err: any) { toast.error('Gagal: ' + (err?.message || '')); }
    setSaving(null);
  };

  const handleResetBg = async (key: string) => {
    if (!confirm('Reset background ke default? Foto yang diupload akan dihapus dari pengaturan.')) return;
    setSaving(key + '_reset');
    try {
      await supabase.from('site_settings').upsert({key, value:'', updated_at:new Date().toISOString()});
      if(key==='neutrino_bg_url') setNeutrinoBg('');
      if(key==='allaxe_bg_url') setAllAxeBg('');
      toast.success('Background direset ke default!');
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
                  onClick={() => handleResetBg('neutrino_bg_url')}
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
          <label className={`admin-btn admin-btn-ghost w-full py-2.5 justify-center cursor-pointer text-xs block text-center ${saving==='neutrino_bg_url'?'opacity-50':''}`}>
            {saving==='neutrino_bg_url'?'⏳ Uploading...':'📷 Upload Background Neutrino'}
            <input type="file" accept="image/*" className="hidden" onChange={e=>handleUploadBg('neutrino_bg_url',e)} disabled={!!saving} />
          </label>
        </div>

        {/* All Axe BG */}
        <div className="card-dark p-6">
          <h3 className="text-cream text-sm font-display font-bold mb-1">Background All Axe</h3>
          <p className="text-cream/40 text-xs mb-4">Foto latar di panel All Axe (halaman beranda). Foto akan ditampilkan dengan opacity rendah + efek fade.</p>
          {allAxeBg ? (
            <div className="relative mb-3">
              <img src={allAxeBg} className="w-full h-32 object-cover rounded-lg border border-gold/20" style={{opacity:0.6}} />
              <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark/50 to-charcoal-dark/80 rounded-lg" />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleResetBg('allaxe_bg_url')}
                  disabled={saving === 'allaxe_bg_url_reset'}
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
          <label className={`admin-btn admin-btn-ghost w-full py-2.5 justify-center cursor-pointer text-xs block text-center ${saving==='allaxe_bg_url'?'opacity-50':''}`}>
            {saving==='allaxe_bg_url'?'⏳ Uploading...':'📷 Upload Background All Axe'}
            <input type="file" accept="image/*" className="hidden" onChange={e=>handleUploadBg('allaxe_bg_url',e)} disabled={!!saving} />
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
  is_admin: boolean;
  confirmed: boolean;
};

function UsersTab({ session }: { session: any }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  // Form state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [creating, setCreating] = useState(false);

  const getToken = async (): Promise<string> => {
    // Refresh session jika perlu
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || session?.access_token || '';
  };

  const fetchUsers = async () => {
    setLoading(true); setError('');
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

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!newEmail || !newPassword) { toast.error('Email dan password wajib'); return; }
    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: newEmail, password: newPassword, full_name: newName, make_admin: makeAdmin }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); setCreating(false); return; }
      toast.success(`Akun ${newEmail} berhasil dibuat!`);
      setNewEmail(''); setNewPassword(''); setNewName(''); setMakeAdmin(false); setShowAdd(false);
      fetchUsers();
    } catch { toast.error('Gagal membuat akun'); }
    setCreating(false);
  };

  const handleToggleAdmin = async (user: UserRow) => {
    const action = user.is_admin ? 'Cabut akses admin' : 'Jadikan admin';
    if (!confirm(`${action} untuk ${user.email}?`)) return;
    const token = await getToken();
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: user.email, make_admin: !user.is_admin }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    toast.success(user.is_admin ? 'Akses admin dicabut' : 'Dijadikan admin ✅');
    fetchUsers();
  };

  const handleDelete = async (user: UserRow) => {
    if (!confirm(`Hapus akun ${user.email}? Tindakan ini tidak bisa dibatalkan!`)) return;
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
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-cream text-xl font-bold">Manajemen Akun</h2>
          <p className="text-cream/40 text-xs font-body">{users.length} akun terdaftar</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="admin-btn admin-btn-primary text-xs">+ Buat Akun Baru</button>
      </div>

      {/* Error state for missing service key */}
      {error && (
        <div className="card-dark border border-red-500/30 p-5 mb-6 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-400 font-heading text-sm font-bold mb-1">Tidak bisa memuat akun</p>
              <p className="text-cream/50 text-xs">{error}</p>
              {error.includes('SERVICE_ROLE') || error.includes('dikonfigurasi') ? (
                <div className="mt-3 p-3 bg-charcoal-dark rounded-lg border border-gold/20">
                  <p className="text-gold text-xs font-heading mb-1">Cara memperbaiki:</p>
                  <p className="text-cream/50 text-[11px]">1. Buka Supabase Dashboard → Project Settings → API</p>
                  <p className="text-cream/50 text-[11px]">2. Copy <strong className="text-gold">service_role key</strong></p>
                  <p className="text-cream/50 text-[11px]">3. Tambahkan ke <code className="text-gold">.env.local</code>:</p>
                  <code className="block text-[10px] bg-black/40 p-2 rounded mt-1 text-green-400">SUPABASE_SERVICE_ROLE_KEY=eyJ...</code>
                  <p className="text-cream/50 text-[11px] mt-1">4. Restart dev server</p>
                </div>
              ) : null}
            </div>
          </div>
          <button onClick={fetchUsers} className="admin-btn admin-btn-ghost text-xs mt-4">🔄 Coba Lagi</button>
        </div>
      )}

      {/* Create new user form */}
      {showAdd && (
        <div className="card-dark p-6 mb-6">
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
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-10 h-5 rounded-full transition-all relative ${makeAdmin ? 'bg-gold' : 'bg-charcoal-dark border border-gold/20'}`}
                onClick={() => setMakeAdmin(v => !v)}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-cream transition-all ${makeAdmin ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-cream/70 text-xs">Jadikan Admin</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="admin-btn admin-btn-ghost flex-1 py-2 justify-center text-xs">Batal</button>
              <button onClick={handleCreate} disabled={creating} className="admin-btn admin-btn-primary flex-1 py-2 justify-center text-xs">
                {creating ? '⏳ Membuat...' : '+ Buat Akun'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari email / nama..." className="admin-input max-w-xs mb-4" />

      {/* Users Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gold/15">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th><th>Nama</th><th>Status</th><th>Login Terakhir</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-cream/30 py-8">Tidak ada akun ditemukan</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="text-sm font-body text-cream/80 max-w-[180px] truncate">{u.email}</td>
                  <td className="text-xs text-cream/60">{u.full_name || '—'}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {u.is_admin && <span className="admin-badge admin-badge-approved">👑 Admin</span>}
                      {!u.is_admin && <span className="admin-badge" style={{background:'rgba(201,162,39,0.08)',color:'rgba(245,240,232,0.4)',border:'1px solid rgba(201,162,39,0.15)'}}>Santri</span>}
                      {!u.confirmed && <span className="admin-badge admin-badge-pending">Unverified</span>}
                    </div>
                  </td>
                  <td className="text-cream/30 text-xs">
                    {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString('id-ID') : 'Belum pernah'}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAdmin(u)}
                        className={`admin-btn text-[10px] py-1 px-2 ${u.is_admin ? 'admin-btn-danger' : 'admin-btn-success'}`}
                      >
                        {u.is_admin ? '👑 Cabut Admin' : '⭐ Jadikan Admin'}
                      </button>
                      <button onClick={() => handleDelete(u)} className="admin-btn admin-btn-danger text-[10px] py-1 px-2">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
