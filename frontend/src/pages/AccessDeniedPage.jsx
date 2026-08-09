import { Box, Button, Paper, Typography } from '@mui/material'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function AccessDeniedPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleGoToLogin() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper variant="outlined" sx={{ width: '100%', maxWidth: 420, p: 4, textAlign: 'center', borderRadius: 2, bgcolor: '#ffffff' }}>
        <Box
          sx={{
            display: 'flex',
            width: 56,
            height: 56,
            mx: 'auto',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#FEF2F2',
            color: '#DC2626',
          }}
        >
          <AlertTriangle size={26} />
        </Box>
        <Typography variant="h5" sx={{ mt: 2, fontWeight: 600, color: '#0A0A0A', letterSpacing: '-0.02em' }}>
          Access denied
        </Typography>
        <Typography variant="body2" sx={{ color: '#828283', mt: 1 }}>
          You don't have permission to view this page. Please sign in with an account that has the
          required role.
        </Typography>
        <Button variant="contained" fullWidth sx={{ mt: 3, minHeight: 40 }} onClick={handleGoToLogin}>
          Go to login
        </Button>
      </Paper>
    </Box>
  )
}
