-- ================================================================
-- FIX DATABASE SCHEMA — Yearbook Angkatan 26
-- Jalankan ini di Supabase SQL Editor untuk memperbaiki error upload
-- ================================================================

-- ── 1. UPDATE GALLERY TABLE ──────────────────────────────────
-- Menambahkan kolom yang dibutuhkan untuk fitur gallery & artikel
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS article_text TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS submitted_by UUID;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS submitted_name TEXT DEFAULT 'Admin';

-- Pastikan kategori mencakup 'momen' agar tidak error constraint
ALTER TABLE gallery DROP CONSTRAINT IF EXISTS gallery_category_check;
ALTER TABLE gallery ADD CONSTRAINT gallery_category_check 
  CHECK (category IN ('moment','momen','rihlah','wisuda','keseharian','neutrino','all-axe'));

-- ── 2. UPDATE SANTRI TABLE ──────────────────────────────────
-- Menambahkan kolom link dan deskripsi jika belum ada
ALTER TABLE santri ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE santri ADD COLUMN IF NOT EXISTS deskripsi TEXT;

-- ── 3. REFRESH SCHEMA CACHE ──────────────────────────────────
-- Supabase terkadang butuh waktu untuk mendeteksi kolom baru.
-- Jika masih error setelah jalankan ini, coba tunggu 1-2 menit.
