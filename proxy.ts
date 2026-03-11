import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/proxy';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { rbacConfig } from './config/rbac';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 1. Update Supabase auth session ─────────────────────────────────
  const { supabaseResponse, supabase } = await updateSession(request);

  // ─── 2. RBAC Route Protection ────────────────────────────────────────
  if (rbacConfig.isProtectedPath(pathname)) {
    const strippedPath = rbacConfig.stripLocale(pathname);

    // Detect locale from the URL for redirect targets
    const locale =
      rbacConfig.LOCALES.find(
        (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
      ) || routing.defaultLocale;

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Fetch user role from the public users table
    const { data: profile } = await supabase
      .from('users')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    const userRole = profile?.user_role ?? null;

    // Check role-based access
    if (!rbacConfig.canAccessRoute(userRole, strippedPath)) {
      const homeUrl = new URL(`/${locale}`, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // ─── 3. Run intl middleware ──────────────────────────────────────────
  const intlResponse = intlMiddleware(request);

  // Copy Supabase auth cookies to the intl response
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
