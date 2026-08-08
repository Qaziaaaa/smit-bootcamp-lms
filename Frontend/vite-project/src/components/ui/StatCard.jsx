import { Box, Paper, Typography } from '@mui/material'

export function StatCard({ label, value, subtitle, icon: Icon }) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            width: 36,
            height: 36,
            borderRadius: 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(37, 99, 235, 0.1)',
            color: 'primary.main',
          }}
        >
          <Icon size={18} />
        </Box>
      </Box>
    </Paper>
  )
}
