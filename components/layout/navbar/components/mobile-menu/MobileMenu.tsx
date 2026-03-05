'use client';

import { useState } from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
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
import { NAV_LINKS } from '../../constants';
import { useRouter } from 'nextjs-toploader/app';
import { MobileMenuProps } from './types';

const MobileMenu = ({ user }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Navbar');
  const router = useRouter();

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
          {NAV_LINKS.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="text-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              >
                {t(link.labelKey)}
              </Link>
            </SheetClose>
          ))}
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
