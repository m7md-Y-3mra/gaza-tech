import type { UserRole } from '@/modules/admin-users/types';

export const ROLE_BADGE_MAP: Record<
  UserRole,
  { labelKey: string; className: string }
> = {
  registered: {
    labelKey: 'roles.registered',
    className: 'bg-gray-100 text-gray-800',
  },
  verified_seller: {
    labelKey: 'roles.verified_seller',
    className: 'bg-blue-100 text-blue-800',
  },
  moderator: {
    labelKey: 'roles.moderator',
    className: 'bg-amber-100 text-amber-800',
  },
  admin: {
    labelKey: 'roles.admin',
    className: 'bg-red-100 text-red-800',
  },
};
