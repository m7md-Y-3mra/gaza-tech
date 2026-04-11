'use client';

import { useState } from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { signOutAction } from '@/modules/auth/actions';
import { useRouter } from 'nextjs-toploader/app';
import { MobileMenuProps } from './types';

const MobileMenu = ({ user, navLinks }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Navbar');
  const router = useRouter();
  const pathname = usePathname();

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase() ||
      '?'
    : '';

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || ''
    : '';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      <SheetContent side="right" className="w-[300px] p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-start text-lg font-bold tracking-tight">
            GTM
          </SheetTitle>
        </SheetHeader>

        {/* User info section */}
        {user && (
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <Avatar className="size-10">
              <AvatarImage
                src={user.avatarUrl ?? undefined}
                alt={displayName}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-medium">
                {displayName}
              </p>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 px-3 py-3">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);

            return (
              <SheetClose asChild key={link.href}>
                <Link
                  href={link.href as React.ComponentProps<typeof Link>['href']}
                  className={cn(
                    'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent/60 text-foreground shadow-sm'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {t(link.labelKey as Parameters<typeof t>[0])}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <Separator />

        {/* Auth actions */}
        <div className="flex flex-col gap-2 px-6 py-4">
          {user ? (
            <>
              <SheetClose asChild>
                <Link
                  href={`/profile/${user.id}`}
                  className="text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  <User className="size-4" />
                  {t('profile')}
                </Link>
              </SheetClose>

              <Separator />

              <button
                onClick={async () => {
                  setOpen(false);
                  await signOutAction();
                  router.push('login');
                }}
                className="text-destructive hover:bg-destructive/10 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              >
                <LogOut className="size-4" />
                {t('logOut')}
              </button>
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">{t('login')}</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button className="w-full" asChild>
                  <Link href="/signup">{t('signUp')}</Link>
                </Button>
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
