'use client';

import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { CATEGORY_TABS } from './constants';
import { useFeedFilters } from './hooks/useFeedFilters';

interface FeedFiltersProps {
  className?: string;
}

export function FeedFilters({ className }: FeedFiltersProps) {
  const t = useTranslations('CommunityFeed');
  const { category, searchInput, setSearchInput, setCategory } =
    useFeedFilters();

  return (
    <div className={className}>
      {/* Category tabs — horizontally scrollable */}
      <div className="scrollbar-none -mx-4 overflow-x-auto px-4">
        <div
          className="flex gap-2"
          role="tablist"
          aria-label={t('filters.categoryLabel')}
          style={{ minWidth: 'max-content' }}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = category === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setCategory(tab.value)}
                className={`focus-visible:ring-ring shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t(tab.labelKey as Parameters<typeof t>[0])}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search input */}
      <div className="relative mt-4">
        <Search
          className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t('filters.searchPlaceholder')}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border ps-10 pe-10 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label={t('filters.searchPlaceholder')}
        />
        {/* {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput('')}
            className="text-muted-foreground hover:text-foreground absolute end-3 top-1/2 -translate-y-1/2"
            aria-label={t('filters.clearSearch')}
          >
            <X className="h-4 w-4" />
          </button>
        )} */}
      </div>
    </div>
  );
}
