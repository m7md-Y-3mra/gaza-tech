import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { CommunityFeedPage } from '@/modules/community/community-feed';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'CommunityFeed' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function Page({ searchParams }: PageProps) {
  return <CommunityFeedPage searchParams={searchParams} />;
}
