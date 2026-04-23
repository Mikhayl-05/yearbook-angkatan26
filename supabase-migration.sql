<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
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
=======
-- ================================================================
-- MIGRATION — Yearbook Angkatan 26 (Fitur Baru)
-- Jalankan di Supabase SQL Editor
-- ================================================================

-- ── UPDATE SANTRI TABLE ─────────────────────────────────────
ALTER TABLE santri ADD COLUMN IF NOT EXISTS deskripsi TEXT;

-- ── SANTRI PHOTOS (multiple photos per santri) ──────────────
-- Drop if exists to handle type changes
DROP TABLE IF EXISTS santri_photos;

-- Recreate with correct type
CREATE TABLE santri_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  santri_id   TEXT NOT NULL,
  url         TEXT NOT NULL,
  order_num   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT santri_photos_santri_id_fkey FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
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
<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
-- Drop and recreate to ensure UUID type consistency
DROP TABLE IF EXISTS guru_photos;
DROP TABLE IF EXISTS guru;

CREATE TABLE guru (
=======
CREATE TABLE IF NOT EXISTS guru (
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-41113b7d/supabase-migration.sql
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
-- Drop if exists to handle type changes
DROP TABLE IF EXISTS guru_photos;

-- Recreate with correct type matching guru.id
CREATE TABLE guru_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guru_id     TEXT NOT NULL,
=======
CREATE TABLE guru_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guru_id     UUID NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-738de83a/supabase-migration.sql
=======
CREATE TABLE guru_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guru_id     UUID NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-738de83a/supabase-migration.sql
=======
CREATE TABLE guru_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guru_id     UUID NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-738de83a/supabase-migration.sql
=======
-- Fix: guru_id harus sama tipe dengan guru.id (UUID di database existing)
CREATE TABLE IF NOT EXISTS guru_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guru_id     UUID NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-41113b7d/supabase-migration.sql
  url         TEXT NOT NULL,
  order_num   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT guru_photos_guru_id_fkey FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE
);

<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
-- Seed guru data (using UUID)
INSERT INTO guru (nama, jabatan_guru, kelas) VALUES
  ('Ustadz Taufik Hidayat', 'Wali Kelas', 'neutrino'),
  ('Ustadzah Ratna Muhi', 'Wali Kelas', 'all-axe')
ON CONFLICT DO NOTHING;
=======
-- Seed guru data (gunakan UUID gen_random_uuid() untuk id)
INSERT INTO guru (nama, jabatan_guru, kelas) VALUES
  ('Ustadz Taufik Hidayat', 'Wali Kelas', 'neutrino'),
  ('Ustadzah Ratna Muhi', 'Wali Kelas', 'all-axe')
ON CONFLICT (id) DO NOTHING;
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-41113b7d/supabase-migration.sql

-- ── ADMIN USERS TABLE ────────────────────────────────────────
-- Menyimpan daftar email yang punya hak admin (selain hardcoded)
CREATE TABLE IF NOT EXISTS admin_users (
  email       TEXT PRIMARY KEY,
<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
  added_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if not exist (for existing tables)
<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS added_by TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'manager_ikhwa' CHECK (role IN ('root', 'manager_ikhwa', 'manager_akhwat'));

-- Seed initial admin (with role)
INSERT INTO admin_users (email, added_by, role) VALUES
  ('muhammadyusuflauma109@gmail.com', 'system', 'root'),
  ('admin@yearbookangkatan26.com', 'system', 'root')
ON CONFLICT (email) DO UPDATE SET added_by = EXCLUDED.added_by, role = EXCLUDED.role;
=======
-- Note: added_by type depends on existing database, skip if causes issues
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'manager_ikhwa' CHECK (role IN ('root', 'manager_ikhwa', 'manager_akhwat'));
-- Only add added_by if it doesn't exist (type will match whatever is default)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'added_by') THEN
    ALTER TABLE admin_users ADD COLUMN added_by TEXT;
  END IF;
END $$;

-- Seed initial admin (with role, NULL for added_by to avoid UUID type issues)
INSERT INTO admin_users (email, role) VALUES
  ('muhammadyusuflauma109@gmail.com', 'root'),
  ('admin@yearbookangkatan26.com', 'root')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-738de83a/supabase-migration.sql
=======
=======
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-41113b7d/supabase-migration.sql
  role        TEXT NOT NULL DEFAULT 'root',
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  added_by    TEXT
);

-- Enforce allowed roles (enum-like)
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('root', 'manager_ikhwa', 'manager_akhwat'));

-- Seed initial admin
INSERT INTO admin_users (email, added_by) VALUES
  ('muhammadyusuflauma109@gmail.com', 'system'),
  ('admin@yearbookangkatan26.com', 'system')
ON CONFLICT (email) DO NOTHING;
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-41113b7d/supabase-migration.sql

-- Ensure seeded accounts are root
UPDATE admin_users
SET role = 'root'
WHERE email IN ('muhammadyusuflauma109@gmail.com', 'admin@yearbookangkatan26.com');

-- Ensure seeded accounts are root
UPDATE admin_users
SET role = 'root'
WHERE email IN ('muhammadyusuflauma109@gmail.com', 'admin@yearbookangkatan26.com');

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
-- ROLE-BASED ADMIN SYSTEM MIGRATION
-- 3 Tier: root | manager_ikhwa | manager_akhwat
-- ================================================================

<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
<<<<<<< C:/Users/Mikhayl/OneDrive/Software Amat - Copy/yearbook-angkatan26/supabase-migration.sql
-- ── ADD ROLE COLUMN TO ADMIN_USERS ──────────────────────────
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'manager_ikhwa' CHECK (role IN ('root', 'manager_ikhwa', 'manager_akhwat'));

-- Update existing root admins to have 'root' role
UPDATE admin_users SET role = 'root' WHERE email IN ('admin@yearbookangkatan26.com', 'muhammadyusuflauma109@gmail.com');

=======
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-738de83a/supabase-migration.sql
=======
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-738de83a/supabase-migration.sql
-- ── UPDATE RLS POLICIES FOR ROLE-BASED ACCESS ────────────────

-- Santri: Managers can only access their respective kelas
DROP POLICY IF EXISTS "santri_admin_write" ON santri;
CREATE POLICY "santri_admin_write" ON santri FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email' AND role = 'root'
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'manager_ikhwa' 
      AND santri.kelas = 'neutrino'
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'manager_akhwat' 
      AND santri.kelas = 'all-axe'
    )
  );

-- Guru: Managers can only access their respective kelas
DROP POLICY IF EXISTS "guru_admin_write" ON guru;
CREATE POLICY "guru_admin_write" ON guru FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email' AND role = 'root'
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'manager_ikhwa' 
      AND guru.kelas = 'neutrino'
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'manager_akhwat' 
      AND guru.kelas = 'all-axe'
    )
  );

-- Gallery: Managers can only access their respective categories
DROP POLICY IF EXISTS "gallery_admin_write" ON gallery;
CREATE POLICY "gallery_admin_write" ON gallery FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email' AND role = 'root'
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'manager_ikhwa' 
      AND (gallery.category = 'neutrino' OR gallery.category IN ('momen', 'rihlah', 'wisuda', 'keseharian'))
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'manager_akhwat' 
      AND (gallery.category = 'all-axe' OR gallery.category IN ('momen', 'rihlah', 'wisuda', 'keseharian'))
    )
  );

-- Gallery Submissions: Managers can only approve/reject their respective kelas
DROP POLICY IF EXISTS "gallery_submissions_admin_write" ON gallery_submissions;
CREATE POLICY "gallery_submissions_admin_write" ON gallery_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email' AND role = 'root'
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'manager_ikhwa' 
      AND (gallery_submissions.kelas = 'neutrino' OR gallery_submissions.kelas = 'all')
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'manager_akhwat' 
      AND (gallery_submissions.kelas = 'all-axe' OR gallery_submissions.kelas = 'all')
    )
  );

-- Playlist: All admins/managers can manage
DROP POLICY IF EXISTS "playlist_admin_write" ON playlist;
CREATE POLICY "playlist_admin_write" ON playlist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Sticky Notes: All admins/managers can manage
DROP POLICY IF EXISTS "notes_admin_delete" ON sticky_notes;
CREATE POLICY "notes_admin_manage" ON sticky_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Timeline: Only Root Admin
DROP POLICY IF EXISTS "timeline_admin_write" ON timeline;
CREATE POLICY "timeline_admin_write" ON timeline FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email' AND role = 'root'
    )
  );

-- Site Settings: Only Root Admin  
DROP POLICY IF EXISTS "site_settings_admin_write" ON site_settings;
CREATE POLICY "site_settings_admin_write" ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email' AND role = 'root'
    )
  );

-- Admin Users: Only Root Admin can manage
DROP POLICY IF EXISTS "admin_users_manage" ON admin_users;
CREATE POLICY "admin_users_root_manage" ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email' AND role = 'root'
    )
  );

-- Enable RLS on admin_users table (previously disabled)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create select policy for all authenticated users to check their own role
CREATE POLICY "admin_users_self_read" ON admin_users FOR SELECT
  USING (email = auth.jwt() ->> 'email');

-- ================================================================
-- SELESAI!
-- Refresh Supabase Table Editor dan Storage untuk melihat hasilnya.
-- ================================================================
>>>>>>> C:/Users/Mikhayl/.windsurf/worktrees/yearbook-angkatan26/yearbook-angkatan26-738de83a/supabase-migration.sql
