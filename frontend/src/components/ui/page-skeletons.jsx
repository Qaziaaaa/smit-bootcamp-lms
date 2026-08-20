import { Skeleton } from './Skeleton'

// Skeleton for table pages: header + stat cards + table rows
// Used by: StudentTasksPage, StudentAttendancePage
export function TablePageSkeleton({ statCount = 3, rowCount = 6 }) {
  return (
    <div className="grid gap-3" aria-busy="true">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48 max-w-[70%]" />
        <Skeleton className="h-4 w-64 max-w-[90%]" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: statCount }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-2.5 shadow-sm">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-1 h-7 w-12" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-clr-blue-bg p-2.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-1 h-3 w-48" />
        </div>
        <div className="divide-y">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div key={i} className="flex h-12 items-center px-4">
              <Skeleton className="h-4 w-28" />
              <div className="ml-auto">
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton for card grid pages: header + 2 large info cards
// Used by: StudentProjectsPage, StudentTeamPage
export function CardGridSkeleton({ cardCount = 2 }) {
  return (
    <div className="grid gap-3" aria-busy="true">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-36 max-w-[70%]" />
        <Skeleton className="h-4 w-56 max-w-[90%]" />
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
            <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-clr-blue-bg p-2.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-1 h-3 w-48" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex h-14 items-center gap-3 px-4">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton for detail pages: back button + header + info card
// Used by: TeamDetailPage, StudentDetailPage, ProjectDetailPage, StudentProjectDetailPage
export function DetailPageSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="hidden gap-6 sm:flex">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-clr-blue-bg p-2.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-1 h-3 w-40" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex h-12 items-center px-4">
              <Skeleton className="h-4 w-32" />
              <div className="ml-auto">
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton for profile pages: cover + avatar + info cards
// Used by: StudentProfilePage
export function ProfilePageSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <div className="relative mb-16 sm:mb-20">
        <Skeleton className="h-40 w-full rounded-xl sm:h-50 md:h-60" />
        <Skeleton className="absolute -bottom-14 left-6 h-28 w-28 rounded-full border-4 border-white sm:-bottom-16 sm:left-10 sm:h-32 sm:w-32" />
      </div>

      <div className="flex items-start justify-between px-1 sm:px-2">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr]">
        <div className="space-y-3 rounded-xl border bg-card p-3 shadow-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-xl border bg-card p-3 shadow-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
