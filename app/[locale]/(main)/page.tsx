import { Metadata } from 'next';
import { getTranslations, setRequestLocale, getLocale } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const title = t('home.title');
  const description = t('home.description');

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
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations('HomePage');
  return (
    <div className="bg-background flex min-h-screen items-center justify-center font-sans">
      {t('title')}
    </div>
  );
}
