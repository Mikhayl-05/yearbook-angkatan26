import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { HARDCODED_ROOT_ADMINS, ROOT_OWNER_EMAIL, isHardcodedRootAdmin, type UserRole } from '@/lib/adminRoles';

const ALLOWED_ROLES: UserRole[] = ['root', 'manager_ikhwa'];
const isValidRole = (role: unknown): role is UserRole => typeof role === 'string' && ALLOWED_ROLES.includes(role as UserRole);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env.local' });

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Tidak ada token' });
  const token = authHeader.replace('Bearer ', '');
  const { data: { user: callerUser }, error: authErr } = await adminClient.auth.getUser(token);
  if (authErr || !callerUser?.email) return res.status(401).json({ error: 'Token tidak valid' });

  let callerRole: UserRole | null = null;
  if (isHardcodedRootAdmin(callerUser.email)) callerRole = 'root';
  else {
    const { data } = await adminClient.from('admin_users').select('role').eq('email', callerUser.email).maybeSingle();
    if (isValidRole(data?.role)) callerRole = data.role;
  }
  if (callerRole !== 'root') return res.status(403).json({ error: 'Akses ditolak. Hanya Admin Root yang dapat mengelola akun.' });

  if (req.method === 'GET') {
    const { data, error } = await adminClient.auth.admin.listUsers({ perPage: 200 });
    if (error) return res.status(500).json({ error: error.message });

    const { data: adminRows } = await adminClient.from('admin_users').select('email, role');
    const adminMap = new Map((adminRows ?? []).map((row: { email: string; role: UserRole }) => [row.email, row]));

    const users = data.users.map((u) => {
      const email = u.email ?? '';
      const info = adminMap.get(email);
      const role = isHardcodedRootAdmin(email) ? 'root' : info?.role || null;
      return {
        id: u.id,
        email,
        full_name: u.user_metadata?.full_name || '',
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at,
        role,
        is_admin: !!role,
        is_owner: email === ROOT_OWNER_EMAIL,
        is_hardcoded_root: HARDCODED_ROOT_ADMINS.includes(email as (typeof HARDCODED_ROOT_ADMINS)[number]),
        confirmed: !!u.email_confirmed_at,
      };
    });
    return res.status(200).json({ users });
  }

  if (req.method === 'POST') {
    let { email, password, full_name, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' });
    email = email.toLowerCase();
    if (role !== null && role !== undefined && !isValidRole(role)) return res.status(400).json({ error: 'Role tidak valid' });

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: full_name || email },
      email_confirm: true,
    });
    if (error) return res.status(500).json({ error: error.message });

    if (isValidRole(role)) {
      const { error: upsertErr } = await adminClient.from('admin_users').upsert({
        email,
        role,
      }, { onConflict: 'email' });
      
      if (upsertErr) return res.status(500).json({ error: upsertErr.message });
    }
    return res.status(200).json({ user: data.user });
  }

  if (req.method === 'PATCH') {
    let { email, role, full_name, password } = req.body as { email?: string; role?: UserRole | null | ""; full_name?: string; password?: string };
    if (!email) return res.status(400).json({ error: 'Email wajib diisi' });
    email = email.toLowerCase();

    // Handle role "" as null (Santri)
    if (role === "") role = null;
    
    if (email === ROOT_OWNER_EMAIL && role !== undefined && role !== 'root') {
      return res.status(403).json({ error: 'Admin Root utama tidak bisa didemote atau dicabut.' });
    }
    if (role !== null && role !== undefined && !isValidRole(role)) return res.status(400).json({ error: 'Role tidak valid' });

    const { data: listedUsers, error: listErr } = await adminClient.auth.admin.listUsers({ perPage: 200 });
    if (listErr) return res.status(500).json({ error: listErr.message });
    const target = listedUsers.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!target) return res.status(404).json({ error: 'User tidak ditemukan' });

    if (full_name !== undefined || password) {
      const metadata = { ...(target.user_metadata || {}) } as Record<string, unknown>;
      if (full_name !== undefined) metadata.full_name = full_name;
      const { error } = await adminClient.auth.admin.updateUserById(target.id, { user_metadata: metadata, password: password || undefined });
      if (error) return res.status(500).json({ error: error.message });
    }

    if (role !== undefined) {
      if (role === null) {
        if (email === ROOT_OWNER_EMAIL) return res.status(403).json({ error: 'Admin Root utama tidak bisa dicabut aksesnya.' });
        const { error: delErr } = await adminClient.from('admin_users').delete().eq('email', email);
        if (delErr) return res.status(500).json({ error: delErr.message });
      } else {
        const { error: upsertErr } = await adminClient.from('admin_users').upsert({
          email,
          role,
        }, { onConflict: 'email' });
        
        if (upsertErr) return res.status(500).json({ error: upsertErr.message });
      }
    }
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    let { user_id, email } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id wajib diisi' });
    if (email) email = email.toLowerCase();
    if (user_id === callerUser.id) return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' });
    if (email === ROOT_OWNER_EMAIL) return res.status(403).json({ error: 'Admin Root utama tidak dapat dihapus' });

    const { error } = await adminClient.auth.admin.deleteUser(user_id);
    if (error) return res.status(500).json({ error: error.message });
    if (email) await adminClient.from('admin_users').delete().eq('email', email);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method tidak diizinkan' });
}
