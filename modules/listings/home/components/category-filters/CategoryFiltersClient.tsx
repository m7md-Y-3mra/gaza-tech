'use client';

import { Button } from '@/components/ui/button';
import { FC } from 'react';
import { CategoryFiltersClientProps } from './types';
import { categoryIconMap } from './constant';
import { useQueryState } from 'nuqs';
import { listingsSearchParams } from '../../search-params';
import { useTranslations } from 'next-intl';
import { CategoryType } from '@/modules/listings/types';

const CategoryFilters: FC<CategoryFiltersClientProps> = ({
  categories: categoriesRes,
}) => {
  const t = useTranslations('ListingsHome.CategoryFilters');
  const [selectedCategories, setSelectedCategories] = useQueryState(
    'categories',
    listingsSearchParams.categories.withOptions({
      shallow: false, // proper server fetch
    })
  );

  const categories = [
    {
      id: 'all',
      label: t('all'),
      icon: null,
    },
    ...categoriesRes.map((category) => ({
      id: category.marketplace_category_id,
      label: category.name,
      icon: categoryIconMap[category.name as CategoryType] || null,
    })),
  ];

  const handleCategoryClick = (id: string) => {
    if (id === 'all') {
      setSelectedCategories(null); // Clear filters
      return;
    }

    const current = selectedCategories || [];
    if (current.includes(id)) {
      // Remove
      const next = current.filter((c) => c !== id);
      setSelectedCategories(next.length > 0 ? next : null);
    } else {
      // Add
      setSelectedCategories([...current, id]);
    }
  };

  return (
    <section className="border-border border-b py-4">
      <div className="scrollbar-hide-touch flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected =
            category.id === 'all'
              ? !selectedCategories || selectedCategories.length === 0
              : (selectedCategories || []).includes(category.id);

          return (
            <Button
              key={category.id}
              variant={isSelected ? 'default' : 'outline'}
              className={`h-11 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'shadow-sm hover:shadow-md'
                  : 'text-foreground hover:text-primary hover:border-primary hover:bg-background! border-2'
              }`}
              onClick={() => handleCategoryClick(category.id)}
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
