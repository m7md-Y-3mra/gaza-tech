import type { NavLink } from './types';

export const NAV_LINKS: NavLink[] = [
  { href: '/', labelKey: 'home' },
  { href: '/listings', labelKey: 'listings' },
  { href: '/community', labelKey: 'community' },
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
];
