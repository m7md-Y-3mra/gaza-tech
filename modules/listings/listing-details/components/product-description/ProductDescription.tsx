import type { ProductDescriptionProps } from './types';
import { getTranslations } from 'next-intl/server';

const ProductDescription = async ({ description }: ProductDescriptionProps) => {
  const t = await getTranslations('ListingDetails.ProductDescription');

  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      {/* Section Title */}
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      {/* Description Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ProductDescription;
