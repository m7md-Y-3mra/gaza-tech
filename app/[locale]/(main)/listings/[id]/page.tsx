import { Metadata } from 'next';
import ListingDetailsPage from '@/modules/listings/listing-details';
import { getListingDetailsAction } from '@/modules/listings/actions';
import { getLocale } from 'next-intl/server';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const res = await getListingDetailsAction(id);
  const listing = res.success ? res.data : null;

  if (!listing) {
    return {
      title: 'Listing Not Found',
      description: 'The requested listing could not be found.',
    };
  }

  const title = `${listing.title} - ${listing.price} ${listing.currency}`;
  const description = listing.description.substring(0, 160);
  const images = listing.listing_images.slice(0, 4);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: images.map((img) => img.image_url),
      type: 'website',
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
      siteName: 'Gaza Tech',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((img) => img.image_url),
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ListingDetailsPage id={id} />;
}
