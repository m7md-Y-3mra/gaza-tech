import { isNew } from '@/modules/listings/utils/is-new';
import { ProductBadgeProps } from './types';

const ProductBadge = ({ productCondition }: ProductBadgeProps) => {
  const isNewProduct = isNew(productCondition);

  if (!isNewProduct) {
    return null;
  }

  return (
    <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium shadow-sm">
      {productCondition}
    </span>
  );
};

export default ProductBadge;
