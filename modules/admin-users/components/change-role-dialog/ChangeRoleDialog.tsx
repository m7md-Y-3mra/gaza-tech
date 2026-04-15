'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLES } from '@/config/rbac';
import type { AdminUser, UserRole } from '@/modules/admin-users/types';
import { changeUserRoleAction } from '@/modules/admin-users/actions';

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser;
  onConfirmed: () => void;
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  user,
  onConfirmed,
}: ChangeRoleDialogProps) {
  const t = useTranslations('AdminUsers');
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.user_role);
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    const result = await changeUserRoleAction({
      targetUserId: user.user_id,
      newRole: selectedRole,
    });
    setIsLoading(false);

    if (result.success) {
      toast.success(t('toast.role.success'));
      onConfirmed();
    } else {
      toast.error(result.message ?? t('toast.role.error'));
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogs.changeRole.title')}</AlertDialogTitle>
        </AlertDialogHeader>
        <Select
          value={selectedRole}
          onValueChange={(v) => setSelectedRole(v as UserRole)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {t(`roles.${role}` as Parameters<typeof t>[0])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('dialogs.changeRole.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {t('dialogs.changeRole.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
