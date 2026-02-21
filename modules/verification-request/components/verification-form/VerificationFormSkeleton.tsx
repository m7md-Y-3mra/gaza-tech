import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loading component that matches the VerificationForm structure.
 * Three sections: Personal Info, Document Upload, Phone Verification.
 */
export const VerificationFormSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Page header */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="space-y-6">
            {/* ── Section 1: Personal Information ── */}
            <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
              {/* Section header */}
              <div className="mb-6 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
              </div>

              {/* Info banner */}
              <Skeleton className="mb-6 h-12 w-full rounded-lg" />

              {/* Full name + DOB */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              </div>

              {/* Gender + National ID */}
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              </div>

              {/* Address */}
              <div className="mt-6 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>

            {/* ── Section 2: Document Upload ── */}
            <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
              {/* Section header */}
              <div className="mb-6 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>

              {/* Info banner */}
              <Skeleton className="mb-6 h-16 w-full rounded-lg" />

              {/* Document type select */}
              <div className="mb-6 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>

              {/* Three upload zones */}
              {[
                'ID Card — Front Side',
                'ID Card — Back Side',
                'Selfie with ID Card',
              ].map((_, i) => (
                <div key={i} className="mb-6 last:mb-0">
                  {/* Label row */}
                  <div className="mb-3 flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  {/* Dropzone */}
                  <div className="border-muted-foreground/30 rounded-2xl border-[3px] border-dashed p-8">
                    <div className="flex flex-col items-center gap-4">
                      <Skeleton className="h-20 w-20 rounded-2xl" />
                      <Skeleton className="h-5 w-64" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Section 3: Phone Verification ── */}
            <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
              {/* Section header */}
              <div className="mb-6 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-4 w-80" />
                </div>
              </div>

              {/* Info banner */}
              <Skeleton className="mb-6 h-10 w-full rounded-lg" />

              {/* OTP card */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-28 rounded-lg" />
                </div>
              </div>
            </div>

            {/* ── Terms ── */}
            <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
              <div className="flex items-start gap-3">
                <Skeleton className="mt-0.5 h-5 w-5 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>

            {/* ── Submit button ── */}
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
