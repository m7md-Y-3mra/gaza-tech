import { Skeleton } from '@/components/ui/skeleton';

export const CategoryFiltersSkeleton = () => {
  return (
    <section className="border-border border-b py-4">
      <div className="scrollbar-hide-touch flex items-center space-x-2 overflow-x-auto pb-2">
        {/* Base (Mobile): 4 items */}
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={`base-${i}`}
            className="h-11 w-24 shrink-0 rounded-full"
          />
        ))}

        {/* Tablet: Add 3 more (Total 7) */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={`tablet-${i}`}
            className="hidden h-11 w-24 shrink-0 rounded-full md:block" // Visible on md and up
          />
        ))}

        {/* Desktop: Add 3 more (Total 10) */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={`desktop-${i}`}
            className="hidden h-11 w-24 shrink-0 rounded-full lg:block" // Visible on lg and up
          />
        ))}
      </div>
    </section>
  );
};
