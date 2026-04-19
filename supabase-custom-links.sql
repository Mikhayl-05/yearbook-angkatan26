-- ================================================================
-- MIGRATION — Custom Links untuk Santri & Guru
-- Jalankan di Supabase SQL Editor
-- ================================================================

-- Tambahkan kolom custom_links sebagai JSONB array
ALTER TABLE santri ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]';
ALTER TABLE guru ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]';

-- Contoh format data custom_links:
-- [
--   {"label": "Portfolio", "url": "https://mikhayl.my.id", "type": "link", "color": "gold"},
--   {"label": "WhatsApp", "url": "081234567890", "type": "phone", "color": "green"}
-- ]

-- ================================================================
-- SELESAI! Refresh Supabase Table Editor untuk melihat kolom baru.
-- ================================================================
