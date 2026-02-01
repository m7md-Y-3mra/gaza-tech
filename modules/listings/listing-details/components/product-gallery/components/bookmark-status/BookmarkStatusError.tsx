'use client';

import { AlertCircle } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';

const BookmarkStatusError = ({ error }: FallbackProps) => {
  return (
    <div
      className="bg-background/80 rounded-full p-2 opacity-50 shadow-sm backdrop-blur-sm"
      title="Failed to load bookmark status"
    >
      <AlertCircle className="text-destructive size-5" />
    </div>
  );
};

export default BookmarkStatusError;
