// src/pages/api/admin/timeline.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const HARDCODED_ADMINS = [
  'admin@yearbookangkatan26.com',
  'muhammadyusuflauma109@gmail.com',
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env.local' });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Tidak ada token' });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user: callerUser }, error: authErr } = await adminClient.auth.getUser(token);
  if (authErr || !callerUser?.email) return res.status(401).json({ error: 'Token tidak valid' });

  let callerIsAdmin = HARDCODED_ADMINS.includes(callerUser.email);
  if (!callerIsAdmin) {
    const { data } = await adminClient.from('admin_users').select('email').eq('email', callerUser.email).maybeSingle();
    callerIsAdmin = !!data;
  }
  if (!callerIsAdmin) return res.status(403).json({ error: 'Akses ditolak' });

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
