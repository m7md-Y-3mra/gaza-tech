export const STATUS_BADGE_MAP: Record<
  'active' | 'banned',
  { labelKey: string; className: string }
> = {
  active: {
    labelKey: 'status.active',
    className: 'bg-green-100 text-green-800',
  },
  banned: {
    labelKey: 'status.banned',
    className: 'bg-red-100 text-red-800',
  },
};
