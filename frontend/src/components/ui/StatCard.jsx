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
    <div className="rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-lg font-medium tabular-nums text-foreground sm:text-2xl">{value}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
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
    </div>
  )
}
