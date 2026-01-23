import type { ProductDescriptionProps } from './types';

const ProductDescription = ({ description }: ProductDescriptionProps) => {
  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      {/* Section Title */}
      <h2 className="text-xl font-semibold">Product Description</h2>

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
