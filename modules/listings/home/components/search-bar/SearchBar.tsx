import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const SearchBar = () => {
  return (
    <section className="py-4">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2 transform md:size-5" />
        <Input
          type="text"
          placeholder="Search for products, brands, or sellers..."
          className="border-border h-12 rounded-xl border-2 bg-white pl-10 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-0 md:h-14 md:pl-12 md:text-base"
        />
      </div>
    </section>
  );
};

export default SearchBar;
