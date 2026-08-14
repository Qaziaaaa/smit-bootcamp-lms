import { cn } from '../../lib/utils'

export function Logo({ compact = false }) {
  return (
    <img
      src="/logo.png"
      alt="SMIT – Saylani Mass IT Training"
      className={cn('block h-auto w-auto object-contain', compact ? 'h-10' : 'h-14')}
    />
  )
}
