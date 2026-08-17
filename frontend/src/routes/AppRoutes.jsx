// All page routes — lazy-loaded for faster initial load.
// Admin routes require 'admin' role, student routes require 'student' role.
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ProtectedRoute } from './ProtectedRoute'
import { RedirectByRole } from './RedirectByRole'

// Admin pages (lazy loaded)
const AdminLayout = lazy(() => import('../layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const StudentLayout = lazy(() => import('../layouts/StudentLayout').then((m) => ({ default: m.StudentLayout })))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const AccessDeniedPage = lazy(() => import('../pages/AccessDeniedPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const StudentsPage = lazy(() => import('../pages/StudentsPage'))
const StudentDetailPage = lazy(() => import('../pages/StudentDetailPage'))
const AttendancePage = lazy(() => import('../pages/AttendancePage'))
const AdminProfilePage = lazy(() => import('../pages/AdminProfilePage'))
const TeamsPage = lazy(() => import('../pages/TeamsPage'))
const TeamDetailPage = lazy(() => import('../pages/TeamDetailPage'))
const ProjectsPage = lazy(() => import('../pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage'))
const TasksPage = lazy(() => import('../pages/TasksPage'))
const StudentDashboardPage = lazy(() => import('../pages/StudentDashboardPage'))
const StudentAttendancePage = lazy(() => import('../pages/StudentAttendancePage'))
const StudentTeamPage = lazy(() => import('../pages/StudentTeamPage'))
const StudentProjectsPage = lazy(() => import('../pages/StudentProjectsPage'))
const StudentProjectDetailPage = lazy(() => import('../pages/StudentProjectDetailPage'))
const StudentTasksPage = lazy(() => import('../pages/StudentTasksPage'))
const StudentProfilePage = lazy(() => import('../pages/StudentProfilePage'))

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary" />
    </div>
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
          <Route path="/profile" element={<AdminProfilePage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute roles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />
          <Route path="/student/team" element={<StudentTeamPage />} />
          <Route path="/student/projects" element={<StudentProjectsPage />} />
          <Route path="/student/projects/:id" element={<StudentProjectDetailPage />} />
          <Route path="/student/tasks" element={<StudentTasksPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
