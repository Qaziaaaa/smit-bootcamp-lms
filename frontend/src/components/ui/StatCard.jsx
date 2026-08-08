import { Box, Paper, Typography } from '@mui/material'

export function StatCard({ label, value, icon: Icon }) {
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            width: 40,
            height: 40,
            borderRadius: 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(37, 99, 235, 0.1)',
            color: 'primary.main',
          }}
        >
          <Icon size={20} />
        </Box>
      </Box>
      <Typography variant="h4" sx={{ mt: 1, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Paper>
  )
}
