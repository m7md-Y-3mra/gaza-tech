import { notFound } from 'next/navigation';
import { getCommunityPostDetailAction } from '@/modules/community/actions';
import { PostDetailView } from '@/modules/community/post-detail';

export default async function PostDetailRoutePage({
  params,
}: {
  params: Promise<{ locale: string; postId: string }>;
}) {
  const { postId } = await params;

  const result = await getCommunityPostDetailAction({ post_id: postId });
  if (!result.success || !result.data) {
    notFound();
  }

  return <PostDetailView post={result.data} />;
}
