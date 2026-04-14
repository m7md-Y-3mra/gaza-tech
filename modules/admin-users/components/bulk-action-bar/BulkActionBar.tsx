'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ROLES } from '@/config/rbac';
import type { AdminUser, UserRole } from '@/modules/admin-users/types';
import {
  BanReasonFormSchema,
  BAN_REASON_MAX,
  type BanReasonFormValues,
} from '@/modules/admin-users/components/ban-user-dialog/constants';
import { useBulkActionBar } from './hooks/useBulkActionBar';

interface BulkActionBarProps {
  table: Table<AdminUser>;
  currentAdminUserId: string;
  onAfterBulk: () => void;
}

export function BulkActionBar({
  table,
  currentAdminUserId,
  onAfterBulk,
}: BulkActionBarProps) {
  const t = useTranslations('AdminUsers');
  const { selectedUserIds, runBulkRoleChange, runBulkBan } = useBulkActionBar({
    table,
    currentAdminUserId,
    refetch: onAfterBulk,
  });

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('registered');
  const [isRoleSubmitting, setIsRoleSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset: resetBanForm,
    formState: { errors, isSubmitting: isBanSubmitting },
  } = useForm<BanReasonFormValues>({
    resolver: zodResolver(BanReasonFormSchema),
    defaultValues: { reason: '' },
  });

  const reason = watch('reason');

  if (selectedUserIds.length === 0) return null;

  async function handleBulkRole() {
    setIsRoleSubmitting(true);
    await runBulkRoleChange(selectedRole);
    setIsRoleSubmitting(false);
    setRoleDialogOpen(false);
  }

  async function onBanSubmit(values: BanReasonFormValues) {
    await runBulkBan(values.reason);
    resetBanForm();
    setBanDialogOpen(false);
  }

  return (
    <>
      <div className="sticky bottom-4 flex items-center justify-center">
        <div className="bg-background flex items-center gap-3 rounded-lg border px-4 py-2 shadow-lg">
          <span className="text-sm font-medium">
            {t('bulk.selectedCount', { count: selectedUserIds.length })}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRoleDialogOpen(true)}
          >
            {t('bulk.changeRole')}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setBanDialogOpen(true)}
          >
            {t('bulk.ban')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => table.resetRowSelection()}
          >
            {t('bulk.clear')}
          </Button>
        </div>
      </div>

      {/* Bulk Role Change Dialog */}
      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('bulk.confirm.changeRole', { count: selectedUserIds.length })}
            </AlertDialogTitle>
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
            <AlertDialogCancel disabled={isRoleSubmitting}>
              {t('dialogs.changeRole.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkRole}
              disabled={isRoleSubmitting}
            >
              {t('dialogs.changeRole.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Ban Dialog */}
      <Dialog
        open={banDialogOpen}
        onOpenChange={(o) => {
          if (!o) resetBanForm();
          setBanDialogOpen(o);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('bulk.confirm.ban', { count: selectedUserIds.length })}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onBanSubmit)} id="bulk-ban-form">
            <div className="space-y-2">
              <Label htmlFor="bulk-ban-reason">
                {t('dialogs.ban.reasonLabel')}
              </Label>
              <Textarea
                id="bulk-ban-reason"
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
                  {(reason ?? '').length}/{BAN_REASON_MAX}
                </span>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetBanForm();
                setBanDialogOpen(false);
              }}
              disabled={isBanSubmitting}
            >
              {t('dialogs.ban.cancel')}
            </Button>
            <Button
              type="submit"
              form="bulk-ban-form"
              variant="destructive"
              disabled={isBanSubmitting}
            >
              {t('dialogs.ban.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
