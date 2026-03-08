import { useFormContext } from 'react-hook-form';
import { UseLivePreviewProps } from '../types';
import { ImageFile } from '@/modules/listings/components/listing-form/types';

export const useLivePreview = ({
  groupedCategories,
  locations,
}: UseLivePreviewProps) => {
  const { watch } = useFormContext();

  const title = watch('title');
  const description = watch('description');
  const price = watch('price');
  const currency = watch('currency');
  const categoryId = watch('category_id');
  const locationId = watch('location_id');
  const productCondition = watch('product_condition');
  const images: ImageFile[] = watch('images', []);

  // Find category from grouped categories
  // Need to search through all children in all groups
  const category = groupedCategories
    ?.flatMap((group) => group.children)
    .find((c) => c.value === categoryId);

  const location = locations?.find((l) => l.value === locationId);

  const thumbnailImage = images.find((img) => img.isThumbnail) || images[0];

  const thumbnailImagePreview = thumbnailImage?.preview ?? '';

  return {
    title,
    description,
    price,
    currency,
    category,
    location,
    productCondition,
    images,
    thumbnailImagePreview,
  };
};
