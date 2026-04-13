'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ReportedCommentProps {
  comment: any;
}

const ReportedComment: React.FC<ReportedCommentProps> = ({ comment }) => {
  if (!comment) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author?.avatar_url || ''} />
          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{comment.author?.first_name} {comment.author?.last_name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(comment.created_at), 'PPP')}</span>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-muted/20 p-4">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Comment:</span>
        </div>
        <p className="text-sm leading-relaxed">{comment.content}</p>
      </div>

      {comment.community_posts && (
        <div className="pt-2 border-t">
          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">On Post:</p>
          <p className="text-sm font-medium line-clamp-1">{comment.community_posts.title}</p>
        </div>
      )}
    </div>
  );
};

export default ReportedComment;
