import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loading component that matches the ListingForm structure
 */
export const ListingFormSkeleton = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-green-50">
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Form Column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Images Section */}
              <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                  <Skeleton className="mb-2 h-8 w-40" />
                  <Skeleton className="h-4 w-80" />
                </div>

                {/* Upload Area Skeleton - matches the dashed drag-and-drop zone */}
                <div className="border-muted-foreground/30 mb-6 rounded-xl border-3 border-dashed p-12">
                  <div className="flex flex-col items-center">
                    {/* Gradient icon placeholder */}
                    <Skeleton className="mb-4 h-20 w-20 rounded-2xl" />
                    {/* "Upload Product Images" title */}
                    <Skeleton className="mb-2 h-6 w-52" />
                    {/* "Drag and drop or click to browse" */}
                    <Skeleton className="mb-4 h-4 w-56" />
                    {/* "Choose Files" button */}
                    <Skeleton className="h-12 w-40 rounded-xl" />
                    {/* Supported formats text */}
                    <Skeleton className="mt-4 h-3 w-72" />
                  </div>
                </div>

                {/* Image Grid Skeleton - responsive cols matching the real grid */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="border-muted-foreground/30 aspect-square rounded-xl border-2 border-dashed"
                    />
                  ))}
                </div>

                {/* Tips Box skeleton */}
                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-64" />
                      <Skeleton className="h-3 w-56" />
                      <Skeleton className="h-3 w-60" />
                      <Skeleton className="h-3 w-52" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                  <Skeleton className="mb-2 h-8 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
                <div className="space-y-6">
                  {/* Title field */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                  {/* Category & Condition fields */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  </div>
                  {/* Description field */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-32 w-full rounded-md" />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                  <Skeleton className="mb-2 h-8 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                  <Skeleton className="mb-2 h-8 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              {/* Specifications Section */}
              <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                  <Skeleton className="mb-2 h-8 w-56" />
                  <Skeleton className="h-4 w-80" />
                </div>
                {/* Specification fields skeleton */}
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                      <Skeleton className="mt-6 h-10 w-10 rounded-md" />
                    </div>
                  ))}
                  <Skeleton className="h-10 w-40 rounded-md" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Skeleton className="h-12 flex-1 rounded-md" />
                <Skeleton className="h-12 w-24 rounded-md" />
              </div>
            </div>

            {/* Live Preview Sidebar */}
            <div className="lg:col-span-1">
              <div className="border-border bg-card sticky top-8 rounded-2xl p-6 shadow-sm">
                <Skeleton className="mb-4 h-6 w-24" />
                {/* Preview card skeleton */}
                <div className="space-y-4">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-6 w-1/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
