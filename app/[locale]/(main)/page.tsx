'use client';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <div className="bg-background flex min-h-screen items-center justify-center font-sans">
      {t('title')}
    </div>
  );
}
