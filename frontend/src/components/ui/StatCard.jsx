import { TrendingUp } from 'lucide-react'

export function StatCard({
  label,
  value,
  trend,
  subtitle,
  subtitleColor,
  icon: Icon,
  iconBg,
  iconColor,
  trendColor = 'hsl(var(--clr-green))',
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-medium tabular-nums text-foreground">{value}</p>
          {trend && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium" style={{ color: trendColor }}>
              <TrendingUp size={14} strokeWidth={1.75} />
              {trend}
            </p>
          )}
          {subtitle && !trend && (
            <p
              className="mt-1 text-[11px]"
              style={{ color: subtitleColor || 'hsl(var(--clr-slate))', fontWeight: subtitleColor ? 500 : 400 }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <span
            className="flex shrink-0 items-center justify-center rounded-full p-2.5 bg-clr-blue-bg text-clr-blue"
            style={iconBg ? { backgroundColor: iconBg, color: iconColor } : undefined}
          >
            <Icon size={20} strokeWidth={1.75} className="sm:h-6 sm:w-6" />
          </span>
        )}
      </div>
    </div>
  )
}
