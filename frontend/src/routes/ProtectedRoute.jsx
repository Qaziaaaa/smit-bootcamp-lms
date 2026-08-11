import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { Box, Typography } from '@mui/material';
import { ShieldAlert } from 'lucide-react';

const Forbidden = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
    }}
  >
    <ShieldAlert size={48} color="#d32f2f" />
    <Typography variant="h5">Access denied</Typography>
    <Typography color="text.secondary">
      You do not have permission to view this page.
    </Typography>
  </Box>
);

const ProtectedRoute = ({ role, children }) => {
  const { isAuthenticated, role: userRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && userRole !== role) {
    return <Forbidden />;
  }

  return children;
};

export default ProtectedRoute;
