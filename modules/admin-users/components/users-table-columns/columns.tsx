'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CircleCheck, CircleX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table';
import { RelativeDate } from '@/components/relative-date/RelativeDate';
import { UserAvatarCell } from '@/modules/admin-users/components/user-avatar-cell';
import { RoleBadge } from '@/modules/admin-users/components/role-badge';
import { StatusBadge } from '@/modules/admin-users/components/status-badge';
import { UsersRowActions } from '@/modules/admin-users/components/users-row-actions';
import type { AdminUser } from '@/modules/admin-users/types';

export function getUsersTableColumns(
  currentAdminUserId: string,
  onMutationSuccess: () => void,
  t: ReturnType<typeof useTranslations<'AdminUsers'>>
): ColumnDef<AdminUser>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'avatar',
      header: () => <span className="sr-only">{t('columns.avatar')}</span>,
      cell: ({ row }) => <UserAvatarCell user={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'name',
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.name')} />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
    },
    {
      id: 'role',
      accessorKey: 'user_role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.role')} />
      ),
      cell: ({ row }) => <RoleBadge role={row.original.user_role} />,
    },
    {
      id: 'status',
      accessorKey: 'is_active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.status')} />
      ),
      cell: ({ row }) => <StatusBadge isActive={row.original.is_active} />,
    },
    {
      id: 'is_verified',
      accessorKey: 'is_verified',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.verified')} />
      ),
      cell: ({ row }) =>
        row.original.is_verified ? (
          <CircleCheck
            className="h-4 w-4 text-green-600"
            aria-label={t('verified.yes')}
          />
        ) : (
          <CircleX
            className="h-4 w-4 text-gray-400"
            aria-label={t('verified.no')}
          />
        ),
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.joined')} />
      ),
      cell: ({ row }) => <RelativeDate timestamp={row.original.created_at} />,
    },
    {
      id: 'last_activity_at',
      accessorKey: 'last_activity_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('columns.lastActive')}
        />
      ),
      cell: ({ row }) => (
        <RelativeDate timestamp={row.original.last_activity_at} />
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('columns.actions')}</span>,
      cell: ({ row }) => (
        <UsersRowActions
          user={row.original}
          isSelf={row.original.user_id === currentAdminUserId}
          onMutationSuccess={onMutationSuccess}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
