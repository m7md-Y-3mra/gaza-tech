'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AdminUser } from '@/modules/admin-users/types';
import { ChangeRoleDialog } from '@/modules/admin-users/components/change-role-dialog';
import { BanUserDialog } from '@/modules/admin-users/components/ban-user-dialog';
import { UnbanUserDialog } from '@/modules/admin-users/components/unban-user-dialog';
import { UserDetailSheet } from '@/modules/admin-users/components/user-detail-sheet';

interface UsersRowActionsProps {
  user: AdminUser;
  isSelf: boolean;
  onMutationSuccess: () => void;
}

export function UsersRowActions({
  user,
  isSelf,
  onMutationSuccess,
}: UsersRowActionsProps) {
  const t = useTranslations('AdminUsers');
  const [detailOpen, setDetailOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [unbanOpen, setUnbanOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label={t('rowActions.trigger')}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDetailOpen(true)}>
            {t('rowActions.viewDetails')}
          </DropdownMenuItem>
          {/* Mutation actions disabled for own row */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setChangeRoleOpen(true)}
            disabled={isSelf}
          >
            {t('rowActions.changeRole')}
          </DropdownMenuItem>
          {user.is_active ? (
            <DropdownMenuItem
              onClick={() => setBanOpen(true)}
              disabled={isSelf}
              className="text-red-600"
            >
              {t('rowActions.ban')}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setUnbanOpen(true)}
              disabled={isSelf}
            >
              {t('rowActions.unban')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangeRoleDialog
        open={changeRoleOpen}
        onOpenChange={setChangeRoleOpen}
        user={user}
        onConfirmed={() => {
          setChangeRoleOpen(false);
          onMutationSuccess();
        }}
      />

      <BanUserDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        user={user}
        onConfirmed={() => {
          setBanOpen(false);
          onMutationSuccess();
        }}
      />

      <UnbanUserDialog
        open={unbanOpen}
        onOpenChange={setUnbanOpen}
        user={user}
        onConfirmed={() => {
          setUnbanOpen(false);
          onMutationSuccess();
        }}
      />

      <UserDetailSheet
        user={user}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onMutationSuccess={onMutationSuccess}
      />
    </>
  );
}
