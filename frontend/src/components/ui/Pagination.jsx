import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './Button'

const getPageItems = (current, total) => {
  const pages = new Set([1, total])
  for (let p = current - 1; p <= current + 1; p += 1) {
    if (p >= 1 && p <= total) pages.add(p)
  }
  return [...pages].sort((a, b) => a - b)
}

export const Pagination = ({ page, totalPages, onChange, totalItems = 0, pageSize = 10 }) => {
  if (totalPages <= 1) return null

  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)
  const pageItems = getPageItems(page, totalPages)

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {totalItems > 0 ? `Showing ${startItem}–${endItem} of ${totalItems}` : 'No items to display'}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        {pageItems.map((p, index) => (
          <div key={p} className="flex items-center gap-1">
            {index > 0 && pageItems[index - 1] !== p - 1 && <span className="px-1 text-sm text-muted-foreground">…</span>}
            <button
              type="button"
              onClick={() => onChange(p)}
              className={cn(
                'h-8 min-w-8 rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
