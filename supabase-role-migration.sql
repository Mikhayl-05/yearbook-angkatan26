-- ================================================================
-- ROLE MIGRATION (3 Level Admin)
-- root | manager_ikhwa | manager_akhwat
-- ================================================================

-- 1) Role column + owner guard
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'manager_ikhwa'
  CHECK (role IN ('root', 'manager_ikhwa', 'manager_akhwat'));

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT false;

-- Root owner default (absolute account)
UPDATE admin_users
SET role = 'root', is_owner = true
WHERE email = 'admin@yearbookangkatan26.com';

-- Ensure other hardcoded root is still root
UPDATE admin_users
SET role = 'root'
WHERE email = 'muhammadyusuflauma109@gmail.com';

-- Playlist kelas segmentation
ALTER TABLE playlist
  ADD COLUMN IF NOT EXISTS kelas TEXT NOT NULL DEFAULT 'all'
  CHECK (kelas IN ('all', 'neutrino', 'all-axe'));

UPDATE playlist SET kelas = 'all' WHERE kelas IS NULL;

-- 2) Enable RLS for admin-managed tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;

-- Cleanup old policies
DROP POLICY IF EXISTS admin_users_self_read ON admin_users;
DROP POLICY IF EXISTS admin_users_root_manage ON admin_users;
DROP POLICY IF EXISTS santri_admin_write ON santri;
DROP POLICY IF EXISTS guru_admin_write ON guru;
DROP POLICY IF EXISTS gallery_admin_write ON gallery;
DROP POLICY IF EXISTS gallery_submissions_admin_write ON gallery_submissions;
DROP POLICY IF EXISTS notes_admin_manage ON sticky_notes;
DROP POLICY IF EXISTS playlist_admin_write ON playlist;
DROP POLICY IF EXISTS site_settings_admin_write ON site_settings;
DROP POLICY IF EXISTS timeline_admin_write ON timeline;

-- Helper expression pattern:
-- role lookup: EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND ...)

-- admin_users:
-- everyone can read own row; only root can manage all rows
CREATE POLICY admin_users_self_read ON admin_users
FOR SELECT
USING (email = auth.jwt() ->> 'email');

CREATE POLICY admin_users_root_manage ON admin_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.email = auth.jwt() ->> 'email'
      AND au.role = 'root'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.email = auth.jwt() ->> 'email'
      AND au.role = 'root'
  )
);

-- santri
CREATE POLICY santri_role_access ON santri
FOR ALL
USING (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND santri.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND santri.kelas = 'all-axe')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND santri.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND santri.kelas = 'all-axe')
);

-- guru/wali kelas
CREATE POLICY guru_role_access ON guru
FOR ALL
USING (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND guru.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND guru.kelas = 'all-axe')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND guru.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND guru.kelas = 'all-axe')
);

-- gallery
CREATE POLICY gallery_role_access ON gallery
FOR ALL
USING (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND gallery.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND gallery.kelas = 'all-axe')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND gallery.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND gallery.kelas = 'all-axe')
);

-- gallery submissions
CREATE POLICY gallery_submissions_role_access ON gallery_submissions
FOR ALL
USING (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND gallery_submissions.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND gallery_submissions.kelas = 'all-axe')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND gallery_submissions.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND gallery_submissions.kelas = 'all-axe')
);

-- quote wall
CREATE POLICY sticky_notes_role_access ON sticky_notes
FOR ALL
USING (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND sticky_notes.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND sticky_notes.kelas = 'all-axe')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND sticky_notes.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND sticky_notes.kelas = 'all-axe')
);

-- playlist
CREATE POLICY playlist_role_access ON playlist
FOR ALL
USING (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND playlist.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND playlist.kelas = 'all-axe')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_ikhwa' AND playlist.kelas = 'neutrino')
  OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'manager_akhwat' AND playlist.kelas = 'all-axe')
);

-- settings and timeline: root only
CREATE POLICY site_settings_root_only ON site_settings
FOR ALL
USING (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
);

CREATE POLICY timeline_root_only ON timeline
FOR ALL
USING (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users au WHERE au.email = auth.jwt() ->> 'email' AND au.role = 'root')
);
