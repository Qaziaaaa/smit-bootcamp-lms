import { SearchX, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './Button'
import { Skeleton } from './Skeleton'

export const LoadingState = ({ rows = 5, className }) => (
  <div className={cn('flex w-full flex-col gap-2 p-2', className)}>
    {Array.from(new Array(rows)).map((_, index) => (
      <Skeleton key={index} className="h-[60px] rounded-lg" />
    ))}
  </div>
)

export const EmptyState = ({ message = 'No data found', icon: Icon = SearchX, className }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center px-3 py-8 text-center text-muted-foreground',
      className,
    )}
  >
    <Icon size={48} className="mb-4 opacity-50" strokeWidth={1.5} />
    <p className="text-base font-medium text-foreground">{message}</p>
  </div>
)

export const ErrorState = ({ message = 'Something went wrong', onRetry, className }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center px-3 py-8 text-center text-destructive',
      className,
    )}
  >
    <AlertCircle size={48} className="mb-4" strokeWidth={1.5} />
    <p className="text-base font-medium">{message}</p>
    {onRetry && (
      <Button variant="outline" onClick={onRetry} className="mt-4">
        <RefreshCw size={16} />
        Retry
      </Button>
    )}
  </div>
)
