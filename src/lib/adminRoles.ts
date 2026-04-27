export type UserRole = 'root' | 'manager_ikhwa';

export const ROOT_OWNER_EMAIL = 'admin@yearbookangkatan26.com';

export const HARDCODED_ROOT_ADMINS = [
  ROOT_OWNER_EMAIL,
  'muhammadyusuflauma109@gmail.com',
] as const;

export const isHardcodedRootAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return HARDCODED_ROOT_ADMINS.includes(email as (typeof HARDCODED_ROOT_ADMINS)[number]);
};

export const roleToKelasScope = (role: UserRole | null): 'neutrino' | null => {
  if (role === 'manager_ikhwa') return 'neutrino';
  return null;
};
