import type { NavLink } from './types';

export const NAV_LINKS: NavLink[] = [
  { href: '/listings', labelKey: 'home', allowedRoles: ['registered'] },
  { href: '/community', labelKey: 'community', allowedRoles: ['registered'] },
  {
    href: '/listings/create',
    labelKey: 'createListing',
    allowedRoles: ['registered'],
  },
  {
    href: '/verification-request',
    labelKey: 'verificationRequest',
    allowedRoles: ['registered'],
  },
  {
    href: '/dashboard',
    labelKey: 'dashboard',
    allowedRoles: ['admin', 'moderator'],
  },
  {
    href: '/dashboard/verification-review',
    labelKey: 'verificationQueue',
    allowedRoles: ['admin', 'moderator'],
  },
];
