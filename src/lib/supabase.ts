// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── ROLE TYPES ───────────────────────────────────────────────
export type UserRole = 'root' | 'manager_ikhwa' | 'manager_akhwat';

// ─── AUTH HELPERS ─────────────────────────────────────────────
export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string, fullName: string) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getSession = async () => {
  return supabase.auth.getSession();
};

// ─── STICKY NOTES ────────────────────────────────────────────
export type StickyNote = {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  color: string;
  rotation: number;
  created_at: string;
  kelas: 'neutrino' | 'all-axe' | 'general';
};

export const getStickyNotes = async (kelas?: string) => {
  let query = supabase.from('sticky_notes').select('*').order('created_at', { ascending: false });
  if (kelas) query = query.eq('kelas', kelas);
  return query;
};

export const addStickyNote = async (note: Omit<StickyNote, 'id' | 'created_at'>) => {
  return supabase.from('sticky_notes').insert(note).select().single();
};

export const deleteStickyNote = async (id: string) => {
  return supabase.from('sticky_notes').delete().eq('id', id);
};

// ─── GALLERY ─────────────────────────────────────────────────
export type GalleryItem = {
  id: string;
  url: string;
  caption?: string;
  article_text?: string;
  kelas: string;
  category: string;
  submitted_by?: string;
  submitted_name?: string;
  created_at: string;
};

export const getGallery = async (kelas?: string, category?: string) => {
  let query = supabase.from('gallery').select('*').order('created_at', { ascending: false });
  if (kelas && kelas !== 'all') query = query.eq('kelas', kelas);
  if (category && category !== 'all') query = query.eq('category', category);
  return query;
};

export const addGalleryItem = async (item: Omit<GalleryItem, 'id' | 'created_at'>) => {
  return supabase.from('gallery').insert(item).select().single();
};

export const updateGalleryItem = async (id: string, updates: Record<string, unknown>) => {
  return supabase.from('gallery').update(updates).eq('id', id);
};

export const deleteGalleryItem = async (id: string) => {
  return supabase.from('gallery').delete().eq('id', id);
};

// ─── GALLERY SUBMISSIONS ────────────────────────────────────
export type GallerySubmission = {
  id: string;
  url: string;
  caption?: string;
  article_text?: string;
  category: string;
  kelas: string;
  submitted_by?: string;
  submitted_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export const getGallerySubmissions = async (status?: string) => {
  let query = supabase.from('gallery_submissions').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  return query;
};

export const addGallerySubmission = async (item: Omit<GallerySubmission, 'id' | 'created_at' | 'status'>) => {
  return supabase.from('gallery_submissions').insert({ ...item, status: 'pending' }).select().single();
};

export const approveSubmission = async (submission: GallerySubmission) => {
  // Move to gallery table
  const { error: insertError } = await supabase.from('gallery').insert({
    url: submission.url,
    caption: submission.caption,
    article_text: submission.article_text,
    category: submission.category,
    kelas: submission.kelas,
    submitted_by: submission.submitted_by,
    submitted_name: submission.submitted_name,
  });
  if (insertError) throw insertError;

  // Update submission status
  return supabase.from('gallery_submissions').update({ status: 'approved' }).eq('id', submission.id);
};

export const rejectSubmission = async (id: string) => {
  return supabase.from('gallery_submissions').update({ status: 'rejected' }).eq('id', id);
};

// ─── UPLOAD HELPER ───────────────────────────────────────────
export const uploadPhoto = async (file: File, path: string) => {
  const { data, error } = await supabase.storage.from('yearbook').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: url } = supabase.storage.from('yearbook').getPublicUrl(data.path);
  return url.publicUrl;
};

// ─── SANTRI (DB operations) ──────────────────────────────────
export type CustomLink = {
  label: string;
  url: string;
  type: 'link' | 'phone';
  color?: string;
};

export type SantriDB = {
  id: string;
  no: number;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  kelas: 'neutrino' | 'all-axe';
  jabatan?: string;
  instagram?: string;
  wa?: string;
  foto?: string;
  quote?: string;
  link?: string;
  custom_links?: CustomLink[];
  deskripsi?: string;
  created_at?: string;
  updated_at?: string;
};

export const getSantriList = async (kelas?: string) => {
  let query = supabase.from('santri').select('*').order('nama', { ascending: true });
  if (kelas) query = query.eq('kelas', kelas);
  return query;
};

export const getSantriById = async (id: string) => {
  return supabase.from('santri').select('*').eq('id', id).single();
};

export const updateSantri = async (id: string, updates: Record<string, unknown>) => {
  return supabase.from('santri').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
};

export const addSantri = async (santri: Omit<SantriDB, 'created_at' | 'updated_at'>) => {
  return supabase.from('santri').insert(santri).select().single();
};

export const deleteSantri = async (id: string) => {
  return supabase.from('santri').delete().eq('id', id);
};

// ─── SANTRI PHOTOS ───────────────────────────────────────────
export type SantriPhoto = {
  id: string;
  santri_id: string;
  url: string;
  order_num: number;
  created_at: string;
};

export const getSantriPhotos = async (santriId: string) => {
  return supabase.from('santri_photos').select('*').eq('santri_id', santriId).order('order_num');
};

export const addSantriPhoto = async (santriId: string, url: string, orderNum: number) => {
  return supabase.from('santri_photos').insert({ santri_id: santriId, url, order_num: orderNum }).select().single();
};

export const deleteSantriPhoto = async (id: string) => {
  return supabase.from('santri_photos').delete().eq('id', id);
};

// ─── GURU ────────────────────────────────────────────────────
export type GuruDB = {
  id: string;
  nama: string;
  jabatan_guru: string;
  kelas: 'neutrino' | 'all-axe';
  foto?: string;
  deskripsi?: string;
  instagram?: string;
  wa?: string;
  custom_links?: CustomLink[];
  created_at?: string;
  updated_at?: string;
};

export const getGuruList = async (kelas?: string) => {
  let query = supabase.from('guru').select('*');
  if (kelas) query = query.eq('kelas', kelas);
  return query;
};

export const getGuruById = async (id: string) => {
  return supabase.from('guru').select('*').eq('id', id).single();
};

export const updateGuru = async (id: string, updates: Record<string, unknown>) => {
  return supabase.from('guru').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
};

export const getGuruPhotos = async (guruId: string) => {
  return supabase.from('guru_photos').select('*').eq('guru_id', guruId).order('order_num');
};

export const addGuruPhoto = async (guruId: string, url: string, orderNum: number) => {
  return supabase.from('guru_photos').insert({ guru_id: guruId, url, order_num: orderNum }).select().single();
};

export const deleteGuruPhoto = async (id: string) => {
  return supabase.from('guru_photos').delete().eq('id', id);
};

// ─── SITE SETTINGS ───────────────────────────────────────────
export const getSiteSetting = async (key: string) => {
  return supabase.from('site_settings').select('value').eq('key', key).single();
};

export const setSiteSetting = async (key: string, value: string) => {
  return supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() });
};

export const getAllSiteSettings = async () => {
  return supabase.from('site_settings').select('*');
};

// ─── PLAYLIST ────────────────────────────────────────────────
export type Track = {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover?: string;
  kelas?: string;
  order_num: number;
};

export const getPlaylist = async () => {
  return supabase.from('playlist').select('*').order('order_num');
};

export const addTrack = async (track: Omit<Track, 'id'>) => {
  return supabase.from('playlist').insert(track).select().single();
};

export const deleteTrack = async (id: string) => {
  return supabase.from('playlist').delete().eq('id', id);
};

// ─── TIMELINE ────────────────────────────────────────────────
export type TimelineItem = {
  id: string;
  date: string;
  judul: string;
  deskripsi: string;
  kelas: 'neutrino' | 'all-axe' | 'both';
  type: 'hafalan' | 'lomba' | 'event' | 'asrama' | 'wisuda';
  emoji: string;
  created_at: string;
};

export const getTimelineItems = async () => {
  return supabase.from('timeline').select('*').order('created_at');
};

export const addTimelineItem = async (item: Omit<TimelineItem, 'id' | 'created_at'>) => {
  return supabase.from('timeline').insert(item).select().single();
};

export const updateTimelineItem = async (id: string, updates: Record<string, unknown>) => {
  return supabase.from('timeline').update(updates).eq('id', id);
};

export const deleteTimelineItem = async (id: string) => {
  return supabase.from('timeline').delete().eq('id', id);
};

// ─── STORAGE DELETE HELPER ───────────────────────────────────
export const deleteFileFromStorage = async (url: string) => {
  try {
    // Extract the file path from the public URL
    // Public URL format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlParts = url.split('/yearbook/');
    if (urlParts.length !== 2) return;
    
    const filePath = urlParts[1];
    const { error } = await supabase.storage.from('yearbook').remove([filePath]);
    if (error) console.error('Error deleting file from storage:', error);
  } catch (err) {
    console.error('Failed to parse URL for deletion:', err);
  }
};
