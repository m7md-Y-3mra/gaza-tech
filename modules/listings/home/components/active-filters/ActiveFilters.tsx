'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { serializeListingsSearchParams } from '../../search-params';
import { FC, useRef } from 'react';
import { ActiveFiltersProps } from './types';
import { usePathname, useRouter } from 'next/navigation';

const activeFilters = [
  { id: 1, label: 'Price: $500 - $1000' },
  { id: 2, label: 'Condition: New' },
  { id: 3, label: 'Location: Gaza City' },
];

const ActiveFilters: FC<ActiveFiltersProps> = ({ searchParams }) => {
  const router = useRouter();
  const pathname = usePathname();
  const conditions = useRef(searchParams.conditions);
  const handleRemoveConditions = (id: string) => {
    conditions.current = conditions.current.filter((c) => c !== id);
    const url = serializeListingsSearchParams(pathname, {
      ...searchParams,
      conditions: conditions.current,
    });
    console.log({ url });
    router.push(url);
  };
  return (
    <section className="flex flex-wrap items-center gap-2 pb-6">
      <span className="text-foreground text-sm font-medium">
        Active Filters:
      </span>

      {searchParams.conditions.map((filter, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="text-primary bg-active-filter-background border-active-filter-border flex items-center space-x-2 rounded-full border px-3 py-1.5 text-xs font-semibold sm:text-sm"
        >
          Condition {filter}
          <button
            className="text-muted-foreground hover:text-foreground ring-offset-background focus:ring-ring ml-1 rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none"
            onClick={() => handleRemoveConditions(filter)}
          >
            <X className="size-3" />
            <span className="sr-only">Remove {filter} filter</span>
          </button>
        </Badge>
      ))}

      <Button
        variant="link"
        size="sm"
        // onClick={handleReset}
        className="text-destructive h-auto p-0 px-2 text-xs hover:no-underline hover:opacity-70 sm:text-sm"
      >
        Clear all
      </Button>
    </section>
  );
};

export default ActiveFilters;
