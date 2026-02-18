import { getCategoriesWithoutParentAction } from '@/modules/listings/actions';
import CategoryFiltersClient from './CategoryFiltersClient';
import { getLocale } from 'next-intl/server';

const CategoryFilters = async () => {
  const categoriesResult = await getCategoriesWithoutParentAction();

  // Handle categories
  if (!categoriesResult.success) {
    throw new Error(categoriesResult.message || 'Failed to fetch categories');
  }

  const locale = await getLocale();
  const isAr = locale === 'ar';

  const categories = categoriesResult.data.map((cat) => ({
    ...cat,
    name: isAr ? cat.name_ar : cat.name,
  }));

  return <CategoryFiltersClient categories={categories} />;
};

export default CategoryFilters;
