import type { SortColumn, UserRole } from '@/modules/admin-users/types';

export const DEFAULT_PAGE_SIZE = 20;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const DEFAULT_SORT: { column: SortColumn; direction: 'desc' } = {
  column: 'created_at',
  direction: 'desc',
};

export const ROLE_OPTIONS: Array<{
  value: UserRole;
  labelKey: string;
  className: string;
}> = [
  {
    value: 'registered',
    labelKey: 'roles.registered',
    className: 'bg-gray-100 text-gray-800',
  },
  {
    value: 'verified_seller',
    labelKey: 'roles.verified_seller',
    className: 'bg-blue-100 text-blue-800',
  },
  {
    value: 'moderator',
    labelKey: 'roles.moderator',
    className: 'bg-amber-100 text-amber-800',
  },
  {
    value: 'admin',
    labelKey: 'roles.admin',
    className: 'bg-red-100 text-red-800',
  },
];

export const STATUS_OPTIONS: Array<{
  value: 'active' | 'banned';
  labelKey: string;
  className: string;
}> = [
  {
    value: 'active',
    labelKey: 'status.active',
    className: 'bg-green-100 text-green-800',
  },
  {
    value: 'banned',
    labelKey: 'status.banned',
    className: 'bg-red-100 text-red-800',
  },
];

export const SORT_COLUMN_MAP: Record<string, SortColumn> = {
  name: 'name',
  role: 'role',
  status: 'status',
  is_verified: 'is_verified',
  created_at: 'created_at',
  last_activity_at: 'last_activity_at',
};

export const SEARCH_DEBOUNCE_MS = 300;
