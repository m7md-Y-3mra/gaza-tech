import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/modules/user/queries';
import { getUserById } from '@/modules/user/queries';
import { NAV_LINKS } from './constants';
import UserDropdown from './components/user-dropdown';
import MobileMenu from './components/mobile-menu';
import type { NavbarUser } from './types';

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
    };
  }

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
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth / User */}
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
        <MobileMenu user={navbarUser} />
      </div>
    </header>
  );
}
