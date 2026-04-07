import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { getCommunityFeedAction } from '@/modules/community/actions';
import { communityFeedSearchCache } from './search';
import { FeedList } from './components/feed-list';
import { FeedFilters } from './components/feed-filters';
import { CreatePostFab } from './components/create-post-fab';
import type { PostCategory } from '@/modules/community/types';

interface CommunityFeedPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function CommunityFeedPage({
  searchParams,
}: CommunityFeedPageProps) {
  const t = await getTranslations('CommunityFeed');
  const { category, q } = communityFeedSearchCache.parse(await searchParams);

  // SSR initial batch
  const firstPage = await getCommunityFeedAction({
    page: 1,
    limit: 10,
    category: (category as PostCategory) || undefined,
    search: q || undefined,
  });

  if (!firstPage.success || !firstPage.data) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-lg font-semibold">{t('errorState.title')}</h2>
        <Button asChild className="mt-4">
          <Link href="/community">{t('errorState.retry')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="container space-y-6 py-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
        <Button asChild className="hidden md:inline-flex">
          <Link href="/community/create">{t('createPost')}</Link>
        </Button>
      </div>

      <FeedFilters />

      <FeedList
        initialItems={firstPage.data.data}
        initialHasMore={firstPage.data.has_more}
        ssrFilters={{ category: (category as PostCategory) || '', q: q || '' }}
      />

      <CreatePostFab />
    </section>
  );
}
