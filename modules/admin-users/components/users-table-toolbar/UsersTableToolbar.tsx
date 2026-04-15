'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from '@/components/data-table';
import type { AdminUser } from '@/modules/admin-users/types';
import {
  ROLE_OPTIONS,
  STATUS_OPTIONS,
} from '@/modules/admin-users/admin-users-page/components/users-table/constants';
import { useUsersTableToolbar } from './hooks/useUsersTableToolbar';

interface UsersTableToolbarProps {
  table: Table<AdminUser>;
  q: string;
  role: string[];
  status: string[];
  setParams: (params: Record<string, unknown>) => void;
  resetFilters: () => void;
}

export function UsersTableToolbar({
  table,
  q,
  role,
  status,
  setParams,
  resetFilters,
}: UsersTableToolbarProps) {
  const t = useTranslations('AdminUsers');
  const { searchInput, setSearchInput, isFiltered } = useUsersTableToolbar({
    table,
    q,
    role,
    status,
    setParams,
    resetFilters,
  });

  const roleOptions = ROLE_OPTIONS.map((o) => ({
    label: t(o.labelKey as Parameters<typeof t>[0]),
    value: o.value,
  }));

  const statusOptions = STATUS_OPTIONS.map((o) => ({
    label: t(o.labelKey as Parameters<typeof t>[0]),
    value: o.value,
  }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder={t('search.placeholder')}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        aria-label={t('search.placeholder')}
        className="h-8 w-full max-w-xs"
      />
      <DataTableFacetedFilter
        column={table.getColumn('role')}
        title={t('filters.role')}
        options={roleOptions}
      />
      <DataTableFacetedFilter
        column={table.getColumn('status')}
        title={t('filters.status')}
        options={statusOptions}
      />
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={resetFilters}
          className="h-8 px-2 lg:px-3"
        >
          {t('filters.reset')}
          <X className="ms-2 h-4 w-4" />
        </Button>
      )}
      {/* Column visibility pushed to the right */}
      <div className="ms-auto">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
