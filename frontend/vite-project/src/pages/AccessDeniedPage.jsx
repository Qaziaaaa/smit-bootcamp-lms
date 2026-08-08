import { useNavigate } from 'react-router-dom'
import { Box, Button, Paper, Typography } from '@mui/material'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 420, p: 4, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            width: 56,
            height: 56,
            mx: 'auto',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(220, 38, 38, 0.1)',
            color: 'error.main',
          }}
        >
          <AlertTriangle size={26} />
        </Box>
        <Typography variant="h5" sx={{ mt: 2, fontWeight: 600, letterSpacing: -0.2 }}>
          Access denied
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          You don't have permission to view this page. Please sign in with an account that has the
          required role.
        </Typography>
        <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleGoToLogin}>
          Go to login
        </Button>
      </Paper>
    </Box>
  )
}
