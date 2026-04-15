'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface CommentAuthor {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

interface CommentData {
  author?: CommentAuthor;
  content?: string;
  created_at: string;
  community_posts?: { title?: string };
}

interface ReportedCommentProps {
  comment: CommentData;
}

const ReportedComment: React.FC<ReportedCommentProps> = ({ comment }) => {
  if (!comment) return null;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author?.avatar_url || ''} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">
            {comment.author?.first_name} {comment.author?.last_name}
          </p>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(comment.created_at), 'PPP')}</span>
          </div>
        </div>
      </div>

      <div className="bg-muted/20 rounded-md border p-4">
        <div className="text-muted-foreground mb-2 flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Comment:</span>
        </div>
        <p className="text-sm leading-relaxed">{comment.content}</p>
      </div>

      {comment.community_posts && (
        <div className="border-t pt-2">
          <p className="text-muted-foreground mb-1 text-[10px] font-bold uppercase">
            On Post:
          </p>
          <p className="line-clamp-1 text-sm font-medium">
            {comment.community_posts.title}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportedComment;
