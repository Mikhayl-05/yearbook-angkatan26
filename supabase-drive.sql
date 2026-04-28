-- ── DRIVE FOLDERS TABLE ─────────────────────────────────────────────────────
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS drive_folders (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL,
  description  TEXT,
  drive_url    TEXT        NOT NULL,
  color        TEXT        NOT NULL DEFAULT 'gold',
  kelas        TEXT        NOT NULL DEFAULT 'all',
  order_num    INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE drive_folders ENABLE ROW LEVEL SECURITY;

-- Public read (hanya bisa baca, tidak bisa write tanpa auth)
CREATE POLICY "drive_folders_public_read"
  ON drive_folders FOR SELECT
  USING (true);

-- Authenticated users dapat write (admin akan di-enforce di API layer)
CREATE POLICY "drive_folders_admin_write"
  ON drive_folders FOR ALL
  USING (auth.role() = 'authenticated');

-- Sample data (opsional — hapus jika tidak diperlukan)
INSERT INTO drive_folders (title, description, drive_url, color, kelas, order_num) VALUES
  ('Rihlah Pantai',   'Dokumentasi rihlah ke pantai',      'https://drive.google.com/drive/folders/example1', 'ocean',  'all', 1),
  ('Meeting Class',   'Rekap rapat dan pertemuan kelas',   'https://drive.google.com/drive/folders/example2', 'gold',   'all', 2),
  ('Wisuda 2026',     'Foto dan video wisuda angkatan 26', 'https://drive.google.com/drive/folders/example3', 'purple', 'all', 3);
