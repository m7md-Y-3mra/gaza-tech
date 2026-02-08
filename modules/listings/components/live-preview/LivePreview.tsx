'use client';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { LivePreviewProps } from './types';
import { useLivePreview } from './hooks/useLivePreview';
import { ProductCondition as conditionLabels } from '@/modules/listings/types';
import { LayoutGrid, MapPin } from 'lucide-react';

/**
 * Live preview sidebar component
 * Shows real-time preview of listing as user fills the form
 * Does NOT include seller information as per requirements
 */
const LivePreview: React.FC<LivePreviewProps> = ({
  groupedCategories = [],
  locations = [],
}) => {
  const {
    title,
    description,
    price,
    currency,
    category,
    location,
    productCondition,
    images,
    thumbnailImagePreview,
  } = useLivePreview({ groupedCategories, locations });
  return (
    <div className="border-border bg-card sticky top-4 rounded-2xl p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <Label className="text-foreground text-lg font-bold">
          Live Preview
        </Label>
        <span className="text-primary rounded-full bg-green-100 px-3 py-1 text-xs font-bold">
          LIVE
        </span>
      </div>

      {/* Thumbnail Image */}
      {Boolean(thumbnailImagePreview) ? (
        <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={thumbnailImagePreview}
            alt="Preview"
            className="h-full w-full object-cover"
            width={500}
            height={500}
          />
        </div>
      ) : (
        <div className="bg-muted mb-4 flex aspect-square items-center justify-center rounded-xl">
          <p className="text-muted-foreground text-sm">No image uploaded</p>
        </div>
      )}

      {/* Title */}
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-foreground line-clamp-2 flex-1 text-lg font-bold">
          {title || 'Product Title'}
        </h3>
        {productCondition && (
          <span className="text-muted-foreground ml-2 text-xs">
            {conditionLabels[productCondition as keyof typeof conditionLabels]}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-muted-foreground mb-3 line-clamp-3 text-sm">
        {description || 'Product description will appear here...'}
      </p>

      {/* Price */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-primary text-3xl font-bold">
            {currency === 'ILS' ? '₪' : '$'}
            {price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-4 space-y-2">
        {location && (
          <div className="text-muted-foreground flex items-center text-sm">
            <MapPin className="mr-2 h-5 w-5" />
            <span>{location.label}</span>
          </div>
        )}
        {category && (
          <div className="text-muted-foreground flex items-center text-sm">
            <LayoutGrid className="mr-2 h-5 w-5" />
            <span>{category.label}</span>
          </div>
        )}
      </div>

      {/* Image Count */}
      {images.length > 0 && (
        <div className="border-border border-t pt-4">
          <p className="text-muted-foreground text-xs">
            {images.length} image{images.length > 1 ? 's' : ''} uploaded
          </p>
        </div>
      )}
    </div>
  );
};

export default LivePreview;
