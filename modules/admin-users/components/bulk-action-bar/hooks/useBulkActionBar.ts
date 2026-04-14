'use client';

import type { Table } from '@tanstack/react-table';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { AdminUser, UserRole } from '@/modules/admin-users/types';
import {
  bulkChangeRoleAction,
  bulkBanAction,
} from '@/modules/admin-users/actions';

interface UseBulkActionBarOptions {
  table: Table<AdminUser>;
  currentAdminUserId: string;
  refetch: () => void;
}

export function useBulkActionBar({
  table,
  currentAdminUserId,
  refetch,
}: UseBulkActionBarOptions) {
  const t = useTranslations('AdminUsers');

  const rowSelection = table.getState().rowSelection;
  const allRows = table.getRowModel().rows;

  const selectedUserIds = allRows
    .filter((row) => rowSelection[row.id])
    .map((row) => row.original.user_id)
    .filter((id) => id !== currentAdminUserId);

  async function runBulkRoleChange(newRole: UserRole) {
    if (selectedUserIds.length === 0) return;
    const result = await bulkChangeRoleAction({
      targetUserIds: selectedUserIds,
      newRole,
    });
    if (result.success) {
      const { successful, failed } = result.data;
      toast(
        t('toast.bulk.summary', {
          ok: successful.length,
          total: selectedUserIds.length,
          failed: failed.length,
        })
      );
    } else {
      toast.error(result.message);
    }
    table.resetRowSelection();
    refetch();
  }

  async function runBulkBan(reason: string) {
    if (selectedUserIds.length === 0) return;
    const result = await bulkBanAction({
      targetUserIds: selectedUserIds,
      reason,
    });
    if (result.success) {
      const { successful, failed } = result.data;
      toast(
        t('toast.bulk.summary', {
          ok: successful.length,
          total: selectedUserIds.length,
          failed: failed.length,
        })
      );
    } else {
      toast.error(result.message);
    }
    table.resetRowSelection();
    refetch();
  }

  return { selectedUserIds, runBulkRoleChange, runBulkBan };
}
