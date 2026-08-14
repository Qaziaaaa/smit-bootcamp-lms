import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  CheckSquare,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Layers,
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/useTheme'
import { Avatar } from '../components/ui/Avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/DropdownMenu'
import { Logo } from '../components/ui/Logo'
import { getStudentProfile } from '../services/studentService'

const NAV_ITEMS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
  { to: '/student/projects', label: 'My Projects', icon: FolderKanban },
  { to: '/student/tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/student/team', label: 'My Team', icon: Layers },
]

function isPathActive(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function SidebarContent({ pathname, profile, onNavigate }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const name = profile?.name || user?.name || 'Student'
  const email = profile?.email || user?.email || ''

  return (
    <div className="flex h-full flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex shrink-0 items-center border-b p-4">
        <div className="flex flex-1 justify-center">
          <Logo />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Portal
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isPathActive(pathname, item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                'mb-1 flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-clr-blue-bg font-semibold text-clr-blue-dark'
                  : 'font-medium text-muted-foreground hover:bg-clr-blue-bg hover:text-clr-blue-dark',
              )}
            >
              <item.icon size={20} strokeWidth={1.8} className="shrink-0" />
              <span className="min-w-0 truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 border-t bg-muted/40 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-lg border bg-card p-2.5 text-left transition-colors hover:border-clr-blue/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar name={name} className="h-9 w-9 text-sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-foreground">{name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{email}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="end">
            <DropdownMenuItem asChild>
              <Link to="/student/profile">
                <UserIcon />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'dark' ? <Sun /> : <Moon />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function StudentLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let cancelled = false
    getStudentProfile()
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const current = NAV_ITEMS.find((item) => isPathActive(pathname, item.to))
  const title = current?.label || 'Dashboard'

  return (
    <div className="flex h-screen w-full max-w-full flex-col overflow-hidden bg-background md:flex-row">
      <aside className="hidden w-[180px] shrink-0 md:block lg:w-[200px]">
        <SidebarContent pathname={pathname} profile={profile} />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/40">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-1.5 md:hidden">
            <Logo />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">Home</span>
            <ChevronRight size={14} className="text-muted-foreground" />
            <span className="truncate text-sm font-semibold text-foreground">{title}</span>
          </div>
          <span className="hidden text-xs font-medium text-muted-foreground md:block">{todayLabel()}</span>
        </header>

        <div className="w-full flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8">
          <div className="mx-auto w-full max-w-[1200px]">
            <Outlet />
          </div>
        </div>

        <nav className="mobile-bottom-nav grid grid-cols-5 border-t bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:hidden">
          {NAV_ITEMS.map((item) => {
            const active = isPathActive(pathname, item.to)
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors',
                  active ? 'font-semibold text-clr-blue' : 'text-muted-foreground',
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </main>
    </div>
  )
}
