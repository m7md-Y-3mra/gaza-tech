import { PostFormClient } from './PostFormClient';
import { PostFormProps, PostFormInitialData } from './types';
import { getCommunityPostDetailsAction } from '@/modules/community/actions';
import { notFound } from 'next/navigation';
import { authHandler } from '@/utils/auth-handler';
import type {
  PostCategory,
  CommunityPostAttachment,
} from '@/modules/community/types';

export const PostForm = async ({ mode = 'create', postId }: PostFormProps) => {
  if (mode === 'create') {
    return <PostFormClient mode="create" />;
  }

  if (mode === 'update' && postId) {
    const response = await getCommunityPostDetailsAction(postId);

    if (!response.success || !response.data) {
      notFound();
    }

    const post = response.data;

    // Author ownership check — throw so ErrorBoundary shows PostFormError
    const user = await authHandler();
    if (post.author_id !== user.id) {
      throw new Error('You are not authorized to edit this post');
    }

    const initialData: PostFormInitialData = {
      title: post.title,
      content: post.content,
      post_category: post.post_category as PostCategory,
      attachments: post.community_posts_attachments.map(
        (att: CommunityPostAttachment) => ({
          id: att.attachment_id,
          preview: att.file_url,
          isThumbnail: false,
          isExisting: true as const,
        })
      ),
    };

    return (
      <PostFormClient mode="update" postId={postId} initialData={initialData} />
    );
  }

  return null;
};
