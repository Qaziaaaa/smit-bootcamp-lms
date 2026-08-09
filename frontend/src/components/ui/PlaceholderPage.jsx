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
      <Paper variant="outlined" sx={{ width: '100%', maxWidth: 480, p: 4, textAlign: 'center', borderRadius: 2, bgcolor: '#ffffff' }}>
        <Box
          sx={{
            display: 'flex',
            width: 56,
            height: 56,
            mx: 'auto',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#F4F9FF',
            color: '#2D69EB',
          }}
        >
          <Construction size={26} />
        </Box>
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600, color: '#0A0A0A' }}>
          Coming soon
        </Typography>
        <Typography variant="body2" sx={{ color: '#828283', mt: 1 }}>
          This page will be built in the upcoming sprint days.
        </Typography>
      </Paper>
    </Box>
  )
}
