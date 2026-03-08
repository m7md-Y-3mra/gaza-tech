import { Metadata } from 'next';
import LoginPage from '@/modules/auth/login';
import { getLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const title = t('login.title');
  const description = t('login.description');

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
  };
}

export default async function Page() {
  return <LoginPage />;
}
