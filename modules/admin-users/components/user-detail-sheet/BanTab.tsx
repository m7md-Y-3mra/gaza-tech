'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { banUserAction, unbanUserAction } from '@/modules/admin-users/actions';
import {
  BanReasonFormSchema,
  BAN_REASON_MAX,
  type BanReasonFormValues,
} from '@/modules/admin-users/components/ban-user-dialog/constants';
import type { AdminUser } from '@/modules/admin-users/types';

interface BanTabProps {
  user: AdminUser;
  onMutationSuccess: () => void;
}

export function BanTab({ user, onMutationSuccess }: BanTabProps) {
  const t = useTranslations('AdminUsers');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BanReasonFormValues>({
    resolver: zodResolver(BanReasonFormSchema),
    defaultValues: { reason: '' },
  });

  const reason = watch('reason');

  async function onBanSubmit(values: BanReasonFormValues) {
    const result = await banUserAction({
      targetUserId: user.user_id,
      reason: values.reason,
    });

    if (result.success) {
      toast.success(t('toast.ban.success'));
      reset();
      onMutationSuccess();
    } else {
      if (result.errors?.reason) {
        setError('reason', { message: result.errors.reason });
      } else {
        toast.error(result.message ?? t('toast.ban.error'));
      }
    }
  }

  async function handleUnban() {
    const result = await unbanUserAction({ targetUserId: user.user_id });

    if (result.success) {
      toast.success(t('toast.unban.success'));
      onMutationSuccess();
    } else {
      toast.error(result.message ?? t('toast.unban.error'));
    }
  }

  if (!user.is_active) {
    return (
      <div className="flex flex-col gap-4">
        {user.ban_reason && (
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm font-medium">
              {t('userDetail.ban.currentBanReason')}
            </p>
            <p className="bg-muted rounded-md p-3 text-sm">{user.ban_reason}</p>
          </div>
        )}
        <Button variant="outline" onClick={handleUnban} className="w-full">
          {t('rowActions.unban')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onBanSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sheet-ban-reason">{t('dialogs.ban.reasonLabel')}</Label>
        <Textarea
          id="sheet-ban-reason"
          placeholder={t('dialogs.ban.reasonPlaceholder')}
          {...register('reason')}
          rows={4}
        />
        <div className="flex items-center justify-between">
          {errors.reason && (
            <p className="text-destructive text-sm">{errors.reason.message}</p>
          )}
          <span className="text-muted-foreground ml-auto text-xs">
            {reason.length}/{BAN_REASON_MAX}
          </span>
        </div>
      </div>
      <Button
        type="submit"
        variant="destructive"
        disabled={isSubmitting}
        className="w-full"
      >
        {t('dialogs.ban.submit')}
      </Button>
    </form>
  );
}
