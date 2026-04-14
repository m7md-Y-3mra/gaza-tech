'use client';

import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  parseAsArrayOf,
  parseAsJson,
  useQueryStates,
} from 'nuqs';
import { ROLES } from '@/config/rbac';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '@/modules/admin-users/admin-users-page/components/users-table/constants';
import type { SortColumn } from '@/modules/admin-users/types';

const SORT_COLUMNS: SortColumn[] = [
  'name',
  'role',
  'status',
  'is_verified',
  'created_at',
  'last_activity_at',
];

export function useUsersTableParams() {
  const [params, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(0),
      size: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
      sort: parseAsStringEnum<SortColumn>(SORT_COLUMNS).withDefault(
        'created_at'
      ),
      dir: parseAsStringEnum<'asc' | 'desc'>(['asc', 'desc']).withDefault(
        'desc'
      ),
      q: parseAsString.withDefault(''),
      role: parseAsArrayOf(parseAsStringEnum([...ROLES])).withDefault([]),
      status: parseAsArrayOf(
        parseAsStringEnum<'active' | 'banned'>(['active', 'banned'])
      ).withDefault([]),
      cols: parseAsJson<Record<string, boolean>>((v) =>
        typeof v === 'object' && v !== null && !Array.isArray(v)
          ? (v as Record<string, boolean>)
          : null
      ).withDefault({}),
    },
    { shallow: true }
  );

  // Validate pageSize against allowed options; fallback to default
  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(
    params.size
  )
    ? (params.size as (typeof PAGE_SIZE_OPTIONS)[number])
    : DEFAULT_PAGE_SIZE;

  function resetFilters() {
    setParams({ q: '', role: [], status: [], page: 0 });
  }

  return {
    params: { ...params, size: pageSize },
    setParams,
    resetFilters,
  };
}
