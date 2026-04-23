import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/server/adminAuth';

const pickAllowedKelas = (scope: 'neutrino' | 'all-axe' | null, requested?: string) => {
  if (!scope) return requested;
  return scope;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { adminClient, role, kelasScope } = await requireAdmin(req);
    const resource = (req.query.resource || req.body?.resource) as string | undefined;
    if (!resource) return res.status(400).json({ error: 'resource wajib diisi' });

    if (req.method === 'GET') {
      if (resource === 'santri') {
        let q = adminClient.from('santri').select('*').order('nama', { ascending: true });
        if (kelasScope) q = q.eq('kelas', kelasScope);
        const { data, error } = await q;
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ data });
      }
      if (resource === 'guru') {
        let q = adminClient.from('guru').select('*');
        if (kelasScope) q = q.eq('kelas', kelasScope);
        const { data, error } = await q;
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ data });
      }
      return res.status(400).json({ error: 'resource GET tidak didukung' });
    }

    if (req.method === 'POST') {
      if (resource === 'santri') {
        const payload = { ...req.body.data };
        payload.kelas = pickAllowedKelas(kelasScope, payload.kelas);
        const { data, error } = await adminClient.from('santri').insert(payload).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ data });
      }
      if (resource === 'gallery') {
        const payload = { ...req.body.data };
        payload.kelas = pickAllowedKelas(kelasScope, payload.kelas);
        const { data, error } = await adminClient.from('gallery').insert(payload).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ data });
      }
      if (resource === 'playlist') {
        const payload = { ...req.body.data };
        payload.kelas = pickAllowedKelas(kelasScope, payload.kelas || 'all');
        const { data, error } = await adminClient.from('playlist').insert(payload).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ data });
      }
      return res.status(400).json({ error: 'resource POST tidak didukung' });
    }

    if (req.method === 'PATCH') {
      if (resource === 'santri') {
        const { id, updates } = req.body;
        if (!id) return res.status(400).json({ error: 'id wajib diisi' });
        const next = { ...updates };
        if (kelasScope) next.kelas = kelasScope;
        const { data, error } = await adminClient.from('santri').update(next).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ data });
      }
      if (resource === 'guru') {
        const { id, updates } = req.body;
        if (!id) return res.status(400).json({ error: 'id wajib diisi' });
        const next = { ...updates };
        if (kelasScope) next.kelas = kelasScope;
        const { data, error } = await adminClient.from('guru').update(next).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ data });
      }
      if (resource === 'submission') {
        const { id, status } = req.body;
        if (!id || !status) return res.status(400).json({ error: 'id dan status wajib diisi' });
        const { data, error } = await adminClient.from('gallery_submissions').update({ status }).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ data });
      }
      return res.status(400).json({ error: 'resource PATCH tidak didukung' });
    }

    if (req.method === 'DELETE') {
      if (resource === 'santri') {
        const { id } = req.body;
        const { error } = await adminClient.from('santri').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
      }
      if (resource === 'gallery') {
        const { id } = req.body;
        const { error } = await adminClient.from('gallery').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
      }
      if (resource === 'note') {
        const { id } = req.body;
        const { error } = await adminClient.from('sticky_notes').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
      }
      if (resource === 'playlist') {
        const { id } = req.body;
        const { error } = await adminClient.from('playlist').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'resource DELETE tidak didukung' });
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (error: any) {
    const msg = error?.message || 'Akses ditolak';
    const status = msg.includes('token') || msg.includes('Token') ? 401 : msg.includes('Akses') ? 403 : 500;
    return res.status(status).json({ error: msg });
  }
}
