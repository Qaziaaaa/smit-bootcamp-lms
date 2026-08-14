import * as React from 'react'
import { cn } from '../../lib/utils'

const alertVariants = {
  default: 'border-clr-blue-border bg-clr-blue-bg text-clr-blue-dark',
  destructive: 'border-clr-rose-border bg-clr-rose-bg text-clr-red-dark',
  warning: 'border-clr-amber-border bg-clr-amber-bg text-clr-amber-dark',
  success: 'border-clr-emerald-border bg-clr-emerald-bg text-clr-green-dark',
}

export const Alert = React.forwardRef(({ variant = 'default', className, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn('relative w-full rounded-lg border px-4 py-3 text-sm', alertVariants[variant], className)}
    {...props}
  />
))
Alert.displayName = 'Alert'

export const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn('mb-1 font-semibold leading-none tracking-tight', className)} {...props} />
))
AlertTitle.displayName = 'AlertTitle'

export const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm opacity-90 [&_p]:leading-relaxed', className)} {...props} />
))
AlertDescription.displayName = 'AlertDescription'
