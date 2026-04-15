'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { getUsersTableColumns } from '@/modules/admin-users/components/users-table-columns/columns';
import { listAdminUsersAction } from '@/modules/admin-users/actions';
import type {
  AdminUserListResult,
  AdminUserListInput,
  UserRole,
} from '@/modules/admin-users/types';
import { useUsersTableParams } from './useUsersTableParams';
import { SORT_COLUMN_MAP } from '../constants';

interface UseUsersTableOptions {
  initialData: AdminUserListResult;
  currentAdminUserId: string;
}

export function useUsersTable({
  initialData,
  currentAdminUserId,
}: UseUsersTableOptions) {
  const t = useTranslations('AdminUsers');
  const { params, setParams, resetFilters } = useUsersTableParams();
  const [data, setData] = useState<AdminUserListResult>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const abortRef = useRef<AbortController | null>(null);

  // Derive column filters from URL params (role + status)
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (params.role.length > 0)
      filters.push({ id: 'role', value: params.role });
    if (params.status.length > 0)
      filters.push({ id: 'status', value: params.status });
    return filters;
  }, [params.role, params.status]);

  // Map UI statusFilter array → RPC scalar
  function mapStatusFilter(
    status: Array<'active' | 'banned'>
  ): 'active' | 'banned' | 'all' {
    if (status.length === 0 || status.length === 2) return 'all';
    return status[0];
  }

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    const input: AdminUserListInput = {
      pageIndex: params.page,
      pageSize: params.size,
      sortColumn: SORT_COLUMN_MAP[params.sort] ?? 'created_at',
      sortDirection: params.dir,
      search: params.q.trim() || null,
      roleFilter: params.role.length > 0 ? (params.role as UserRole[]) : null,
      statusFilter: mapStatusFilter(params.status),
    };

    const result = await listAdminUsersAction(input);

    if (controller.signal.aborted) return;

    if (result.success) {
      setData(result.data);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  }, [
    params.page,
    params.size,
    params.sort,
    params.dir,
    params.q,
    params.role,
    params.status,
  ]);

  // Re-fetch on URL param changes (excluding cols)
  const depKey = `${params.page}|${params.size}|${params.sort}|${params.dir}|${params.q}|${params.role.join(',')}|${params.status.join(',')}`;

  useEffect(() => {
    fetchData();
    // Reset row selection on any navigation/filter change
    setRowSelection({});
  }, [depKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = useMemo(
    () => getUsersTableColumns(currentAdminUserId, fetchData, t),
    [currentAdminUserId, fetchData, t]
  );

  const sorting: SortingState = [
    { id: params.sort, desc: params.dir === 'desc' },
  ];

  const columnVisibility: VisibilityState = params.cols;

  const table = useReactTable({
    data: data.items,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(data.totalCount / params.size),
    state: {
      pagination: { pageIndex: params.page, pageSize: params.size },
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex: params.page, pageSize: params.size })
          : updater;
      setParams({ page: next.pageIndex, size: next.pageSize });
      setRowSelection({});
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      if (next.length > 0) {
        setParams({
          sort: (next[0].id in SORT_COLUMN_MAP
            ? next[0].id
            : 'created_at') as typeof params.sort,
          dir: next[0].desc ? 'desc' : 'asc',
          page: 0,
        });
      }
      setRowSelection({});
    },
    onColumnFiltersChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnFilters) : updater;
      const newRole =
        (next.find((f) => f.id === 'role')?.value as UserRole[]) ?? [];
      const newStatus =
        (next.find((f) => f.id === 'status')?.value as Array<
          'active' | 'banned'
        >) ?? [];
      setParams({ role: newRole, status: newStatus, page: 0 });
      setRowSelection({});
    },
    onColumnVisibilityChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnVisibility) : updater;
      setParams({ cols: next });
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  return {
    table,
    data,
    isLoading,
    error,
    refetch: fetchData,
    resetFilters,
    setParams,
    params,
  };
}
