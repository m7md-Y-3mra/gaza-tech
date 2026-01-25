import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { ProductCardProps } from './types';

const ProductCard = ({
  id,
  title,
  price,
  currency,
  imageUrl,
  productCondition,
  locationName,
}: ProductCardProps) => {
  const currencySymbol = currency === 'USD' ? '$' : '₪';
  const formattedPrice = `${currencySymbol}${price.toLocaleString()}`;

  const isNew = ['new', 'like new', 'brand new', 'good'].includes(
    productCondition.toLowerCase()
  );

  return (
    <Link href={`/listings/${id}`} className="group block">
      <div className="bg-card overflow-hidden rounded-lg border transition-shadow hover:shadow-lg">
        {/* Image */}
        <div className="bg-muted relative aspect-video">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isNew && (
            <span className="bg-primary text-primary-foreground absolute top-2 left-2 rounded-full px-2 py-1 text-xs font-medium">
              NEW
            </span>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2 p-4">
          <h3 className="group-hover:text-primary line-clamp-2 font-semibold transition-colors">
            {title}
          </h3>
          <p className="text-primary text-lg font-bold">{formattedPrice}</p>
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{locationName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
