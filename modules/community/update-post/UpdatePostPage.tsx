import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  PostForm,
  PostFormSkeleton,
  PostFormError,
} from '@/modules/community/components/post-form';

type UpdatePostPageProps = {
  postId: string;
};

export const UpdatePostPage = ({ postId }: UpdatePostPageProps) => {
  return (
    <ErrorBoundary FallbackComponent={PostFormError}>
      <Suspense fallback={<PostFormSkeleton />}>
        <PostForm mode="update" postId={postId} />
      </Suspense>
    </ErrorBoundary>
  );
};
