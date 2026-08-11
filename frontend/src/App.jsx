import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import useAuth from './hooks/useAuth.js';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import Login from './pages/Login/Login.jsx';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard.jsx';
import StudentProfile from './pages/StudentProfile/StudentProfile.jsx';
import StudentAttendance from './pages/StudentAttendance/StudentAttendance.jsx';
import StudentTeam from './pages/StudentTeam/StudentTeam.jsx';
import StudentTasks from './pages/StudentTasks/StudentTasks.jsx';

const HomeRedirect = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'admin' ? '/dashboard' : '/student/dashboard'} replace />;
};

const AdminPlaceholder = () => (
  <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
    <Box textAlign="center">
      <Typography variant="h5" fontWeight={600}>
        Admin Panel
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        The admin dashboard is under construction by the admin team.
      </Typography>
    </Box>
  </Box>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminPlaceholder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="team" element={<StudentTeam />} />
          <Route path="tasks" element={<StudentTasks />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
