# 🎓 Yearbook Angkatan 26 — Pondok Pesantren Wahdah Islamiyah

> Link Live: https://yearbook-26.vercel.app/
> 
> **Digital Yearbook** untuk Angkatan ke-26 (XVI) PPWI — Neutrino (Ikhwa) & All Axe (Akhwat) · 2023–2026

---

## ✨ Fitur Utama (Premium Edition)

*   **Premium Admin Dashboard**: Sistem manajemen data santri, guru, gallery, dan playlist dengan antarmuka modal berbasis glassmorphism yang mewah.
*   **Smart Playlist Reordering**: Pengaturan urutan lagu di playlist menggunakan sistem panah cerdas dengan animasi *sliding* yang halus (Framer Motion).
*   **Role-Based Access Control**: Manajemen akun bertingkat (Root Admin, Manager Ikhwa, Manager Akhwat) untuk keamanan data yang lebih baik.
*   **Full Responsive PWA**: Pengalaman "app-like" di perangkat mobile maupun desktop, dapat diinstal langsung ke home screen.
*   **Dynamic Timeline**: Jejak perjalanan angkatan yang dapat dikelola langsung dari panel admin.
*   **Interactive Sticky Notes**: Dinding kutipan (Quote Wall) interaktif bagi para santri.

---

## 🗂️ Struktur Folder Terbaru

```
yearbook-angkatan26/
├── src/
│   ├── components/
│   │   ├── layout/       ← Navbar & MusicPlayer premium
│   │   ├── sections/     ← Komponen utama (Mosaic, Flip Cards)
│   │   └── ui/           ← Elemen dekoratif & animasi
│   ├── context/
│   │   ├── AuthContext.tsx   ← Auth state & Role Management
│   │   └── MusicContext.tsx  ← Sinkronisasi playlist & playback
│   ├── lib/
│   │   ├── supabase.ts       ← Client Supabase
│   │   └── adminRoles.ts     ← Logika otorisasi admin
│   ├── pages/
│   │   ├── api/admin/        ← API Routes untuk manajemen konten aman
│   │   ├── admin/index.tsx   ← Dashboard Admin Premium
│   │   ├── index.tsx         ← Split-screen landing
│   │   └── [...]             ← Halaman fitur lainnya
│   └── styles/
│       └── globals.css       ← Design tokens & Premium Keyframes
├── supabase-migration.sql     ← Schema database utama
└── supabase-role-migration.sql ← Schema untuk sistem role admin
```

---

## 🚀 Panduan Setup Cepat

### 1. Persiapan Lingkungan
```bash
git clone https://github.com/Mikhayl-05/yearbook-angkatan26.git
cd yearbook-angkatan26
npm install
```

### 2. Konfigurasi Database (Supabase)
1. Jalankan `supabase-migration.sql` di SQL Editor Supabase.
2. Jalankan `supabase-role-migration.sql` untuk mengaktifkan sistem role admin.
3. Salin variabel environment ke `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

### 3. Menjalankan Dashboard
```bash
npm run dev
```

---

## 🛠️ Teknologi & Animasi

| Teknologi | Implementasi |
|-----------|--------------|
| **Next.js 14** | Core Framework & Serverless Functions |
| **Tailwind CSS** | Premium Glassmorphism & Responsive Design |
| **Framer Motion** | Advanced Modal Transitions & Layout Reordering |
| **Supabase** | Real-time DB, Auth, & Object Storage |
| **PWA** | Offline access & App Installation |

---

## 💎 Panduan Admin (Premium Features)

### Manajemen Playlist
Akses **Admin Dashboard > Playlist**. Gunakan tombol panah untuk mengatur urutan lagu. Perubahan urutan akan memicu animasi geser yang halus dan tersimpan otomatis ke database, yang kemudian akan merefleksikan urutan yang sama di Music Player utama.

### Manajemen Role Akun
Sebagai **Root Admin**, Anda dapat memberikan akses khusus:
- **Manager Ikhwa**: Mengelola data khusus santri Neutrino.
- **Manager Akhwat**: Mengelola data khusus santri All Axe.
- **Root Admin**: Akses penuh ke seluruh sistem.

---

## 💌 Kontribusi & Support

Angkatan 26 · Neutrino & All Axe · Pondok Pesantren Wahdah Islamiyah

**SOMO LULUS! 🎓✨**
*Build with pride by the Yearbook Team.*
