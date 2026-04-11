import type { TopLevelComment, CommentNode } from '@/modules/community/types';

export type CommentSectionProps = {
  postId: string;
  commentCount: number;
};

export type CommentSectionState = {
  comments: TopLevelComment[];
  hasMore: boolean;
  currentPage: number;
  isLoading: boolean;
  replyingTo: { commentId: string; authorName: string } | null;
  editingCommentId: string | null;
};

export type CommentInputProps = {
  postId: string;
  onSubmit: (content: string, parentCommentId?: string) => Promise<void>;
  replyingTo: { commentId: string; authorName: string } | null;
  onCancelReply: () => void;
  isSubmitting: boolean;
};

export type CommentItemProps = {
  comment: CommentNode;
  isReply?: boolean;
  currentUserId: string | null;
  onReply?: (commentId: string, authorName: string) => void;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onToggleLike: (commentId: string) => Promise<void>;
  isEditing: boolean;
  onStartEdit: (commentId: string) => void;
  onCancelEdit: () => void;
};

export type CommentListProps = {
  comments: TopLevelComment[];
  currentUserId: string | null;
  onReply: (commentId: string, authorName: string) => void;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onToggleLike: (commentId: string) => Promise<void>;
  editingCommentId: string | null;
  onStartEdit: (commentId: string) => void;
  onCancelEdit: () => void;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};
