import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SlidersHorizontal, LayoutGrid, List } from 'lucide-react';

export const ListingsToolbar = () => {
  return (
    <section className="flex flex-row flex-wrap items-center justify-between gap-2 py-4 sm:gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="hover:border-primary hover:bg-background! h-10 gap-2 border-2"
        >
          <SlidersHorizontal className="size-4" />
          <span>Filters</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select defaultValue="newest">
          <SelectTrigger className="bg-background hover:border-primary h-10! rounded-lg border-2 sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest Listed</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
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
