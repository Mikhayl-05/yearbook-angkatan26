// src/pages/api/admin/users.ts
// API route for admin user management — requires SUPABASE_SERVICE_ROLE_KEY
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Hardcoded admin fallback (same as AuthContext)
const HARDCODED_ADMINS = [
  'admin@yearbookangkatan26.com',
  'muhammadyusuflauma109@gmail.com',
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return res.status(500).json({
      error: 'SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env.local',
    });
  }

  // Create admin-privileged supabase client (server-side only)
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── Verify caller is admin ──────────────────────────────────
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Tidak ada token' });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user: callerUser }, error: authErr } = await adminClient.auth.getUser(token);
  if (authErr || !callerUser?.email) return res.status(401).json({ error: 'Token tidak valid' });

  // Check hardcoded + DB table
  let callerIsAdmin = HARDCODED_ADMINS.includes(callerUser.email);
  if (!callerIsAdmin) {
    const { data } = await adminClient
      .from('admin_users')
      .select('email')
      .eq('email', callerUser.email)
      .maybeSingle();
    callerIsAdmin = !!data;
  }
  if (!callerIsAdmin) return res.status(403).json({ error: 'Akses ditolak' });

  // ── GET: list all users ──────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await adminClient.auth.admin.listUsers({ perPage: 200 });
    if (error) return res.status(500).json({ error: error.message });

    // Attach admin status for each user
    const { data: adminRows } = await adminClient.from('admin_users').select('email');
    const adminEmails = new Set([
      ...HARDCODED_ADMINS,
      ...(adminRows ?? []).map((r: { email: string }) => r.email),
    ]);

    const users = data.users.map(u => ({
      id:            u.id,
      email:         u.email,
      full_name:     u.user_metadata?.full_name || '',
      created_at:    u.created_at,
      last_sign_in:  u.last_sign_in_at,
      is_admin:      adminEmails.has(u.email ?? ''),
      confirmed:     !!u.email_confirmed_at,
    }));

    return res.status(200).json({ users });
  }

  // ── POST: create new user ────────────────────────────────────
  if (req.method === 'POST') {
    const { email, password, full_name, make_admin } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' });

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: full_name || email },
      email_confirm: true, // langsung aktif, skip email verification
    });
    if (error) return res.status(500).json({ error: error.message });

    // Add to admin_users if requested
    if (make_admin && data.user) {
      await adminClient.from('admin_users').upsert({
        email,
        added_by: callerUser.email,
        added_at: new Date().toISOString(),
      });
    }

    return res.status(200).json({ user: data.user });
  }

  // ── PATCH: toggle admin status ───────────────────────────────
  if (req.method === 'PATCH') {
    const { email, make_admin } = req.body;
    if (!email) return res.status(400).json({ error: 'Email wajib diisi' });

    if (make_admin) {
      await adminClient.from('admin_users').upsert({
        email,
        added_by: callerUser.email,
        added_at: new Date().toISOString(),
      });
    } else {
      // Never remove hardcoded admins
      if (HARDCODED_ADMINS.includes(email)) {
        return res.status(400).json({ error: 'Admin bawaan tidak bisa dihapus' });
      }
      await adminClient.from('admin_users').delete().eq('email', email);
    }
    return res.status(200).json({ success: true });
  }

  // ── DELETE: delete user account ──────────────────────────────
  if (req.method === 'DELETE') {
    const { user_id, email } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id wajib diisi' });

    // Prevent self-deletion
    if (user_id === callerUser.id) {
      return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' });
    }

    const { error } = await adminClient.auth.admin.deleteUser(user_id);
    if (error) return res.status(500).json({ error: error.message });

    // Also remove from admin_users if they were admin
    if (email) await adminClient.from('admin_users').delete().eq('email', email);

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method tidak diizinkan' });
}
