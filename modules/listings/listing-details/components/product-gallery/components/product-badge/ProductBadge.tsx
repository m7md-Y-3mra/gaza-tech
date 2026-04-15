import { isNew } from '@/modules/listings/utils/is-new';
import { ProductBadgeProps } from './types';
import { getTranslations } from 'next-intl/server';

const ProductBadge = async ({ productCondition }: ProductBadgeProps) => {
  const isNewProduct = isNew(productCondition);

  if (!isNewProduct) {
    return null;
  }

  const t = await getTranslations('ListingForm');
  const conditionLabel = t(`condition.${productCondition}`);

  return (
    <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium shadow-sm">
      {conditionLabel}
    </span>
  );
};

export default ProductBadge;
