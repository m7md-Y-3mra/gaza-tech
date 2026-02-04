import { useFormContext } from 'react-hook-form';
import type { ImageFile } from '@/modules/listings/components/image-upload/types';
import { UseLivePreviewProps } from '../types';
import { ProductCondition } from '@/modules/listings/types';

export const useLivePreview = ({ categories, locations }: UseLivePreviewProps) => {
    const { watch } = useFormContext();

    const title = watch('title', "Product Title");
    const description =
        watch('description', 'Product description will appear here...');
    const price = watch('price', 0);
    const currency = watch('currency', 'ILS');
    const categoryId = watch('category_id');
    const locationId = watch('location_id');
    const productCondition = watch('product_condition');
    const images: ImageFile[] = watch('images', []);

    const category = categories?.find((c) => c.value === categoryId);
    const location = locations?.find((l) => l.value === locationId);

    const thumbnailImage = images.find((img) => img.isThumbnail) || images[0];

    return {
        title,
        description,
        price,
        currency,
        category,
        location,
        productCondition,
        images,
        thumbnailImage,
    }

}