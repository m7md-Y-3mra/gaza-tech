'use client';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Tag } from 'lucide-react';
import Image from 'next/image';
import { LivePreviewProps } from './types';
import { useLivePreview } from './hooks/useLivePreview';
import { ProductCondition as conditionLabels } from '@/modules/listings/types';

/**
 * Live preview sidebar component
 * Shows real-time preview of listing as user fills the form
 * Does NOT include seller information as per requirements
 */
const LivePreview: React.FC<LivePreviewProps> = ({
  categories = [],
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
    thumbnailImage,
  } = useLivePreview({ categories, locations });
  return (
    <div className="border-border bg-card sticky top-4 mb-6 rounded-2xl p-8 shadow-sm">
      <Label className="mb-4 block text-lg font-bold">Live Preview</Label>

      {/* Thumbnail Image */}
      {thumbnailImage ? (
        <div className="mb-4 aspect-video overflow-hidden rounded-lg">
          <Image
            src={thumbnailImage.preview}
            alt="Preview"
            className="h-full w-full object-cover"
            fill
          />
        </div>
      ) : (
        <div className="bg-muted mb-4 flex aspect-video items-center justify-center rounded-lg">
          <p className="text-muted-foreground text-sm">No image uploaded</p>
        </div>
      )}

      {/* Title */}
      <h3 className="mb-2 line-clamp-2 text-xl font-bold">{title}</h3>

      {/* Price */}
      <p className="text-primary mb-3 text-2xl font-bold">
        {currency} {price.toLocaleString()}
      </p>

      {/* Metadata */}
      <div className="mb-4 flex flex-wrap gap-2">
        {productCondition && (
          <Badge variant="secondary">
            {conditionLabels[productCondition as keyof typeof conditionLabels]}
          </Badge>
        )}
        {category && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {category.label}
          </Badge>
        )}
        {location && (
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location.label}
          </Badge>
        )}
      </div>

      {/* Description */}
      <div className="border-t pt-4">
        <Label className="mb-2 block text-sm font-semibold">Description</Label>
        <p className="text-muted-foreground line-clamp-4 text-sm">
          {description}
        </p>
      </div>

      {/* Image Count */}
      {images.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <p className="text-muted-foreground text-xs">
            {images.length} image{images.length > 1 ? 's' : ''} uploaded
          </p>
        </div>
      )}
    </div>
  );
};

export default LivePreview;
