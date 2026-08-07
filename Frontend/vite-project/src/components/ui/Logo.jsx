import { Box, Typography } from '@mui/material'
import { GraduationCap } from 'lucide-react'

export function Logo({ compact = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          width: 36,
          height: 36,
          borderRadius: 1,
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <GraduationCap size={20} />
      </Box>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          SMIT 
        </Typography>
        {!compact && (
          <Typography variant="caption" color="text.secondary">
            Bootcamp
          </Typography>
        )}
      </Box>
    </Box>
  )
}
