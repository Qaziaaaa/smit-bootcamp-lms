// Admin layout — sidebar + header + mobile nav for the admin portal.
// Wraps all admin pages via <Outlet />.
// Sidebar shows navigation links, user dropdown (profile, theme toggle, logout).
// Mobile: bottom navigation bar instead of sidebar.
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FolderGit2,
  LayoutDashboard,
  Layers,
  LogOut,
  Users,
  User as UserIcon,
  Moon,
  Sun,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { toast } from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/useTheme'
import { Avatar } from '../components/ui/Avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/DropdownMenu'
import { Logo } from '../components/ui/Logo'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip'

// Sidebar and mobile nav links — defines every admin page with its route, label, and icon.
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/teams', label: 'Teams', icon: Layers },
  { to: '/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
]

// Checks if a route is active — exact match or child route (e.g. /students/123 matches /students).
function isPathActive(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

// Returns today's date as a short label (e.g. "Mon, Aug 18") for the header.
function todayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// Sidebar — shared between desktop sidebar and contains nav, user card, and theme toggle.
// Accepts pathname for active link highlighting and onNavigate callback for mobile nav close.
function SidebarContent({ pathname, onNavigate }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  // Clears auth state and redirects to login page.
  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-y-auto border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
        collapsed ? 'w-[70px]' : 'w-[180px] lg:w-[200px]',
      )}
    >
      {/* Header — logo + collapse toggle button. Logo hides when collapsed. */}
      <div className="flex shrink-0 items-center border-b p-4">
        {!collapsed && (
          <div className="flex flex-1 justify-center">
            <Logo />
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-clr-blue-bg hover:text-clr-blue-dark dark:hover:bg-[#2a2a2a]"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation links — each item highlights when its route is active.
          When collapsed, shows tooltip on hover instead of label text. */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {!collapsed && (
          <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Management
          </p>
        )}
        <TooltipProvider delayDuration={0}>
          {NAV_ITEMS.map((item) => {
            const active = isPathActive(pathname, item.to)
            return (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      'mb-1 flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      collapsed && 'justify-center',
                      active
                        ? 'bg-clr-blue-bg font-semibold text-clr-blue-dark'
                        : 'font-medium text-muted-foreground hover:bg-clr-blue-bg hover:text-clr-blue-dark',
                    )}
                  >
                    <item.icon size={20} strokeWidth={1.8} className="shrink-0" />
                    {!collapsed && <span className="min-w-0 truncate">{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </nav>

      {/* User card at bottom — shows avatar, name, email. Clicking opens dropdown with
          Profile, Theme toggle, and Logout options. */}
      <div className="shrink-0 border-t bg-muted/40 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex w-full items-center gap-2 rounded-lg border bg-card p-2.5 text-left transition-colors hover:border-clr-blue/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                collapsed && 'justify-center',
              )}
            >
              <Avatar name={user?.name || 'A'} className="h-9 w-9 text-sm" />
              {!collapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-foreground">
                    {user?.name || 'Admin'}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">{user?.email}</span>
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="end">
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <UserIcon />
                Profile
              </Link>
            </DropdownMenuItem>
            {/* Theme toggle — switches between light and dark mode */}
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

// Main layout component — renders sidebar (desktop) + header + page content + mobile bottom nav.
// Wrapped by ProtectedRoute which ensures only admin users can access.
export function AdminLayout() {
  const location = useLocation()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Determines the current page title for the breadcrumb in the header.
  const current = NAV_ITEMS.find((item) => isPathActive(pathname, item.to))
  const title = current?.label || 'Dashboard'

  // Prevents the "Logged in!" toast from showing more than once per session.
  const loginToastShown = useRef(false)

  // Shows a success toast on first login, then clears the state so it doesn't repeat on navigation.
  useEffect(() => {
    if (location.state?.justLoggedIn && !loginToastShown.current) {
      loginToastShown.current = true
      toast.success('Logged in!')
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  return (
    <div className="flex h-screen w-full max-w-full flex-col overflow-hidden bg-background md:flex-row">
      {/* Desktop sidebar — hidden on mobile, visible on md+ screens */}
      <aside className="hidden shrink-0 md:block">
        <SidebarContent pathname={pathname} />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/40">
        {/* Top header bar — shows breadcrumb (Home > Page Name) and today's date */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-card px-4 md:px-6">
          {/* Mobile header — shows logo on left */}
          <div className="flex items-center gap-1.5 md:hidden">
            <Logo />
          </div>
          {/* Breadcrumb navigation — Home > Current Page */}
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">Home</span>
            <ChevronRight size={14} className="text-muted-foreground" />
            <span className="truncate text-sm font-semibold text-foreground">{title}</span>
          </div>
          {/* Today's date — desktop only */}
          <span className="hidden text-xs font-medium text-muted-foreground md:block">{todayLabel()}</span>
        </header>

        {/* Page content — renders the active admin page via React Router's Outlet */}
        <div className="w-full flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5">
          <div className="w-full">
            <Outlet />
          </div>
        </div>

        {/* Mobile bottom navigation — 6-column grid with icon + label for each nav item.
            Hidden on desktop (md+), visible on mobile. Replaces sidebar on small screens. */}
        <nav className="mobile-bottom-nav grid grid-cols-6 border-t bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:hidden">
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
