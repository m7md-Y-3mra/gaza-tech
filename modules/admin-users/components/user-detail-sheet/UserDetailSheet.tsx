'use client';

import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleBadge } from '@/modules/admin-users/components/role-badge';
import { StatusBadge } from '@/modules/admin-users/components/status-badge';
import type { AdminUser } from '@/modules/admin-users/types';
import { BanTab } from './BanTab';
import { ProfileTab } from './ProfileTab';
import { RoleTab } from './RoleTab';

interface UserDetailSheetProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMutationSuccess: () => void;
}

export function UserDetailSheet({
  user,
  open,
  onOpenChange,
  onMutationSuccess,
}: UserDetailSheetProps) {
  const t = useTranslations('AdminUsers');

  if (!user) return null;

  const initials =
    `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="pb-0">
          <SheetTitle className="sr-only">
            {t('userDetail.sheetTitle')}
          </SheetTitle>
          {/* Header: avatar + name + badges */}
          <div className="flex items-center gap-4 pb-4">
            <Avatar className="size-14">
              <AvatarImage
                src={user.avatar_url ?? undefined}
                alt={`${user.first_name} ${user.last_name}`}
              />
              <AvatarFallback className="text-base">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="truncate text-base font-semibold">
                {user.first_name} {user.last_name}
              </p>
              {user.email && (
                <p className="text-muted-foreground truncate text-sm">
                  {user.email}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                <RoleBadge role={user.user_role} />
                <StatusBadge isActive={user.is_active} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs
          defaultValue="role"
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList className="mx-4 w-auto self-start">
            <TabsTrigger value="role">{t('userDetail.tabs.role')}</TabsTrigger>
            <TabsTrigger value="ban">{t('userDetail.tabs.ban')}</TabsTrigger>
            <TabsTrigger value="profile">
              {t('userDetail.tabs.profile')}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <TabsContent value="role">
              <RoleTab user={user} onMutationSuccess={onMutationSuccess} />
            </TabsContent>

            <TabsContent value="ban">
              <BanTab user={user} onMutationSuccess={onMutationSuccess} />
            </TabsContent>

            <TabsContent value="profile">
              <ProfileTab user={user} onMutationSuccess={onMutationSuccess} />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
