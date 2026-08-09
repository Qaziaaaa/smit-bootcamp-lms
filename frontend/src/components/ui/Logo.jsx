import { Box, Typography } from '@mui/material'

function BrandMark({ size = 36 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 2,
        color: '#ffffff',
        background: 'linear-gradient(135deg, #294683 0%, #0277BD 50%, #1E3A8A 100%)',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.2)',
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '70%', height: '70%' }}>
        <path d="M22 10L12 5L2 10L12 15L22 10Z" />
        <path d="M6 12V16.5C6 16.5 9 19 12 19C15 19 18 16.5 18 16.5V12" />
        <path d="M22 10V16" strokeWidth="1.5" />
        <circle cx="12" cy="10" r="1.5" fill="#60A5FA" stroke="none" />
      </svg>
    </Box>
  )
}

export function Logo({ compact = false, size }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <BrandMark size={size} />
      {!compact && (
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              fontSize: 16,
              letterSpacing: '-0.02em',
              color: '#294683',
            }}
          >
            Bootcamp <Box component="span" sx={{ color: '#0277BD' }}>LMS</Box>
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 500,
              color: '#474B53',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mt: 0.5,
            }}
          >
            Management System
          </Typography>
        </Box>
      )}
    </Box>
  )
}
