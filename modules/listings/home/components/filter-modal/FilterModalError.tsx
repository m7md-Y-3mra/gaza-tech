'use client';

import { useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { toast } from 'sonner';

/**
 * Error boundary for FilterModal.
 * Since the modal is hidden, we don't render an error UI in the DOM,
 * but we toast the user so they know why filters might not work.
 */
export const FilterModalError = ({ error }: FallbackProps) => {
  useEffect(() => {
    console.error('FilterModal failed to load:', error);
    toast.error('Failed to load filter options. Please refresh the page.');
  }, [error]);

  return null;
};
