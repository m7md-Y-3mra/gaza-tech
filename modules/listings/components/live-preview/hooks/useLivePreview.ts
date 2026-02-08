import { useFormContext } from 'react-hook-form';
import { UseLivePreviewProps } from '../types';
import { ImageFile } from '@/modules/listings/types';

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
    const thumbnailImagePreview = Boolean(thumbnailImage?.file) ? URL.createObjectURL(thumbnailImage.file) : '';

    return {
        title,
        description,
        price,
        currency,
        category,
        location,
        productCondition,
        images,
        thumbnailImagePreview
    }

}