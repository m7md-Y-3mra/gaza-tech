import { Metadata } from 'next';
import { CreatePostPage } from '@/modules/community/create-post';
import { getLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('createPost.title'),
    description: t('createPost.description'),
  };
}

export default function Page() {
  return <CreatePostPage />;
}
