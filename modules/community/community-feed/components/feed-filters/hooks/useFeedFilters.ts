'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import type { PostCategory } from '@/modules/community/types';

export function useFeedFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      category: parseAsString.withDefault(''),
      q: parseAsString.withDefault(''),
    },
    { shallow: true }
  );

  // Local input value for debounced search
  const [searchInput, setSearchInput] = useState(filters.q);

  // Sync local input when URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  // 300ms debounce for search; immediate on clear (FR-005)
  useEffect(() => {
    if (searchInput === '') {
      // Immediate update on clear
      if (filters.q !== '') {
        setFilters({ q: '' });
      }
      return;
    }

    const timer = setTimeout(() => {
      setFilters({ q: searchInput });
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const setCategory = useCallback(
    (value: PostCategory | '') => {
      setFilters({ category: value });
    },
    [setFilters]
  );

  return {
    category: filters.category as PostCategory | '',
    q: filters.q,
    searchInput,
    setSearchInput,
    setCategory,
  };
}
