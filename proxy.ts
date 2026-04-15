import { NextResponse, type NextRequest } from 'next/server';
import {
  getUserStatus,
  updateSession,
  updateUserStatusCookie,
} from './lib/supabase/proxy';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { rbacConfig } from './config/rbac';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 1. Update Supabase auth session ─────────────────────────────────
  const { supabaseResponse, supabase } = await updateSession(request);

  // ─── 2. Auth & Status Check ──────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const strippedPath = rbacConfig.stripLocale(pathname);
  const isBannedPage = strippedPath === '/banned';

  // Detect locale from the URL for redirects
  const locale =
    rbacConfig.LOCALES.find(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    ) || routing.defaultLocale;

  let userRole: string | null = null;

  if (user) {
    const { isActive, role, fromCache } = await getUserStatus(
      request,
      supabase,
      user.id
    );

    userRole = role;

    // Update cookie in the background response if it was a DB fetch
    if (!fromCache) {
      updateUserStatusCookie(supabaseResponse, isActive, role);
    }

    // A. Banned user logic
    if (!isActive) {
      // If already on /banned, allow access to show reason
      if (isBannedPage) {
        const intlResponse = intlMiddleware(request);
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          intlResponse.cookies.set(cookie.name, cookie.value, cookie);
        });
        return intlResponse;
      }

      // Otherwise, redirect to /banned
      const bannedUrl = new URL(`/${locale}/banned`, request.url);
      const redirectResponse = NextResponse.redirect(bannedUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }

    // B. Active user on /banned page — redirect to home
    if (isBannedPage) {
      const homeUrl = new URL(`/${locale}`, request.url);
      const redirectResponse = NextResponse.redirect(homeUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
  }

  // ─── 3. RBAC Route Protection ────────────────────────────────────────
  if (rbacConfig.isProtectedPath(pathname)) {
    if (!user) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    if (!rbacConfig.canAccessRoute(userRole, strippedPath)) {
      const homeUrl = new URL(`/${locale}`, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // ─── 4. Run intl middleware ──────────────────────────────────────────
  const intlResponse = intlMiddleware(request);

  // Copy Supabase auth cookies (including status cookie) to the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
