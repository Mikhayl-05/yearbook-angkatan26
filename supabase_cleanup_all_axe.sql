-- ============================================================
-- YEARBOOK ANGKATAN 26 — Supabase Cleanup Migration
-- Tujuan: Menghapus semua data All Axe (Akhwat) dari database
-- 
-- ⚠️  PERINGATAN: Script ini bersifat PERMANEN (TIDAK BISA DIBATALKAN)
-- Backup data Anda terlebih dahulu sebelum menjalankan script ini!
--
-- Cara menjalankan:
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Paste script ini
-- 3. Review setiap bagian sebelum dieksekusi
-- 4. Klik "Run" untuk mengeksekusi
-- ============================================================


-- ============================================================
-- STEP 1: PREVIEW — Lihat data yang akan dihapus (AMAN, hanya SELECT)
-- Jalankan bagian ini terlebih dahulu untuk memastikan data yang benar
-- ============================================================

-- Lihat santri All Axe
SELECT id, nama, kelas, jabatan FROM santri WHERE kelas = 'all-axe' ORDER BY nama;

-- Lihat guru All Axe  
SELECT id, nama, jabatan_guru, kelas FROM guru WHERE kelas = 'all-axe';

-- Lihat gallery All Axe
SELECT id, caption, category, kelas FROM gallery WHERE kelas = 'all-axe' OR category = 'all-axe';

-- Lihat gallery submissions All Axe
SELECT id, caption, kelas, status FROM gallery_submissions WHERE kelas = 'all-axe';

-- Lihat sticky notes All Axe
SELECT id, content, kelas FROM sticky_notes WHERE kelas = 'all-axe';

-- Lihat timeline All Axe
SELECT id, judul, kelas, date FROM timeline WHERE kelas = 'all-axe';

-- Lihat admin user dengan role manager_akhwat
SELECT id, email, role FROM admin_users WHERE role = 'manager_akhwat';

-- Lihat site settings All Axe background
SELECT key, value FROM site_settings WHERE key = 'allaxe_bg_url';


-- ============================================================
-- STEP 2: HAPUS DATA — Eksekusi satu per satu, cek dulu hasilnya
-- Uncomment (hapus --) untuk mengaktifkan setiap DELETE/UPDATE
-- ============================================================

-- 2a. Hapus santri All Axe
-- DELETE FROM santri WHERE kelas = 'all-axe';

-- 2b. Hapus guru All Axe
-- DELETE FROM guru WHERE kelas = 'all-axe';

-- 2c. Hapus foto gallery yang dikategorikan All Axe
-- DELETE FROM gallery WHERE kelas = 'all-axe' OR category = 'all-axe';

-- 2d. Hapus gallery submissions All Axe
-- DELETE FROM gallery_submissions WHERE kelas = 'all-axe';

-- 2e. Hapus sticky notes All Axe
-- DELETE FROM sticky_notes WHERE kelas = 'all-axe';

-- 2f. Hapus timeline events All Axe
-- DELETE FROM timeline WHERE kelas = 'all-axe';

-- 2g. Nonaktifkan (atau hapus) admin dengan role manager_akhwat
-- UPDATE admin_users SET role = NULL WHERE role = 'manager_akhwat';
-- Atau hapus permanen (gunakan dengan hati-hati):
-- DELETE FROM admin_users WHERE role = 'manager_akhwat';

-- 2h. Hapus background image setting All Axe
-- DELETE FROM site_settings WHERE key = 'allaxe_bg_url';


-- ============================================================
-- STEP 3: VERIFIKASI PASCA-HAPUS (jalankan setelah Step 2)
-- ============================================================

-- Verifikasi tidak ada sisa data All Axe
SELECT 'santri' as tabel, COUNT(*) as sisa FROM santri WHERE kelas = 'all-axe'
UNION ALL
SELECT 'guru', COUNT(*) FROM guru WHERE kelas = 'all-axe'
UNION ALL
SELECT 'gallery', COUNT(*) FROM gallery WHERE kelas = 'all-axe' OR category = 'all-axe'
UNION ALL
SELECT 'gallery_submissions', COUNT(*) FROM gallery_submissions WHERE kelas = 'all-axe'
UNION ALL
SELECT 'sticky_notes', COUNT(*) FROM sticky_notes WHERE kelas = 'all-axe'
UNION ALL
SELECT 'timeline', COUNT(*) FROM timeline WHERE kelas = 'all-axe'
UNION ALL
SELECT 'admin_users_akhwat', COUNT(*) FROM admin_users WHERE role = 'manager_akhwat';
-- Semua baris di atas harus menunjukkan COUNT = 0 jika berhasil


-- ============================================================
-- STEP 4 (OPSIONAL): Update RLS Policies
-- Pastikan Row Level Security sudah diaktifkan untuk semua tabel
-- ============================================================

-- Cek status RLS untuk semua tabel
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Aktifkan RLS jika belum (aman untuk dijalankan ulang)
ALTER TABLE IF EXISTS santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gallery_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS playlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS timeline ENABLE ROW LEVEL SECURITY;
