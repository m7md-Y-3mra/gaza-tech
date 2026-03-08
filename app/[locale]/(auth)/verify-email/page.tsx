import { Metadata } from 'next';
import VerifyEmailPage from '@/modules/auth/verify-email';
import { getLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const title = t('verifyEmail.title');
  const description = t('verifyEmail.description');

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
      follow: false,
    },
  };
}

export default VerifyEmailPage;
