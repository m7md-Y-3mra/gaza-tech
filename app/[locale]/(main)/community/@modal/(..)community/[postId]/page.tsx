// import { Suspense } from 'react';
// import { PostDetailModalSkeleton } from '@/modules/community/components/post-detail-modal/components/post-detail-modal-skeleton/PostDetailModalSkeleton';
// import ServerPage from './ServerPage';

// export default async function PostDetailModalPage({
//   params,
// }: {
//   params: Promise<{ locale: string; postId: string }>;
// }) {
//   return (
//     <Suspense fallback={<PostDetailModalSkeleton />}>
//       <ServerPage params={params} />
//     </Suspense>
//   );
// }

import { getCommunityPostDetailAction } from '@/modules/community/actions';
import { PostDetailModal } from '@/modules/community/components/post-detail-modal';
export default async function PostDetailModalPage({
  params,
}: {
  params: Promise<{ locale: string; postId: string }>;
}) {
  const { postId } = await params;

  const result = getCommunityPostDetailAction({ post_id: postId });

  return (
    // <Suspense fallback={<PostDetailModalSkeleton />}>
    <PostDetailModal data={result} />
    // </Suspense>
  );
}
