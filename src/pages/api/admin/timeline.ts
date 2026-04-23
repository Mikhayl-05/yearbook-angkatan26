import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/server/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { adminClient, role } = await requireAdmin(req);
  const callerIsRoot = role === 'root';
  if (!callerIsRoot) return res.status(403).json({ error: 'Akses ditolak. Hanya Admin Root yang dapat mengelola timeline.' });

  if (req.method === 'POST') {
    const { error, data } = await adminClient.from('timeline').insert(req.body).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }
  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const { error, data } = await adminClient.from('timeline').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const { error } = await adminClient.from('timeline').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
