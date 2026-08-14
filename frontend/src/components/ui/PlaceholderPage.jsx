import { Construction } from 'lucide-react'

export function PlaceholderPage() {
  return (
    <div className="flex min-h-full items-center justify-center py-8">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clr-blue-bg text-clr-blue">
          <Construction size={26} />
        </span>
        <h3 className="mt-3 text-base font-semibold text-foreground">Coming soon</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This page will be built in the upcoming sprint days.
        </p>
      </div>
    </div>
  )
}
