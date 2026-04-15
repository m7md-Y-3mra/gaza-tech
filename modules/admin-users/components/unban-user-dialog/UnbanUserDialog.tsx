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
import type { AdminUser } from '@/modules/admin-users/types';
import { unbanUserAction } from '@/modules/admin-users/actions';

interface UnbanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser;
  onConfirmed: () => void;
}

export function UnbanUserDialog({
  open,
  onOpenChange,
  user,
  onConfirmed,
}: UnbanUserDialogProps) {
  const t = useTranslations('AdminUsers');
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    const result = await unbanUserAction({ targetUserId: user.user_id });
    setIsLoading(false);

    if (result.success) {
      toast.success(t('toast.unban.success'));
      onConfirmed();
    } else {
      toast.error(result.message ?? t('toast.unban.error'));
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogs.unban.title')}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('dialogs.unban.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {t('dialogs.unban.submit')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
