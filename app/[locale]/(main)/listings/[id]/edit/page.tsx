import { Metadata } from 'next';
import UpdateListingPage from '@/modules/listings/update-listing';
import { getListingDetailsAction } from '@/modules/listings/actions';
import { getLocale, getTranslations } from 'next-intl/server';

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
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const res = await getListingDetailsAction(id);
  const listing = res.success ? res.data : null;

  if (!listing) {
    return {
      title: t('listingDetails.notFoundTitle'),
      description: t('listingDetails.notFoundDescription'),
    };
  }

  const title = t('editListing.title', { title: listing.title });
  const description = t('editListing.description');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
      siteName: t('siteName'),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <UpdateListingPage id={id} />;
}
