import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function AccessDeniedPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleGoToLogin() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-2">
      <div className="w-full max-w-[420px] rounded-lg border bg-card p-4 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clr-red-bg text-clr-red">
          <AlertTriangle size={26} />
        </span>
        <h5 className="mt-3 text-xl font-semibold tracking-tight text-foreground">Access denied</h5>
        <p className="mt-1 text-sm text-muted-foreground">
          You don't have permission to view this page. Please sign in with an account that has the
          required role.
        </p>
        <Button className="mt-4 min-h-10 w-full" onClick={handleGoToLogin}>
          Go to login
        </Button>
      </div>
    </div>
  )
}
