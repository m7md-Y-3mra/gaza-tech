import type { FeedPost, PostCategory } from '@/modules/community/types';

export type PostCardProps = {
  post: FeedPost;
  onOpenComments: (postId: string) => void;
};

export type CategoryColors = {
  bg: string;
  text: string;
};

export type CategoryColorMap = Record<PostCategory, CategoryColors>;
