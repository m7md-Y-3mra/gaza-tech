'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useQueryState, debounce } from 'nuqs';
import { listingsSearchParams } from '../../search-params';
import { useTranslations } from 'next-intl';

const SearchBar = () => {
  const t = useTranslations('ListingsHome.SearchBar');
  const [searchParam, setSearchParam] = useQueryState(
    'search',
    listingsSearchParams.search.withOptions({ shallow: false })
  );
  const onSearchChange = (value: string) => {
    setSearchParam(value, {
      // Send immediate update if resetting, otherwise debounce at 500ms
      limitUrlUpdates: value === '' ? undefined : debounce(500),
    });
  };

  return (
    <section className="py-4">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2 transform md:size-5" />
        <Input
          type="text"
          placeholder={t('placeholder')}
          className="border-border h-12 rounded-xl border-2 bg-white pl-10 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-0 md:h-14 md:pl-12 md:text-base"
          value={searchParam}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </section>
  );
};

export default SearchBar;
