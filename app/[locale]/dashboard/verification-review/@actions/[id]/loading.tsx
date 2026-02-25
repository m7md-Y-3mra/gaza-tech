export default function ActionsLoading() {
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="h-6 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="flex-1 space-y-6 p-4">
        {/* Checklist skeleton */}
        <section>
          <div className="mb-3 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5 dark:border-gray-700"
              >
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </section>

        {/* Notes skeleton */}
        <section>
          <div className="mb-3 h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-24 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
        </section>
      </div>

      {/* Buttons skeleton */}
      <div className="space-y-2 border-t border-gray-200 p-4 dark:border-gray-700">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    </div>
  );
}
