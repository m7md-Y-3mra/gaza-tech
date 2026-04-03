import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  PostForm,
  PostFormSkeleton,
  PostFormError,
} from '@/modules/community/components/post-form';

export const CreatePostPage = () => {
  return (
    <ErrorBoundary FallbackComponent={PostFormError}>
      <Suspense fallback={<PostFormSkeleton />}>
        <PostForm mode="create" />
      </Suspense>
    </ErrorBoundary>
  );
};
