import { BannedPage } from '@/modules/user/banned-page';
import { setRequestLocale } from 'next-intl/server';

type Params = Promise<{ locale: string }>;

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <BannedPage locale={locale} />;
}
