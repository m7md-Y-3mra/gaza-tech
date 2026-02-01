import { Skeleton } from '@/components/ui/skeleton';

const BookmarkStatusSkeleton = () => {
  return (
    <div className="bg-background/80 rounded-full p-2 shadow-sm backdrop-blur-sm">
      <Skeleton className="size-5 rounded-full" />
    </div>
  );
};

export default BookmarkStatusSkeleton;
