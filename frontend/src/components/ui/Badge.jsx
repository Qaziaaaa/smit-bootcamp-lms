import { cn } from '../../lib/utils'

const TONE_CLASSES = {
  success: 'border-clr-emerald-border bg-clr-emerald-bg text-clr-green-dark',
  error: 'border-clr-rose-border bg-clr-rose-bg text-clr-red-dark',
  warning: 'border-clr-amber-border bg-clr-amber-bg text-clr-amber-dark',
  info: 'border-clr-blue-border bg-clr-blue-bg text-clr-blue-dark',
  secondary: 'border-clr-purple-bg bg-clr-purple-bg text-clr-purple',
  default: 'border-clr-slate-border bg-clr-slate-light text-clr-slate',
}

const STATUS_TONE = {
  success: 'success',
  completed: 'success',
  certified: 'success',
  certified_completed: 'success',
  active: 'success',
  present: 'success',
  approved: 'success',
  paid: 'success',
  accepted: 'success',
  teamaccepted: 'success',
  error: 'error',
  failed: 'error',
  rejected: 'error',
  absent: 'error',
  revoked: 'error',
  cancelled: 'error',
  cancel: 'error',
  canceled: 'error',
  teamrejected: 'error',
  warning: 'warning',
  pending: 'warning',
  'in-review': 'warning',
  review: 'warning',
  onhold: 'warning',
  paused: 'warning',
  teampending: 'warning',
  info: 'info',
  'in-progress': 'info',
  inprogress: 'info',
  ongoing: 'info',
  assigned: 'info',
  review_requested: 'info',
  submitted: 'info',
  enrolled: 'info',
  secondary: 'secondary',
  team: 'secondary',
}

export const Badge = ({ status, label, icon: Icon, className }) => {
  const tone = STATUS_TONE[String(status || '').toLowerCase()] || 'default'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-xs font-semibold capitalize',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {Icon && <Icon size={12} />}
      {label || status}
    </span>
  )
}
