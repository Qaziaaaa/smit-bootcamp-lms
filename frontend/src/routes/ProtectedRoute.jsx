// Protected route — blocks access if not logged in or wrong role.
// If not authenticated: redirects to /login (remembers where they were going).
// If wrong role: shows AccessDeniedPage.
import { lazy } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const AccessDeniedPage = lazy(() => import('../pages/AccessDeniedPage'))

export function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    )
  }

  // Not logged in — redirect to login, save intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Logged in but wrong role — show access denied
  if (roles && !roles.includes(user?.role)) {
    return <AccessDeniedPage />
  }

  return children
}
