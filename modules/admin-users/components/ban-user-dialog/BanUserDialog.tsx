'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { AdminUser } from '@/modules/admin-users/types';
import { banUserAction } from '@/modules/admin-users/actions';
import {
  BanReasonFormSchema,
  BAN_REASON_MAX,
  type BanReasonFormValues,
} from './constants';

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser;
  onConfirmed: () => void;
}

export function BanUserDialog({
  open,
  onOpenChange,
  user,
  onConfirmed,
}: BanUserDialogProps) {
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

  async function onSubmit(values: BanReasonFormValues) {
    const result = await banUserAction({
      targetUserId: user.user_id,
      reason: values.reason,
    });

    if (result.success) {
      toast.success(t('toast.ban.success'));
      reset();
      onConfirmed();
    } else {
      if (result.errors?.reason) {
        setError('reason', { message: result.errors.reason });
      } else {
        toast.error(result.message ?? t('toast.ban.error'));
      }
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialogs.ban.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} id="ban-form">
          <div className="space-y-2">
            <Label htmlFor="ban-reason">{t('dialogs.ban.reasonLabel')}</Label>
            <Textarea
              id="ban-reason"
              placeholder={t('dialogs.ban.reasonPlaceholder')}
              {...register('reason')}
              rows={4}
            />
            <div className="flex items-center justify-between">
              {errors.reason && (
                <p className="text-destructive text-sm">
                  {errors.reason.message}
                </p>
              )}
              <span className="text-muted-foreground ml-auto text-xs">
                {reason.length}/{BAN_REASON_MAX}
              </span>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('dialogs.ban.cancel')}
          </Button>
          <Button
            type="submit"
            form="ban-form"
            variant="destructive"
            disabled={isSubmitting}
          >
            {t('dialogs.ban.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
