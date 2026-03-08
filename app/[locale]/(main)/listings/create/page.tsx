import { Metadata } from 'next';
import CreateListingPage from '@/modules/listings/create-listing';
import { getLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const title = t('createListing.title');
  const description = t('createListing.description');

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

export default function Page() {
  return <CreateListingPage />;
}
