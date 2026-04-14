// ─── RBAC Singleton Configuration ──────────────────────────────────────────────
// Single source of truth for all role-based access control logic.
// Safe to import in both Server Components and Edge Runtime (middleware).
// ───────────────────────────────────────────────────────────────────────────────

/**
 * All valid user roles in the system.
 * Stored in `public.users.user_role` column.
 */
export const ROLES = [
  'registered',
  'verified_seller',
  'moderator',
  'admin',
] as const;

export type UserRole = (typeof ROLES)[number];

// ─── Route Protection Map ──────────────────────────────────────────────────────

type RouteConfig = {
  /** Roles allowed to access this route. Use `'*'` to mean "any authenticated user". */
  allowedRoles: UserRole[] | '*';
};

/**
 * Maps URL path patterns (without locale prefix) to their required roles.
 *
 * - Exact paths:    `/listings/create`
 * - Wildcard paths: `/dashboard/*` (matches any sub-path under `/dashboard`)
 *
 * Routes NOT listed here are public (no auth required).
 */
const PROTECTED_ROUTES: Record<string, RouteConfig> = {
  '/dashboard': { allowedRoles: ['admin', 'moderator'] },
  '/dashboard/*': { allowedRoles: ['admin', 'moderator'] },
  '/dashboard/users': { allowedRoles: ['admin'] },
  '/dashboard/users/*': { allowedRoles: ['admin'] },
  '/listings/create': { allowedRoles: '*' },
  '/verification-request': { allowedRoles: '*' },
};

// ─── Locales (kept in sync with i18n/routing.ts) ───────────────────────────────

const LOCALES = ['en', 'ar'];

// ─── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Strip the locale prefix from a pathname.
 * `/ar/dashboard` → `/dashboard`
 * `/en/listings/create` → `/listings/create`
 */
function stripLocale(pathname: string): string {
  for (const locale of LOCALES) {
    const prefix = `/${locale}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || '/';
    }
  }
  return pathname;
}

/**
 * Find the matching route config for a given pathname (locale-stripped).
 * Checks exact match first, then wildcard patterns.
 */
function getRouteConfig(pathname: string): RouteConfig | null {
  // 1. Exact match
  if (PROTECTED_ROUTES[pathname]) {
    return PROTECTED_ROUTES[pathname];
  }

  // 2. Wildcard match — check if any `pattern/*` covers this path
  for (const pattern of Object.keys(PROTECTED_ROUTES)) {
    if (pattern.endsWith('/*')) {
      const base = pattern.slice(0, -2); // remove `/*`
      if (pathname === base || pathname.startsWith(`${base}/`)) {
        return PROTECTED_ROUTES[pattern];
      }
    }
  }

  return null;
}

/**
 * Check if a user role satisfies the required roles.
 * Returns `true` if `requiredRoles` is `'*'` (any authenticated user)
 * or if the user's role is in the list.
 */
function hasRole(
  userRole: string | null | undefined,
  requiredRoles: UserRole[] | '*'
): boolean {
  if (requiredRoles === '*') return true;
  if (!userRole) return false;
  return requiredRoles.includes(userRole as UserRole);
}

/**
 * Check whether a given pathname (with or without locale) is protected.
 */
function isProtectedPath(pathname: string): boolean {
  const stripped = stripLocale(pathname);
  return getRouteConfig(stripped) !== null;
}

/**
 * Check if a user with the given role can access a specific pathname.
 * Returns `true` for unprotected routes.
 */
function canAccessRoute(
  userRole: string | null | undefined,
  pathname: string
): boolean {
  const stripped = stripLocale(pathname);
  const config = getRouteConfig(stripped);

  // Unprotected route — allow everyone
  if (!config) return true;

  return hasRole(userRole, config.allowedRoles);
}

// ─── Frozen Singleton Export ───────────────────────────────────────────────────

export const rbacConfig = Object.freeze({
  ROLES,
  PROTECTED_ROUTES,
  LOCALES,
  stripLocale,
  getRouteConfig,
  hasRole,
  canAccessRoute,
  isProtectedPath,
});
