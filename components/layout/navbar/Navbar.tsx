import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/modules/user/queries';
import { getUserById } from '@/modules/user/queries';
import { rbacConfig } from '@/config/rbac';
import { NAV_LINKS } from './constants';
import UserDropdown from './components/user-dropdown';
import { DesktopNav } from './components/desktop-nav';
import MobileMenu from './components/mobile-menu';
import { ThemeToggle } from './components/theme-toggle';
import { LanguageToggle } from './components/language-toggle';
import type { NavbarUser } from './types';
import type { UserRole } from '@/config/rbac';

export async function Navbar() {
  const t = await getTranslations('Navbar');
  const authUser = await getCurrentUser();

  let navbarUser: NavbarUser | null = null;

  if (authUser) {
    const profile = await getUserById(authUser.id);

    navbarUser = {
      id: authUser.id,
      firstName: profile?.first_name ?? null,
      lastName: profile?.last_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      userRole: (profile?.user_role as UserRole) ?? null,
    };
  }

  // Filter nav links based on user role
  const visibleLinks = NAV_LINKS.filter((link) => {
    if (!link.allowedRoles) return true;
    return rbacConfig.hasRole(navbarUser?.userRole ?? null, link.allowedRoles);
  });

  return (
    <header className="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-primary text-xl font-bold tracking-tight"
        >
          GTM
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav links={visibleLinks} />

        {/* Actions (Desktop & Mobile) */}
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <LanguageToggle />

          <div className="hidden items-center gap-3 md:flex">
            {navbarUser ? (
              <UserDropdown user={navbarUser} />
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">{t('login')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">{t('signUp')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <MobileMenu user={navbarUser} navLinks={visibleLinks} />
        </div>
      </div>
    </header>
  );
}
