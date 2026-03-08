export default function QueueLoading() {
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              {/* Avatar skeleton */}
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              {/* Text skeleton */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              {/* Badge skeleton */}
              <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            </li>
          ))}
        </ul>
      </div>

      {/* Count skeleton */}
      <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
        <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </>
  );
}
