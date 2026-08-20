import { Skeleton } from '../ui/Skeleton'

export function StudentDashboardSkeleton() {
  return (
    <div className="grid gap-3" aria-label="Loading student dashboard" aria-busy="true">
      {/* Welcome banner skeleton */}
      <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-md md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-48 rounded-full" />
          <Skeleton className="h-7 w-60 max-w-[80%]" />
          <Skeleton className="h-3.5 w-80 max-w-[90%]" />
        </div>
        <Skeleton className="h-9 w-44 shrink-0 rounded-md" />
      </div>

      {/* Overview: 3 Metric cards (left) + Class schedule (right) */}
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        {/* 3 Metric cards */}
        <div className="grid gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Schedule widget skeleton */}
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="px-2 pb-1.5 pt-2">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="px-2 pb-2">
            <div className="grid grid-cols-7 gap-0.75">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-14 flex-col items-center justify-center rounded-md border p-1"
                >
                  <Skeleton className="mb-1 h-3 w-6" />
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
            <Skeleton className="mx-auto mt-2 h-3.5 w-48" />
          </div>
        </div>
      </div>

      {/* Sprint tasks section skeleton */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-border bg-muted/40 p-2.5 sm:items-center">
          <div className="space-y-1">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-3.5 w-72 max-w-full" />
          </div>
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-72 max-w-full" />
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
