// src/data/students.ts
// ============================================================
// DATA SANTRI — Angkatan 26 (2023-2026)
// Sumber: kelas_9A.txt (Neutrino/Ikhwa) & kelas_9B.txt (All Axe/Akhwat)
// ============================================================

export type Santri = {
  id: string;
  no: number;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string; // ISO: YYYY-MM-DD
  instagram?: string;
  wa?: string;
  foto?: string;         // URL dari Supabase Storage
  quote?: string;
  kelas: 'neutrino' | 'all-axe';
  jabatan?: 'ketua' | 'sekretaris' | 'bendahara' | 'anggota';
};

export type KelasInfo = {
  id: 'neutrino' | 'all-axe';
  nama: string;
  label: string;         // Ikhwa / Akhwat
  waliKelas: string;
  totalSantri: number;
  angkatan: number;
  tahun: string;
  ketua: string;
  sekretaris?: string;
  bendahara?: string;
  warna: string;
  deskripsi: string;
};

// ─── NEUTRINO (9A — Ikhwa/Putra) ─────────────────────────────
export const neutrino: Santri[] = [
  { id: 'n-01', no: 1,  nama: 'ADHYAKSA ALIM',                     tempatLahir: 'GORONTALO',         tanggalLahir: '2011-12-12', kelas: 'neutrino' },
  { id: 'n-02', no: 2,  nama: 'AGHA PAHVELI ULITOTO',               tempatLahir: 'GORONTALO',         tanggalLahir: '2011-04-08', kelas: 'neutrino' },
  { id: 'n-03', no: 3,  nama: 'AL HAFIDZ SYAHREZA MAULANA HASAN',   tempatLahir: 'KAWANGKOAN',        tanggalLahir: '2011-03-13', kelas: 'neutrino', jabatan: 'ketua' },
  { id: 'n-04', no: 4,  nama: 'ATAYA ADYATMA FATIH RAMADHAN SIOLA', tempatLahir: 'GORONTALO',         tanggalLahir: '2011-08-22', kelas: 'neutrino' },
  { id: 'n-05', no: 5,  nama: 'ATHA DZAKI ALFATIH TAMRIN',          tempatLahir: 'GORONTALO',         tanggalLahir: '2010-10-05', kelas: 'neutrino' },
  { id: 'n-06', no: 6,  nama: 'ATHALA RIZKI HAWANG',                tempatLahir: 'LUWUK KAB. BANGGAI',tanggalLahir: '2010-09-15', kelas: 'neutrino' },
  { id: 'n-07', no: 7,  nama: 'VITRA RAMADHAN PODUNGGE',            tempatLahir: 'GORONTALO',         tanggalLahir: '2011-06-08', kelas: 'neutrino' },
  { id: 'n-08', no: 8,  nama: 'HAFIIDZ HADJI ALI',                  tempatLahir: 'KAB. GORONTALO',    tanggalLahir: '2011-04-19', kelas: 'neutrino' },
  { id: 'n-09', no: 9,  nama: 'IBRAHIM ALVAJRY RAUW',               tempatLahir: 'MANADO',            tanggalLahir: '2011-12-22', kelas: 'neutrino' },
  { id: 'n-10', no: 10, nama: 'IFFAT IZZUDIN',                      tempatLahir: 'JAKARTA',           tanggalLahir: '2011-03-04', kelas: 'neutrino' },
  { id: 'n-11', no: 11, nama: 'ILHAM AQILA SOSILO',                  tempatLahir: 'GORONTALO',         tanggalLahir: '2011-07-09', kelas: 'neutrino' },
  { id: 'n-12', no: 12, nama: 'ISHAQ AL-ASTARI UMAR',               tempatLahir: 'GORONTALO',         tanggalLahir: '2010-07-22', kelas: 'neutrino' },
  { id: 'n-13', no: 13, nama: 'KHAIRUL AZAM Z. MONOARFA',           tempatLahir: 'GORONTALO',         tanggalLahir: '2011-05-15', kelas: 'neutrino' },
  { id: 'n-14', no: 14, nama: 'MAHDI HANIEF',                       tempatLahir: 'MAKASSAR',          tanggalLahir: '2010-10-04', kelas: 'neutrino' },
  { id: 'n-15', no: 15, nama: 'MOH. FARHAN PERMATA',                tempatLahir: 'KOTAMOBAGU',        tanggalLahir: '2010-12-26', kelas: 'neutrino' },
  { id: 'n-16', no: 16, nama: 'MOH. FATHIR LAMATENGGO',             tempatLahir: 'KAB. GORONTALO',    tanggalLahir: '2010-10-19', kelas: 'neutrino', jabatan: 'sekretaris' },
  { id: 'n-17', no: 17, nama: 'MOH. TEGUH ADITYA MA\'RUF',          tempatLahir: 'KAB. GORONTALO',    tanggalLahir: '2011-04-16', kelas: 'neutrino' },
  { id: 'n-18', no: 18, nama: 'MOHAMAD RIZIQ DAUD',                 tempatLahir: 'BULONTALA',         tanggalLahir: '2012-03-17', kelas: 'neutrino' },
  { id: 'n-19', no: 19, nama: 'MOHAMAD RIZKI HUSAIN',               tempatLahir: 'GORONTALO',         tanggalLahir: '2011-10-09', kelas: 'neutrino' },
  { id: 'n-20', no: 20, nama: 'MU\'ADZ DUENGO',                     tempatLahir: 'PAGUYAMAN',         tanggalLahir: '2010-10-30', kelas: 'neutrino' },
  { id: 'n-21', no: 21, nama: 'MUHAMMAD AL FARIS NUSI',             tempatLahir: 'GORONTALO',         tanggalLahir: '2011-06-25', kelas: 'neutrino' },
  { id: 'n-22', no: 22, nama: 'MUHAMMAD ILYAS',                     tempatLahir: 'MANADO',            tanggalLahir: '2010-11-14', kelas: 'neutrino' },
  { id: 'n-23', no: 23, nama: 'REYHAN RIZKY RAMADHAN',              tempatLahir: 'GORONTALO',         tanggalLahir: '2011-08-03', kelas: 'neutrino' },
  { id: 'n-24', no: 24, nama: 'THOLHAH BIN SUKARMAN HALIM',         tempatLahir: 'KAB. GORONTALO',    tanggalLahir: '2010-04-17', kelas: 'neutrino' },
  { id: 'n-25', no: 25, nama: 'ZAID ABDUR RAFI',                    tempatLahir: 'LUWUK',             tanggalLahir: '2010-02-01', kelas: 'neutrino', jabatan: 'bendahara' },
  { id: 'n-26', no: 26, nama: 'ZULFAHRI SINGGILI',                  tempatLahir: 'KAB. GORONTALO',    tanggalLahir: '2010-12-08', kelas: 'neutrino' },
  { id: 'n-27', no: 27, nama: 'KAREL REZKY ART PAKAYA',             tempatLahir: 'GORONTALO',         tanggalLahir: '2011-10-31', kelas: 'neutrino' },
  { id: 'n-28', no: 28, nama: 'MUH ILHAM WIRATAMA',                 tempatLahir: 'LUWUK BANGGAI',     tanggalLahir: '2011-01-01', kelas: 'neutrino' },
  { id: 'n-29', no: 29, nama: 'CHAFFA MOODUTO',                     tempatLahir: 'GORONTALO',         tanggalLahir: '2011-01-01', kelas: 'neutrino' },
];

// ─── ALL AXE (9B — Akhwat/Putri) ─────────────────────────────
export const allAxe: Santri[] = [
  { id: 'a-01', no: 1,  nama: 'AIN TAHIR',                                    tempatLahir: 'KWANDANG',        tanggalLahir: '2010-08-03', kelas: 'all-axe' },
  { id: 'a-02', no: 2,  nama: 'ALIFATUNNISAA LADIKU',                          tempatLahir: 'GORONTALO',       tanggalLahir: '2011-09-27', kelas: 'all-axe' },
  { id: 'a-03', no: 3,  nama: 'ALYA ISTIQOMAH AZZAHRA LALU',                   tempatLahir: 'BULANGO SELATAN', tanggalLahir: '2011-01-01', kelas: 'all-axe' },
  { id: 'a-04', no: 4,  nama: 'BALQIS ADIBA AZ\'ZAHRA I. WARTABONE',           tempatLahir: 'GORONTALO',       tanggalLahir: '2010-11-22', kelas: 'all-axe' },
  { id: 'a-05', no: 5,  nama: 'CHIYA FAUZIYAH SOFYAN',                         tempatLahir: 'BUOL',            tanggalLahir: '2011-05-08', kelas: 'all-axe' },
  { id: 'a-06', no: 6,  nama: 'FAKHIRAH HIKMAH RAMADHANI DUENGO',              tempatLahir: 'GORONTALO',       tanggalLahir: '2011-08-17', kelas: 'all-axe' },
  { id: 'a-07', no: 7,  nama: 'MUTIA SALSABILA NOHO',                          tempatLahir: 'GORONTALO',       tanggalLahir: '2011-05-09', kelas: 'all-axe' },
  { id: 'a-08', no: 8,  nama: 'SHARIFA FUKAYNA URBI ASWAN',                    tempatLahir: 'GORONTALO',       tanggalLahir: '2011-11-27', kelas: 'all-axe' },
  { id: 'a-09', no: 9,  nama: 'WAFA AMATULLAH GANI',                           tempatLahir: 'GORONTALO',       tanggalLahir: '2011-07-05', kelas: 'all-axe' },
  { id: 'a-10', no: 10, nama: 'ANAYA PUTRI KOIJO',                             tempatLahir: 'GORONTALO',       tanggalLahir: '2010-12-01', kelas: 'all-axe' },
];

// ─── KELAS INFO ───────────────────────────────────────────────
export const kelasInfo: Record<string, KelasInfo> = {
  neutrino: {
    id: 'neutrino',
    nama: 'Neutrino',
    label: 'Ikhwa (Putra)',
    waliKelas: 'Ustadz Taufik Hidayat',
    totalSantri: 29,
    angkatan: 16,
    tahun: '2023-2026',
    ketua: 'Al Hafidz Syahreza Maulana Hasan',
    sekretaris: 'Moh. Fathir Lamatenggo',
    bendahara: 'Zaid Abdur Rafi',
    warna: '#C9A227',
    deskripsi: 'Angkatan Neutrino MTS Wahdah Islamiyah Bonebolango — partikel yang menembus segalanya, seperti tekad kami menembus batas ilmu. Shaped by time, brought together by a shared purpose.',
  },
  'all-axe': {
    id: 'all-axe',
    nama: 'All Axe',
    label: 'Akhwat (Putri)',
    waliKelas: 'Ustadzah Ratna Muhi',
    totalSantri: 10,
    angkatan: 16,
    tahun: '2023-2026',
    ketua: '-',
    warna: '#E8C5A0',
    deskripsi: 'Angkatan All Axe MTS Wahdah Islamiyah Bonebolango — ketajaman bak kapak, membelah segala rintangan dengan iman dan ilmu yang teguh.',
  },
};

export const allSantri: Santri[] = [...neutrino, ...allAxe];

// Utility
export const formatTTL = (tempat: string, tgl: string) => {
  const d = new Date(tgl);
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${tempat}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
};

export const getUmur = (tgl: string) => {
  const today = new Date();
  const birth = new Date(tgl);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};
