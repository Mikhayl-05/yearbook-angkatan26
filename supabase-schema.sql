-- ================================================================
-- SUPABASE SCHEMA — Yearbook Angkatan 26
-- Jalankan di Supabase SQL Editor (supabase.com/dashboard)
-- ================================================================

-- ── ENABLE UUID EXTENSION ────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── SANTRI TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS santri (
  id            TEXT PRIMARY KEY,         -- e.g. 'n-01', 'a-01'
  no            INTEGER NOT NULL,
  nama          TEXT NOT NULL,
  tempat_lahir  TEXT NOT NULL,
  tanggal_lahir DATE NOT NULL,
  kelas         TEXT NOT NULL CHECK (kelas IN ('neutrino', 'all-axe')),
  jabatan       TEXT CHECK (jabatan IN ('ketua','sekretaris','bendahara','anggota')),
  instagram     TEXT,
  wa            TEXT,
  foto          TEXT,                     -- URL Supabase Storage
  quote         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── GALLERY TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url         TEXT NOT NULL,
  caption     TEXT,
  kelas       TEXT DEFAULT 'all',
  category    TEXT DEFAULT 'moment' CHECK (category IN ('moment','rihlah','wisuda','keseharian')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── STICKY NOTES TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS sticky_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name   TEXT NOT NULL,
  content     TEXT NOT NULL CHECK (char_length(content) <= 280),
  color       TEXT DEFAULT '#F9E4B7',
  rotation    FLOAT DEFAULT 0,
  kelas       TEXT DEFAULT 'general',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PLAYLIST TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  artist      TEXT DEFAULT 'Angkatan 26',
  url         TEXT NOT NULL,
  cover       TEXT,
  kelas       TEXT DEFAULT 'all',
  order_num   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────

-- Santri: bisa dibaca siapa saja, hanya admin yang bisa edit
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "santri_read_all" ON santri FOR SELECT USING (true);
CREATE POLICY "santri_admin_write" ON santri FOR ALL
  USING (auth.jwt() ->> 'email' = 'admin@yearbookangkatan26.com');

-- Gallery: bisa dibaca siapa saja
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_read_all" ON gallery FOR SELECT USING (true);
CREATE POLICY "gallery_admin_write" ON gallery FOR ALL
  USING (auth.jwt() ->> 'email' = 'admin@yearbookangkatan26.com');

-- Sticky Notes: semua bisa baca, login bisa tambah, owner bisa hapus
ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_read_all" ON sticky_notes FOR SELECT USING (true);
CREATE POLICY "notes_insert_auth" ON sticky_notes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "notes_delete_own" ON sticky_notes FOR DELETE
  USING (auth.uid() = user_id);
CREATE POLICY "notes_admin_delete" ON sticky_notes FOR DELETE
  USING (auth.jwt() ->> 'email' = 'admin@yearbookangkatan26.com');

-- Playlist: bisa dibaca siapa saja
ALTER TABLE playlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "playlist_read_all" ON playlist FOR SELECT USING (true);
CREATE POLICY "playlist_admin_write" ON playlist FOR ALL
  USING (auth.jwt() ->> 'email' = 'admin@yearbookangkatan26.com');

-- ── REALTIME ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE sticky_notes;

-- ── STORAGE BUCKET ───────────────────────────────────────────
-- Jalankan di Storage Settings atau via API:
-- Bucket name: 'yearbook'
-- Public: true
INSERT INTO storage.buckets (id, name, public)
VALUES ('yearbook', 'yearbook', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "yearbook_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'yearbook');
CREATE POLICY "yearbook_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'yearbook' AND
    auth.role() = 'authenticated'
  );

-- ── SEED DATA — SANTRI NEUTRINO ───────────────────────────────
INSERT INTO santri (id, no, nama, tempat_lahir, tanggal_lahir, kelas, jabatan) VALUES
('n-01', 1,  'ADHYAKSA ALIM',                     'GORONTALO',          '2011-12-12', 'neutrino', 'anggota'),
('n-02', 2,  'AGHA PAHVELI ULITOTO',               'GORONTALO',          '2011-04-08', 'neutrino', 'anggota'),
('n-03', 3,  'AL HAFIDZ SYAHREZA MAULANA HASAN',   'KAWANGKOAN',         '2011-03-13', 'neutrino', 'ketua'),
('n-04', 4,  'ATAYA ADYATMA FATIH RAMADHAN SIOLA', 'GORONTALO',          '2011-08-22', 'neutrino', 'anggota'),
('n-05', 5,  'ATHA DZAKI ALFATIH TAMRIN',           'GORONTALO',          '2010-10-05', 'neutrino', 'anggota'),
('n-06', 6,  'ATHALA RIZKI HAWANG',                 'LUWUK KAB. BANGGAI', '2010-09-15', 'neutrino', 'anggota'),
('n-07', 7,  'VITRA RAMADHAN PODUNGGE',             'GORONTALO',          '2011-06-08', 'neutrino', 'anggota'),
('n-08', 8,  'HAFIIDZ HADJI ALI',                   'KAB. GORONTALO',     '2011-04-19', 'neutrino', 'anggota'),
('n-09', 9,  'IBRAHIM ALVAJRY RAUW',                'MANADO',             '2011-12-22', 'neutrino', 'anggota'),
('n-10', 10, 'IFFAT IZZUDIN',                       'JAKARTA',            '2011-03-04', 'neutrino', 'anggota'),
('n-11', 11, 'ILHAM AQILA SOSILO',                  'GORONTALO',          '2011-07-09', 'neutrino', 'anggota'),
('n-12', 12, 'ISHAQ AL-ASTARI UMAR',                'GORONTALO',          '2010-07-22', 'neutrino', 'anggota'),
('n-13', 13, 'KHAIRUL AZAM Z. MONOARFA',            'GORONTALO',          '2011-05-15', 'neutrino', 'anggota'),
('n-14', 14, 'MAHDI HANIEF',                        'MAKASSAR',           '2010-10-04', 'neutrino', 'anggota'),
('n-15', 15, 'MOH. FARHAN PERMATA',                 'KOTAMOBAGU',         '2010-12-26', 'neutrino', 'anggota'),
('n-16', 16, 'MOH. FATHIR LAMATENGGO',              'KAB. GORONTALO',     '2010-10-19', 'neutrino', 'sekretaris'),
('n-17', 17, 'MOH. TEGUH ADITYA MA''RUF',           'KAB. GORONTALO',     '2011-04-16', 'neutrino', 'anggota'),
('n-18', 18, 'MOHAMAD RIZIQ DAUD',                  'BULONTALA',          '2012-03-17', 'neutrino', 'anggota'),
('n-19', 19, 'MOHAMAD RIZKI HUSAIN',                'GORONTALO',          '2011-10-09', 'neutrino', 'anggota'),
('n-20', 20, 'MU''ADZ DUENGO',                      'PAGUYAMAN',          '2010-10-30', 'neutrino', 'anggota'),
('n-21', 21, 'MUHAMMAD AL FARIS NUSI',              'GORONTALO',          '2011-06-25', 'neutrino', 'anggota'),
('n-22', 22, 'MUHAMMAD ILYAS',                      'MANADO',             '2010-11-14', 'neutrino', 'anggota'),
('n-23', 23, 'REYHAN RIZKY RAMADHAN',               'GORONTALO',          '2011-08-03', 'neutrino', 'anggota'),
('n-24', 24, 'THOLHAH BIN SUKARMAN HALIM',          'KAB. GORONTALO',     '2010-04-17', 'neutrino', 'anggota'),
('n-25', 25, 'ZAID ABDUR RAFI',                     'LUWUK',              '2010-02-01', 'neutrino', 'bendahara'),
('n-26', 26, 'ZULFAHRI SINGGILI',                   'KAB. GORONTALO',     '2010-12-08', 'neutrino', 'anggota'),
('n-27', 27, 'KAREL REZKY ART PAKAYA',              'GORONTALO',          '2011-10-31', 'neutrino', 'anggota'),
('n-28', 28, 'MUH ILHAM WIRATAMA',                  'LUWUK BANGGAI',      '2011-01-01', 'neutrino', 'anggota'),
('n-29', 29, 'CHAFFA MOODUTO',                      'GORONTALO',          '2011-01-01', 'neutrino', 'anggota')
ON CONFLICT (id) DO NOTHING;

-- ── SEED DATA — SANTRI ALL AXE ────────────────────────────────
INSERT INTO santri (id, no, nama, tempat_lahir, tanggal_lahir, kelas, jabatan) VALUES
('a-01', 1,  'AIN TAHIR',                          'KWANDANG',        '2010-08-03', 'all-axe', 'anggota'),
('a-02', 2,  'ALIFATUNNISAA LADIKU',               'GORONTALO',       '2011-09-27', 'all-axe', 'anggota'),
('a-03', 3,  'ALYA ISTIQOMAH AZZAHRA LALU',        'BULANGO SELATAN', '2011-01-01', 'all-axe', 'anggota'),
('a-04', 4,  'BALQIS ADIBA AZ''ZAHRA I. WARTABONE','GORONTALO',       '2010-11-22', 'all-axe', 'anggota'),
('a-05', 5,  'CHIYA FAUZIYAH SOFYAN',              'BUOL',            '2011-05-08', 'all-axe', 'anggota'),
('a-06', 6,  'FAKHIRAH HIKMAH RAMADHANI DUENGO',  'GORONTALO',       '2011-08-17', 'all-axe', 'anggota'),
('a-07', 7,  'MUTIA SALSABILA NOHO',               'GORONTALO',       '2011-05-09', 'all-axe', 'anggota'),
('a-08', 8,  'SHARIFA FUKAYNA URBI ASWAN',         'GORONTALO',       '2011-11-27', 'all-axe', 'anggota'),
('a-09', 9,  'WAFA AMATULLAH GANI',                'GORONTALO',       '2011-07-05', 'all-axe', 'anggota'),
('a-10', 10, 'ANAYA PUTRI KOIJO',                  'GORONTALO',       '2010-12-01', 'all-axe', 'anggota')
ON CONFLICT (id) DO NOTHING;

-- ── SEED PLAYLIST ─────────────────────────────────────────────
INSERT INTO playlist (title, artist, url, order_num) VALUES
('Hampir Lulus', 'Angkatan 26', '/audio/track1.mp3', 1),
('Kenangan Asrama', 'Neutrino & All Axe', '/audio/track2.mp3', 2),
('Somo Lulus!', 'Angkatan 26', '/audio/track3.mp3', 3)
ON CONFLICT DO NOTHING;

-- ================================================================
-- SELESAI. Refresh Supabase Table Editor untuk melihat data.
-- ================================================================
