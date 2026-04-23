import { createClient, type User } from '@supabase/supabase-js';
import type { NextApiRequest } from 'next';
import { isHardcodedRootAdmin, roleToKelasScope, type UserRole } from '@/lib/adminRoles';

export type AdminAuthResult = {
  adminClient: any;
  user: User;
  role: UserRole;
  kelasScope: 'neutrino' | 'all-axe' | null;
};

export const requireAdmin = async (req: NextApiRequest): Promise<AdminAuthResult> => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env.local');

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('Tidak ada token');
  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error: authErr } = await adminClient.auth.getUser(token);
  if (authErr || !user?.email) throw new Error('Token tidak valid');

  let role: UserRole | null = null;
  if (isHardcodedRootAdmin(user.email)) {
    role = 'root';
  } else {
    const { data } = await adminClient.from('admin_users').select('role').eq('email', user.email).maybeSingle();
    if (data?.role && ['root', 'manager_ikhwa', 'manager_akhwat'].includes(data.role)) {
      role = data.role as UserRole;
    }
  }
  if (!role) throw new Error('Akses ditolak');

  return { adminClient, user, role, kelasScope: roleToKelasScope(role) };
};
