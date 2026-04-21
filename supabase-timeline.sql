-- ── TIMELINE TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timeline (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date        TEXT NOT NULL,            -- e.g. 'Juli 2023'
  judul       TEXT NOT NULL,
  deskripsi   TEXT NOT NULL,
  kelas       TEXT DEFAULT 'both' CHECK (kelas IN ('neutrino', 'all-axe', 'both')),
  type        TEXT DEFAULT 'event' CHECK (type IN ('hafalan', 'lomba', 'event', 'asrama', 'wisuda')),
  emoji       TEXT DEFAULT '📅',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timeline_read_all" ON timeline FOR SELECT USING (true);
CREATE POLICY "timeline_admin_write" ON timeline FOR ALL
  USING (auth.jwt() ->> 'email' = 'admin@yearbookangkatan26.com');

-- Seed initial data
INSERT INTO timeline (id, date, judul, deskripsi, kelas, type, emoji) VALUES
(uuid_generate_v4(), 'Juli 2023',     'Penerimaan Santri Baru',             'Hari pertama menginjakkan kaki di pesantren. Perkenalan dan adaptasi lingkungan asrama dimulai.',                  'both',     'event',   '🏫'),
(uuid_generate_v4(), 'Agustus 2023',  'MOS & Orientasi Pesantren',          'Masa orientasi santri baru. Pengenalan peraturan, kegiatan, dan budaya pesantren Wahdah Islamiyah.',            'both',     'event',   '📋'),
(uuid_generate_v4(), 'Oktober 2023',  'Hafalan Perdana — Juz 30',           'Santri mulai setoran hafalan Quran. Program tahfidz menjadi pilar utama pembelajaran.',                          'both',     'hafalan', '📖'),
(uuid_generate_v4(), 'Desember 2023', 'Lomba Antar Asrama',                 'Kompetisi pertama antar kelas. Semangat dan solidaritas angkatan mulai terbentuk.',                              'both',     'lomba',   '🏆'),
(uuid_generate_v4(), 'Januari 2024',  'Rihlah Perdana',                     'Perjalanan wisata edukatif pertama bersama angkatan. Momen tak terlupakan mempererat ikatan kelas.',            'both',     'asrama',  '🌴'),
(uuid_generate_v4(), 'Juli 2024',     'Naik Kelas 8 — Awal Babak Baru',    'Memasuki tahun kedua dengan semangat baru. Target hafalan ditingkatkan ke Juz 29.',                            'both',     'event',   '⬆️'),
(uuid_generate_v4(), 'September 2024','Lomba Tahfidz Tingkat Wilayah',      'Neutrino mengirim 3 santri ke lomba tahfidz. Prestasi membanggakan untuk angkatan.',                            'neutrino', 'lomba',   '🥇'),
(uuid_generate_v4(), 'Oktober 2024',  'Musabaqah Quran All Axe',            'All Axe meraih juara dalam musabaqah tilawatil Quran tingkat pesantren. Bangga!',                              'all-axe',  'lomba',   '🎖️'),
(uuid_generate_v4(), 'November 2024', 'Rihlah Ke-2 — Wisata Alam',         'Rihlah kedua ke destinasi alam. Foto bersama, permainan seru, dan kenangan manis.',                             'both',     'asrama',  '⛰️'),
(uuid_generate_v4(), 'Desember 2024', 'Malam Keakraban Angkatan',          'Event internal angkatan 26. Games, pertunjukan bakat, dan momen emosional kebersamaan.',                        'both',     'event',   '🌟'),
(uuid_generate_v4(), 'Juli 2025',     'Kelas 9 — Tahun Terakhir',          'Memasuki tahun final dengan perasaan campur aduk. Semangat lulus tapi berat meninggalkan kenangan.',           'both',     'event',   '⏳'),
(uuid_generate_v4(), 'Agustus 2025',  'Try Out Pertama',                   'Persiapan ujian akhir dimulai. Belajar lebih keras demi kelulusan dan masa depan.',                            'both',     'event',   '📝'),
(uuid_generate_v4(), 'Oktober 2025',  'Completions Hafalan Quran',         'Santri yang berhasil menyelesaikan target hafalan mendapat penghargaan khusus dari pesantren.',                 'both',     'hafalan', '✨'),
(uuid_generate_v4(), 'Februari 2026', 'Persiapan Wisuda — Foto Kenangan',  'Foto bersama resmi, pembuatan yearbook, dan berbagai kegiatan perpisahan mulai dipersiapkan.',                 'both',     'wisuda',  '📷'),
(uuid_generate_v4(), 'Juni 2026',     '🎓 WISUDA ANGKATAN 26',            'Hari yang ditunggu-tunggu. Selamat kepada seluruh santri Angkatan 26 — Neutrino & All Axe. SOMO LULUS!',       'both',     'wisuda',  '🎓')
ON CONFLICT DO NOTHING;
