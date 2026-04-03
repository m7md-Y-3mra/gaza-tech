import { Metadata } from 'next';
import { UpdatePostPage } from '@/modules/community/update-post';
import { getLocale, getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{
    postId: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('editPost.title'),
    description: t('editPost.description'),
  };
}

export default async function Page({ params }: PageProps) {
  const { postId } = await params;
  return <UpdatePostPage postId={postId} />;
}
