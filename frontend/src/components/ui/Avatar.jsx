import { cn } from '../../lib/utils'

const getInitials = (name) => {
  if (!name) return ''
  const parts = String(name).trim().split(/\s+/)
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return `${parts[0][0]}`.toUpperCase()
}

export const Avatar = ({ name, className, ...props }) => (
  <span
    className={cn(
      'inline-flex h-10 w-10 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-clr-blue text-sm font-semibold text-white',
      className,
    )}
    {...props}
  >
    {getInitials(name)}
  </span>
)
