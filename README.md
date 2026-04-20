# 📚 Yearbook Angkatan 26 — Pondok Pesantren Wahdah Islamiyah

> Link sementara: https://yearbook-angkatan26-ilam5xv5r.vercel.app/

> **Digital Yearbook** untuk Angkatan ke-26 (XVI) PPWI — Neutrino (Ikhwa) & All Axe (Akhwat) · 2023–2026

---

## 🗂️ Struktur Folder

```
yearbook-angkatan26/
├── public/
│   ├── manifest.json         ← PWA manifest
│   ├── icons/                ← App icons (72–512px)
│   ├── audio/                ← File audio (soundboard & playlist)
│   └── images/               ← Foto grup kelas
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx    ← Navigasi + music toggle
│   │   │   └── MusicPlayer.tsx ← Player mengambang
│   │   ├── sections/
│   │   │   ├── KelasHeader.tsx ← Header halaman kelas
│   │   │   └── StudentCard.tsx ← Kartu santri (flip)
│   │   └── ui/
│   │       ├── GoldParticles.tsx ← Partikel dekoratif
│   │       └── CountdownTimer.tsx ← Hitung mundur wisuda
│   ├── context/
│   │   ├── AuthContext.tsx   ← Auth state (Supabase)
│   │   └── MusicContext.tsx  ← State musik global
│   ├── data/
│   │   └── students.ts       ← Data seluruh santri (39 orang)
│   ├── lib/
│   │   └── supabase.ts       ← Client & helper Supabase
│   ├── pages/
│   │   ├── index.tsx         ← Landing (split-screen)
│   │   ├── login.tsx         ← Halaman login
│   │   ├── gallery.tsx       ← Gallery foto
│   │   ├── timeline.tsx      ← Timeline perjalanan
│   │   ├── quotes.tsx        ← Sticky Notes Wall
│   │   ├── soundboard.tsx    ← Soundboard interaktif
│   │   ├── kelas/[id].tsx    ← Halaman kelas (Neutrino/All Axe)
│   │   └── admin/index.tsx   ← Admin dashboard
│   └── styles/
│       └── globals.css       ← Global CSS + design tokens
├── supabase-schema.sql       ← SQL untuk setup database
├── .env.example              ← Template environment variables
├── .github/workflows/deploy.yml ← CI/CD GitHub Actions
└── next.config.js            ← Next.js + PWA config
```

---

## 🚀 Panduan Setup (Step-by-Step)

### STEP 1 — Clone & Install

```bash
git clone https://github.com/USERNAME/yearbook-angkatan26.git
cd yearbook-angkatan26
npm install
```

### STEP 2 — Setup Supabase (GRATIS)

1. Daftar di [supabase.com](https://supabase.com) → **New Project**
2. Pilih region: **Southeast Asia (Singapore)**
3. Buka **SQL Editor** → paste isi file `supabase-schema.sql` → **Run**
4. Buka **Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### STEP 3 — Buat Admin User

Di Supabase Dashboard → **Authentication → Users → Invite User**:
- Email: `admin@yearbookangkatan26.com`
- User ini punya akses Admin Panel

### STEP 4 — Setup Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local dengan nilai dari Supabase
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### STEP 5 — Jalankan Lokal

```bash
npm run dev
# Buka http://localhost:3000
```

---

## 📦 Deploy ke GitHub Pages + Cloudflare

### A. Push ke GitHub

```bash
git init
git remote add origin https://github.com/USERNAME/yearbook-angkatan26.git
git add .
git commit -m "🎓 Yearbook Angkatan 26 — Initial Release"
git push -u origin main
```

### B. Setup GitHub Secrets

Di GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase kamu |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase |

### C. Aktifkan GitHub Pages

**Settings → Pages → Source: GitHub Actions** → Save

Setelah push ke `main`, GitHub Actions akan otomatis build & deploy!
URL default: `https://USERNAME.github.io/yearbook-angkatan26/`

### D. Custom Domain via Cloudflare (Opsional tapi keren!)

1. Beli domain murah (misal: `angkatan26.my.id` ~Rp30rb/tahun di Niagahoster)
2. Di Cloudflare → **Add Site** → arahkan nameserver domain ke Cloudflare
3. Di Cloudflare DNS → tambah record:
   ```
   Type: CNAME
   Name: @ (atau www)
   Target: USERNAME.github.io
   Proxy: ON (🟠)
   ```
4. Di GitHub repo → **Settings → Pages → Custom domain** → isi domain

---

## 🎨 Cara Upload Foto Santri

1. Login ke website sebagai Admin
2. Buka `/admin` → tab **Gallery** → upload foto
3. Atau upload langsung di **Supabase Storage → yearbook bucket**
4. Untuk foto profil santri: nama file `n-01.jpg`, `a-01.jpg` dll.
5. Update field `foto` di tabel `santri` dengan URL publik

---

## 🔊 Cara Tambah Audio

1. Letakkan file `.mp3` di folder `public/audio/`
2. Nama file sesuai yang didefinisikan di `soundboard.tsx` dan `MusicContext.tsx`
3. Atau upload ke Supabase Storage → update URL di Admin Playlist

---

## 📱 Install sebagai PWA

Di Chrome mobile (Android):
1. Buka website di browser
2. Tap menu (⋮) → **"Add to Home Screen"**
3. Konfirmasi → Ikon YB-A26 akan muncul di layar utama!

Di iOS Safari:
1. Tap tombol Share (□↑)
2. Pilih **"Add to Home Screen"**

---

## 🛠️ Teknologi yang Digunakan

| Tech | Kegunaan | Biaya |
|------|----------|-------|
| Next.js 14 | Framework React + Static Export | Gratis |
| Tailwind CSS | Styling | Gratis |
| Supabase | Database + Auth + Storage | Gratis (500MB) |
| GitHub Pages | Hosting | Gratis |
| Cloudflare | CDN + Custom Domain | Gratis |
| next-pwa | Progressive Web App | Gratis |

**Total biaya: Rp0 (kecuali domain opsional)**

---

## 📝 Catatan Pengembangan

### Menambah Fitur Photo Mosaic (Lanjutan)
Fitur mosaic dinamis (foto kecil membentuk logo) membutuhkan canvas manipulation.
Implementasi ada di `src/components/sections/PhotoMosaic.tsx` — aktifkan setelah foto santri tersedia.

### Watermark Otomatis
Watermark CSS sudah aktif via class `.watermarked` dan `.watermark-overlay`.
Untuk watermark yang lebih kuat, gunakan server-side image processing dengan Sharp.

---

## 💌 Kontribusi

Untuk menambah fitur atau melaporkan bug:
- Buat issue di GitHub
- Atau hubungi admin yearbook via WhatsApp group Angkatan 26

---

**SOMO LULUS! 🎓✨**
*Angkatan 26 · Neutrino & All Axe · Wahdah Islamiyah · 2023–2026*
