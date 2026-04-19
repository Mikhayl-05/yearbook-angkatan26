-- ================================================================
-- MIGRATION — Yearbook Angkatan 26 (Fitur Baru)
-- Jalankan di Supabase SQL Editor
-- ================================================================

-- ── UPDATE SANTRI TABLE ─────────────────────────────────────
ALTER TABLE santri ADD COLUMN IF NOT EXISTS deskripsi TEXT;

-- ── SANTRI PHOTOS (multiple photos per santri) ──────────────
CREATE TABLE IF NOT EXISTS santri_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  santri_id   TEXT NOT NULL REFERENCES santri(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  order_num   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── GALLERY SUBMISSIONS (pending approval) ──────────────────
CREATE TABLE IF NOT EXISTS gallery_submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url             TEXT NOT NULL,
  caption         TEXT,
  article_text    TEXT,
  category        TEXT DEFAULT 'momen',
  kelas           TEXT DEFAULT 'all',
  submitted_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_name  TEXT NOT NULL DEFAULT 'Anonim',
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── UPDATE GALLERY TABLE ────────────────────────────────────
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS article_text TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS submitted_by UUID;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS submitted_name TEXT DEFAULT 'Admin';

-- Drop and recreate category constraint to add new categories
ALTER TABLE gallery DROP CONSTRAINT IF EXISTS gallery_category_check;
ALTER TABLE gallery ADD CONSTRAINT gallery_category_check 
  CHECK (category IN ('momen','rihlah','wisuda','keseharian','neutrino','all-axe'));

-- ── SITE SETTINGS (key-value store) ─────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
  ('neutrino_bg_url', ''),
  ('allaxe_bg_url', '')
ON CONFLICT (key) DO NOTHING;

-- ── GURU / WALI KELAS TABLE ────────────────────────────────
CREATE TABLE IF NOT EXISTS guru (
  id            TEXT PRIMARY KEY,
  nama          TEXT NOT NULL,
  jabatan_guru  TEXT NOT NULL DEFAULT 'Wali Kelas',
  kelas         TEXT NOT NULL CHECK (kelas IN ('neutrino', 'all-axe')),
  foto          TEXT,
  deskripsi     TEXT,
  instagram     TEXT,
  wa            TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── GURU PHOTOS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guru_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guru_id     TEXT NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  order_num   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed guru data
INSERT INTO guru (id, nama, jabatan_guru, kelas) VALUES
  ('g-01', 'Ustadz Taufik Hidayat', 'Wali Kelas', 'neutrino'),
  ('g-02', 'Ustadzah Ratna Muhi', 'Wali Kelas', 'all-axe')
ON CONFLICT (id) DO NOTHING;

-- ── ADMIN USERS TABLE ────────────────────────────────────────
-- Menyimpan daftar email yang punya hak admin (selain hardcoded)
CREATE TABLE IF NOT EXISTS admin_users (
  email       TEXT PRIMARY KEY,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  added_by    TEXT
);

-- Seed initial admin
INSERT INTO admin_users (email, added_by) VALUES
  ('muhammadyusuflauma109@gmail.com', 'system'),
  ('admin@yearbookangkatan26.com', 'system')
ON CONFLICT (email) DO NOTHING;

-- ── DISABLE RLS FOR NEW TABLES (sesuai request user) ────────
ALTER TABLE santri_photos       DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings       DISABLE ROW LEVEL SECURITY;
ALTER TABLE guru                DISABLE ROW LEVEL SECURITY;
ALTER TABLE guru_photos         DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users         DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- STORAGE BUCKET SETUP
-- Membuat bucket 'yearbook' untuk menyimpan semua upload file
-- ================================================================

-- Buat bucket public 'yearbook'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'yearbook',
  'yearbook',
  true,
  52428800,  -- 50 MB max per file
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','audio/mpeg','audio/mp3','audio/wav','audio/ogg']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ── STORAGE POLICIES ────────────────────────────────────────
-- Hapus policy lama jika ada (biar tidak konflik)
DROP POLICY IF EXISTS "yearbook_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "yearbook_auth_upload"   ON storage.objects;
DROP POLICY IF EXISTS "yearbook_auth_update"   ON storage.objects;
DROP POLICY IF EXISTS "yearbook_auth_delete"   ON storage.objects;

-- Siapa saja bisa membaca (lihat foto publik)
CREATE POLICY "yearbook_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'yearbook');

-- User yang login bisa upload
CREATE POLICY "yearbook_auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'yearbook');

-- User yang login bisa update file miliknya
CREATE POLICY "yearbook_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'yearbook');

-- User yang login bisa hapus file
CREATE POLICY "yearbook_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'yearbook');

-- ================================================================
-- SELESAI!
-- Refresh Supabase Table Editor dan Storage untuk melihat hasilnya.
-- ================================================================
