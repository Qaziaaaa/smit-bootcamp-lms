// All page routes — lazy-loaded for faster initial load.
// Admin routes require 'admin' role, student routes require 'student' role.
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ProtectedRoute } from './ProtectedRoute'
import { RedirectByRole } from './RedirectByRole'

// Abdullah — Auth, Layouts, Dashboard, Student Portal (Dashboard, Profile, Team)
// Shahzad — Students, Attendance, Teams, Projects, Tasks, Student Portal (Attendance, Projects, Tasks)
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
        {/* Shared routes — no auth required */}
        <Route path="/login" element={<LoginPage />} /> {/* Abdullah */}
        <Route path="/" element={<RedirectByRole />} /> {/* Abdullah */}
        <Route path="/access-denied" element={<AccessDeniedPage />} /> {/* Abdullah */}

        {/* Admin routes — requires 'admin' role */}
        <Route
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} /> {/* Abdullah */}
          <Route path="/students" element={<StudentsPage />} /> {/* Shahzad */}
          <Route path="/students/:id" element={<StudentDetailPage />} /> {/* Shahzad */}
          <Route path="/attendance" element={<AttendancePage />} /> {/* Shahzad */}
          <Route path="/teams" element={<TeamsPage />} /> {/* Shahzad */}
          <Route path="/teams/:id" element={<TeamDetailPage />} /> {/* Shahzad */}
          <Route path="/projects" element={<ProjectsPage />} /> {/* Shahzad */}
          <Route path="/projects/:id" element={<ProjectDetailPage />} /> {/* Shahzad */}
          <Route path="/tasks" element={<TasksPage />} /> {/* Shahzad */}
          <Route path="/profile" element={<AdminProfilePage />} /> {/* Abdullah */}
        </Route>

        {/* Student routes — requires 'student' role */}
        <Route
          element={
            <ProtectedRoute roles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/student/dashboard" element={<StudentDashboardPage />} /> {/* Abdullah */}
          <Route path="/student/attendance" element={<StudentAttendancePage />} /> {/* Shahzad */}
          <Route path="/student/team" element={<StudentTeamPage />} /> {/* Abdullah */}
          <Route path="/student/projects" element={<StudentProjectsPage />} /> {/* Shahzad */}
          <Route path="/student/projects/:id" element={<StudentProjectDetailPage />} /> {/* Shahzad */}
          <Route path="/student/tasks" element={<StudentTasksPage />} /> {/* Shahzad */}
          <Route path="/student/profile" element={<StudentProfilePage />} /> {/* Abdullah */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
