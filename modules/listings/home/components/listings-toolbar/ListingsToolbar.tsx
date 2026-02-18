'use client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { ListingsToolbarProps } from './types';
import { useFilterOpen } from '../../providers/FilterOpenProvider';
import { useQueryState } from 'nuqs';
import { listingsSearchParams } from '../../search-params';

const ListingsToolbar = ({}: ListingsToolbarProps) => {
  const { openFilter } = useFilterOpen();
  const [sortBy, setSortBy] = useQueryState(
    'sortBy',
    listingsSearchParams.sortBy.withOptions({ shallow: false })
  );
  const [sortOrder, setSortOrder] = useQueryState(
    'sortOrder',
    listingsSearchParams.sortOrder.withOptions({ shallow: false })
  );

  const onSortByChange = (value: string) => {
    setSortBy(value);
  };

  const onSortOrderChange = (value: 'asc' | 'desc') => {
    setSortOrder(value);
  };
  return (
    <section className="flex flex-row flex-wrap items-center justify-between gap-2 py-4 sm:gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="text-foreground hover:border-primary hover:bg-background! h-10 gap-2 border-2"
          onClick={openFilter}
        >
          <SlidersHorizontal className="size-4" />
          <span>Filters</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select defaultValue={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="bg-background hover:border-primary h-10! rounded-lg border-2 sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Created At</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue={sortOrder} onValueChange={onSortOrderChange}>
          <SelectTrigger className="bg-background hover:border-primary h-10! rounded-lg border-2 sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>

        <div className="bg-background flex items-center rounded-lg border-2 p-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary bg-primary h-8 w-8 rounded-md"
          >
            <LayoutGrid className="text-primary-foreground size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary hover:bg-background! h-8 w-8 rounded-md"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ListingsToolbar;
