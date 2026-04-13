'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

interface ReportedPostProps {
  post: any;
}

const ReportedPost: React.FC<ReportedPostProps> = ({ post }) => {
  if (!post) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.author?.avatar_url || ''} />
          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{post.author?.first_name} {post.author?.last_name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(post.created_at), 'PPP')}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-lg font-bold">{post.title}</h4>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.attachments && post.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {post.attachments.map((att: any, idx: number) => (
            <div key={idx} className="relative group">
              {att.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={att.file_url}
                  alt={`Attachment ${idx + 1}`}
                  className="h-24 w-24 rounded-md object-cover border"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-md border bg-muted">
                  <Paperclip className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportedPost;
