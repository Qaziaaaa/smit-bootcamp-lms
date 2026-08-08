import { Box, Paper, Typography } from '@mui/material'
import { Construction } from 'lucide-react'

export function PlaceholderPage() {
  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 480, p: 4, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            width: 56,
            height: 56,
            mx: 'auto',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(37, 99, 235, 0.1)',
            color: 'primary.main',
          }}
        >
          <Construction size={26} />
        </Box>
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
          Coming soon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This page will be built in the upcoming sprint days.
        </Typography>
      </Paper>
    </Box>
  )
}
