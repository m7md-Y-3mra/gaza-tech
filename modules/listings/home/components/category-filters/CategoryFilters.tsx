import { Button } from '@/components/ui/button';
import {
  Laptop,
  Smartphone,
  Tablet,
  Headphones,
  Camera,
  Gamepad2,
  Tv,
  Keyboard,
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All', icon: null },
  { id: 'laptops', label: 'Laptops', icon: Laptop },
  { id: 'phones', label: 'Phones', icon: Smartphone },
  { id: 'tablets', label: 'Tablets', icon: Tablet },
  { id: 'audio', label: 'Audio', icon: Headphones },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'tvs', label: 'TVs', icon: Tv },
  { id: 'accessories', label: 'Accessories', icon: Keyboard },
];

const CategoryFilters = () => {
  return (
    <section className="border-border border-b py-4">
      <div className="scrollbar-hide-touch flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = category.id === 'all';

          return (
            <Button
              key={category.id}
              variant={isSelected ? 'default' : 'outline'}
              className={`h-11 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'shadow-sm hover:shadow-md'
                  : 'text-foreground hover:text-primary hover:border-primary hover:bg-background! border-2'
              }`}
            >
              {Icon && <Icon className="size-4" />}
              {/* Fallback to hardcoded label if translation is missing for now */}
              {category.label}
            </Button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryFilters;
