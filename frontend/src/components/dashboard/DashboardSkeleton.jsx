import { Skeleton } from '../ui/Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="grid gap-3 sm:-mt-1 md:-mt-2 -mb-1 sm:-mb-2 md:-mb-3" aria-label="Loading dashboard" aria-busy="true">
      {/* Header with action skeletons */}
      <div className="flex flex-col items-stretch justify-between gap-2 -mb-1 sm:flex-row sm:items-start">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-64 max-w-[70%]" />
          <Skeleton className="h-4 w-96 max-w-[90%]" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* 4 Stat cards grid skeleton */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Main split: Recent attendance & Recent activity skeleton */}
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        {/* Recent attendance table skeleton */}
        <div className="min-w-0 rounded-lg border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div className="space-y-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-48" />
            </div>
            <Skeleton className="h-9 w-full sm:w-[200px] rounded-md" />
          </div>

          <div className="h-[420px] w-full max-w-full overflow-hidden border-t">
            <div className="grid grid-cols-[40%_14%_26%_20%] border-b bg-muted/40 px-4 py-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="ml-auto h-3 w-12" />
            </div>
            <div className="divide-y">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex h-14 items-center px-4">
                  <div className="flex w-[40%] items-center gap-2">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-28 max-w-[80%]" />
                      <Skeleton className="h-2.5 w-36 max-w-[90%]" />
                    </div>
                  </div>
                  <div className="w-[14%]">
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="w-[26%]">
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                  <div className="flex w-[20%] justify-end">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity feed skeleton */}
        <div className="min-w-0 rounded-lg border bg-card shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 p-3">
            <div className="space-y-1">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3.5 w-52" />
            </div>
            <Skeleton className="h-6 w-24 rounded" />
          </div>
          <div className="divide-y border-t">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-2 px-3 py-2.5">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
