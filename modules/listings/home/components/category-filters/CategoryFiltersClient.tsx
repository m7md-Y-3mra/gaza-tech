'use client';
import { Button } from '@/components/ui/button';
import { FC } from 'react';
import { CategoryFiltersClientProps } from './types';
import { categoryIconMap } from './constant';

const CategoryFilters: FC<CategoryFiltersClientProps> = ({
  categories: categoriesRes,
}) => {
  const categories = categoriesRes.map((category) => ({
    id: category.marketplace_category_id,
    label: category.name,
    icon: categoryIconMap[category.name] || null,
  }));
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
