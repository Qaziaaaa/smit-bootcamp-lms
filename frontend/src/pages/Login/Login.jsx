import { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { GraduationCap } from 'lucide-react';
import authService from '../../services/authService.js';
import useAuth from '../../hooks/useAuth.js';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const Login = () => {
  const { isAuthenticated, role, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  if (isAuthenticated) {
    const target = role === 'admin' ? '/dashboard' : '/student/dashboard';
    return <Navigate to={target} replace />;
  }

  const redirectAfterLogin = (user) => {
    const from = location.state?.from?.pathname;
    const home = user.role === 'admin' ? '/dashboard' : '/student/dashboard';
    navigate(from || home, { replace: true });
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    setServerError('');
    try {
      const result = await authService.login(values);
      signIn(result);
      toast.success('Signed in successfully.');
      redirectAfterLogin(result.user);
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to sign in. Please try again.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F8FAFB',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack spacing={1} alignItems="center">
              <GraduationCap size={40} color="#1976d2" />
              <Typography variant="h5" fontWeight={600}>
                Bootcamp LMS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your account
              </Typography>
            </Stack>

            {serverError && <Alert severity="error">{serverError}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  autoComplete="email"
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  {...register('email')}
                />
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  autoComplete="current-password"
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  {...register('password')}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={submitting}
                >
                  {submitting ? 'Signing in…' : 'Sign In'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
