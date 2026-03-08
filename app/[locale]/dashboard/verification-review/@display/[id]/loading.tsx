export default function DisplayLoading() {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="flex-1 space-y-6 p-4">
        {/* Personal Details skeleton */}
        <section>
          <div className="mb-3 h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-1.5 h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </section>

        {/* Documents skeleton */}
        <section>
          <div className="mb-3 h-4 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="aspect-4/3 animate-pulse bg-gray-200 dark:bg-gray-700" />
                <div className="px-2 py-1.5">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activity skeleton */}
        <section>
          <div className="mb-3 h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-1.5 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
