import { getTranslations, setRequestLocale } from 'next-intl/server';

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
