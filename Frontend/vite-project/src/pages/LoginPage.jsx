import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Logo } from '../components/ui/Logo'

const DEMO_ENABLED = import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true'

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function goHome(user) {
    navigate(user.role === 'admin' ? '/dashboard' : '/student/dashboard', { replace: true })
  }

  function handleDemo(role) {
    goHome(loginAsDemo(role))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const errors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email.'
    }
    if (!password) {
      errors.password = 'Password is required.'
    }
    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      const user = await login(email.trim(), password)
      goHome(user)
    } catch (error) {
      const status = error.response?.status
      if (status === 401) {
        setFormError('Invalid email or password.')
      } else {
        setFormError(error.response?.data?.message || 'Unable to sign in. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 8,
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 420, p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Logo />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: -0.2 }}>
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Access the learning workspace for teachers and students.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@school.edu"
            fullWidth
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            fullWidth
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password}
          />
          {formError && <Alert severity="error">{formError}</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={submitting} sx={{ mt: 0.5 }}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>

        {DEMO_ENABLED && (
          <Paper variant="outlined" sx={{ mt: 3, p: 2, bgcolor: 'rgba(241, 245, 249, 0.7)' }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'text.secondary' }}
            >
              Demo access
            </Typography>
            <Box sx={{ mt: 1.5, display: 'grid', gap: 1 }}>
              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => handleDemo('admin')}
                sx={{
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 1,
                  color: 'text.primary',
                  bgcolor: 'background.paper',
                }}
              >
                Continue as Admin{' '}
                <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
                  <ArrowRight size={16} />
                </Box>
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => handleDemo('student')}
                sx={{
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 1,
                  color: 'text.primary',
                  bgcolor: 'background.paper',
                }}
              >
                Continue as Student{' '}
                <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
                  <ArrowRight size={16} />
                </Box>
              </Button>
            </Box>
          </Paper>
        )}
      </Paper>
    </Box>
  )
}
