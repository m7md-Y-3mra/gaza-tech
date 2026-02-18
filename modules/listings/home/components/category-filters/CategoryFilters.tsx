import { getCategoriesWithoutParentAction } from '@/modules/listings/actions';
import CategoryFiltersClient from './CategoryFiltersClient';

const CategoryFilters = async () => {
  const categoriesResult = await getCategoriesWithoutParentAction();

  // Handle categories
  if (!categoriesResult.success) {
    throw new Error(categoriesResult.message || 'Failed to fetch categories');
  }

  const categories = categoriesResult.data;

  return <CategoryFiltersClient categories={categories} />;
};

export default CategoryFilters;
