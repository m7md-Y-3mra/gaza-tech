import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const activeFilters = [
  { id: 1, label: 'Price: $500 - $1000' },
  { id: 2, label: 'Condition: New' },
  { id: 3, label: 'Location: Gaza City' },
];

export const ActiveFilters = () => {
  return (
    <section className="flex flex-wrap items-center gap-2 pb-6">
      <span className="text-foreground text-sm font-medium">
        Active Filters:
      </span>

      {activeFilters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="text-primary bg-active-filter-background border-active-filter-border flex items-center space-x-2 rounded-full border px-3 py-1.5 text-xs font-semibold sm:text-sm"
        >
          {filter.label}
          <button className="text-muted-foreground hover:text-foreground ring-offset-background focus:ring-ring ml-1 rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none">
            <X className="size-3" />
            <span className="sr-only">Remove {filter.label} filter</span>
          </button>
        </Badge>
      ))}

      <Button
        variant="link"
        size="sm"
        className="text-destructive h-auto p-0 px-2 text-xs hover:no-underline hover:opacity-70 sm:text-sm"
      >
        Clear all
      </Button>
    </section>
  );
};
