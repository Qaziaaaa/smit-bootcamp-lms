import { Box, Paper, Typography } from '@mui/material'
import { TrendingUp } from 'lucide-react'

export function StatCard({
  label,
  value,
  trend,
  subtitle,
  subtitleColor,
  icon: Icon,
  iconBg,
  iconBorder,
  iconColor,
  trendColor = '#22C55E',
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 500, color: '#0A0A0A', fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <TrendingUp size={14} strokeWidth={1.75} style={{ color: trendColor }} />
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: trendColor }}>{trend}</Typography>
            </Box>
          )}
          {subtitle && !trend && (
            <Typography sx={{ fontSize: 11, mt: 1, color: subtitleColor || '#828283', fontWeight: subtitleColor ? 500 : 400 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            width: 48,
            height: 48,
            borderRadius: 2,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            bgcolor: iconBg,
            border: 1,
            borderColor: iconBorder,
            color: iconColor,
          }}
        >
          <Icon size={24} strokeWidth={1.75} />
        </Box>
      </Box>
    </Paper>
  )
}
