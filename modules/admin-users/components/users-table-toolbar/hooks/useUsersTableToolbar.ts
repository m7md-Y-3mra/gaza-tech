'use client';

import { useState, useEffect } from 'react';
import type { Table } from '@tanstack/react-table';
import type { AdminUser } from '@/modules/admin-users/types';
import { SEARCH_DEBOUNCE_MS } from '@/modules/admin-users/admin-users-page/components/users-table/constants';

interface UseUsersTableToolbarOptions {
  table: Table<AdminUser>;
  q: string;
  role: string[];
  status: string[];
  setParams: (params: Record<string, unknown>) => void;
  resetFilters: () => void;
}

export function useUsersTableToolbar({
  q,
  role,
  status,
  setParams,
  resetFilters,
}: UseUsersTableToolbarOptions) {
  const [searchInput, setSearchInput] = useState(q);

  // Sync searchInput if URL param changes externally (e.g. browser back)
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Debounce search input → write to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== q) {
        setParams({ q: searchInput, page: 0 });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const isFiltered = q.length > 0 || role.length > 0 || status.length > 0;

  return { searchInput, setSearchInput, isFiltered, resetFilters };
}
