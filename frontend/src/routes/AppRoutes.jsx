import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { ProtectedRoute } from './ProtectedRoute'
import { RedirectByRole } from './RedirectByRole'
import { PlaceholderPage } from '../components/ui/PlaceholderPage'

const AdminLayout = lazy(() => import('../layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const AccessDeniedPage = lazy(() => import('../pages/AccessDeniedPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const StudentsPage = lazy(() => import('../pages/StudentsPage'))
const StudentDetailPage = lazy(() => import('../pages/StudentDetailPage'))
const AttendancePage = lazy(() => import('../pages/AttendancePage'))
const TeamsPage = lazy(() => import('../pages/TeamsPage'))
const TeamDetailPage = lazy(() => import('../pages/TeamDetailPage'))
const ProjectsPage = lazy(() => import('../pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage'))
const TasksPage = lazy(() => import('../pages/TasksPage'))

function PageFallback() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RedirectByRole />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        <Route
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Route>

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute roles={['student']}>
              <PlaceholderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute roles={['student']}>
              <PlaceholderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/team"
          element={
            <ProtectedRoute roles={['student']}>
              <PlaceholderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tasks"
          element={
            <ProtectedRoute roles={['student']}>
              <PlaceholderPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
