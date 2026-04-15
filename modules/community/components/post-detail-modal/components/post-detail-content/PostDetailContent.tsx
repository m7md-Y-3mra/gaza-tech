'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { FeedAttachment } from '@/modules/community/types';

type PostDetailContentProps = {
  content: string;
  attachments: FeedAttachment[];
};

export function PostDetailContent({
  content,
  attachments,
}: PostDetailContentProps) {
  return (
    <div className="space-y-4">
      <p
        dir="auto"
        className="text-foreground text-base leading-relaxed break-words whitespace-pre-wrap"
      >
        {content}
      </p>

      {attachments && attachments.length > 0 && (
        <div
          className={cn(
            'grid gap-2',
            attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          )}
        >
          {attachments.map((attachment) => (
            <div
              key={attachment.attachment_id}
              className="bg-muted relative aspect-video overflow-hidden rounded-lg border"
            >
              <Image
                src={attachment.file_url}
                alt="Attachment"
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="(max-width: 640px) 100vw, 600px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
