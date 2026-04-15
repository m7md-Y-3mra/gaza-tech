import { getCommunityFeedAction } from '@/modules/community/actions';
import { PostCard } from '@/modules/community/components/post-card';
import { PostDetailProvider } from '@/modules/community/components/post-detail-context';
import { getTranslations } from 'next-intl/server';

export async function CommunityHighlights() {
  const t = await getTranslations('HomePage');
  const result = await getCommunityFeedAction({
    page: 1,
    limit: 3,
  });

  if (!result.success || !result.data?.data || result.data.data.length === 0) {
    return (
      <div className="border-muted-foreground/25 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground">{t('emptyPosts')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <PostDetailProvider>
        {result.data.data.map((post) => (
          <PostCard key={post.post_id} post={post} />
        ))}
      </PostDetailProvider>
    </div>
  );
}
