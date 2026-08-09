import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import { ArrowRight, Lock, ShieldCheck, User } from 'lucide-react'
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
        bgcolor: '#F8FAFA',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 8,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 448 }}>
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 4 }}>
          <Logo size={56} compact />
          <Typography variant="h4" sx={{ mt: 2, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.02em' }}>
            Sign in to your account
          </Typography>
          <Typography variant="body2" sx={{ color: '#828283' }}>
            Enter your bootcamp credentials to access your dashboard.
          </Typography>
        </Box>

        {DEMO_ENABLED && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              onClick={() => handleDemo('admin')}
              sx={{
                justifyContent: 'flex-start',
                gap: 1.5,
                px: 1.75,
                py: 1.25,
                bgcolor: '#ffffff',
                color: '#474B53',
                textAlign: 'left',
                '&:hover': { borderColor: 'rgba(41, 70, 131, 0.5)' },
              }}
            >
              <ShieldCheck size={18} strokeWidth={1.8} />
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#0A0A0A' }}>Admin Demo</Typography>
                <Typography sx={{ fontSize: 10, color: '#828283' }}>Full Access</Typography>
              </Box>
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              onClick={() => handleDemo('student')}
              sx={{
                justifyContent: 'flex-start',
                gap: 1.5,
                px: 1.75,
                py: 1.25,
                bgcolor: '#ffffff',
                color: '#474B53',
                textAlign: 'left',
                '&:hover': { borderColor: 'rgba(41, 70, 131, 0.5)' },
              }}
            >
              <User size={18} strokeWidth={1.8} />
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#0A0A0A' }}>Student Demo</Typography>
                <Typography sx={{ fontSize: 10, color: '#828283' }}>Student View</Typography>
              </Box>
            </Button>
          </Box>
        )}

        <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: '#F4F9FF' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0A0A0A' }}>
              Sign In
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="name@bootcamp.dev"
              fullWidth
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={16} color="#828283" />
                    </InputAdornment>
                  ),
                },
                inputLabel: {
                  sx: { fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' },
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              fullWidth
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={16} color="#828283" />
                    </InputAdornment>
                  ),
                },
                inputLabel: {
                  sx: { fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' },
                },
              }}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
            <Button type="submit" variant="contained" size="large" disabled={submitting} sx={{ minHeight: 44, mt: 1 }}>
              {submitting ? 'Signing in...' : 'Sign In'}
              {!submitting && <ArrowRight size={16} style={{ marginLeft: 8 }} />}
            </Button>
          </Box>
        </Paper>

        <Typography sx={{ textAlign: 'center', fontSize: 10, color: '#828283', mt: 3 }}>
          Bootcamp OS v2.4 • Strict Architectural Contract Enforced
        </Typography>
      </Box>
    </Box>
  )
}
