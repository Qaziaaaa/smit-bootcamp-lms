import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Portal,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  CalendarCheck,
  CheckSquare,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Logo } from '../components/ui/Logo'
import { getStudentProfile } from '../services/studentService'

const DRAWER_WIDTH = 240

// Student sidebar navigation links (routes from FRONTEND_DESIGN.md)
const NAV_ITEMS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/student/team', label: 'My Team', icon: Users },
  { to: '/student/tasks', label: 'My Tasks', icon: CheckSquare },
]

// Marks the current route's nav item as active (exact match or sub-path)
function isPathActive(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

// Formats today's date for the topbar (e.g. "Mon, Aug 10")
function todayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function SidebarContent({ pathname, profile, onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Logs the student out and redirects to the login page
  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  // Fallback values while the profile is still loading
  const name = profile?.name || 'Student'
  const email = profile?.email || user?.email || ''

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#F8FAFA' }}>
      {/* Brand header (Bootcamp LMS logo) */}
      <Box
        sx={{
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Logo />
      </Box>

      {/* Navigation list: Student Menu items */}
      <List sx={{ px: 1.5, py: 1.5, flexGrow: 1, overflowY: 'auto' }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 1.5,
            py: 1,
            fontWeight: 500,
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#828283',
          }}
        >
          Student Menu
        </Typography>
        {NAV_ITEMS.map((item) => {
          const active = isPathActive(pathname, item.to)
          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              selected={active}
              onClick={onNavigate}
              sx={{
                minHeight: 44,
                mb: 0.25,
                px: 1.75,
                borderRadius: 1.5,
                color: active ? '#294683' : '#474B53',
                fontWeight: active ? 600 : 500,
                bgcolor: active ? '#F0F5FF' : 'transparent',
                '&:hover': { bgcolor: '#F0F5FF', color: '#294683' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
                <item.icon size={20} strokeWidth={1.8} />
              </ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { fontSize: 14, fontWeight: 'inherit' } }} />
            </ListItemButton>
          )
        })}
      </List>

      {/* Bottom profile card + logout */}
      <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            border: 1,
            borderColor: 'divider',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            mb: 1,
          }}
        >
          {/* Initials avatar */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#2D69EB',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Box>
          {/* Student name + email */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </Typography>
            <Typography sx={{ fontSize: 10, color: '#828283', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email}
            </Typography>
          </Box>
        </Box>

        {/* Logout button */}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            px: 1.5,
            minHeight: 36,
            borderRadius: 1,
            color: '#474B53',
            justifyContent: 'center',
            gap: 0.75,
            '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
          }}
        >
          <LogOut size={16} strokeWidth={1.8} />
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'inherit' }}>Logout</Typography>
        </ListItemButton>
      </Box>
    </Box>
  )
}

export function StudentLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  // Fetch the student profile once to fill the sidebar/topbar (name, email, batch)
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

  // Current page title shown in the breadcrumb
  const current = NAV_ITEMS.find((item) => isPathActive(pathname, item.to))
  const title = current?.label || 'Dashboard'

  return (
<<<<<<< Updated upstream
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFA' }}>
=======
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: '100vh',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        bgcolor: '#F8FAFA',
      }}
    >
>>>>>>> Stashed changes
      {/* Desktop sidebar (always visible on md+) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderColor: '#E2E8F0' },
        }}
      >
        <SidebarContent pathname={pathname} profile={profile} />
      </Drawer>

<<<<<<< Updated upstream
      {/* Mobile sidebar (overlay, opened via the hamburger menu) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
=======
      {/* Main Layout Column */}
      <Box
        component="main"
>>>>>>> Stashed changes
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F7F9FA',
          overflow: 'hidden',
        }}
      >
<<<<<<< Updated upstream
        <SidebarContent pathname={pathname} profile={profile} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', bgcolor: '#F7F9FA' }}>
        {/* Topbar: hamburger (mobile), breadcrumb, batch badge, date */}
=======
        {/* Topbar Header */}
>>>>>>> Stashed changes
        <AppBar
          position="static"
          elevation={0}
          color="inherit"
<<<<<<< Updated upstream
          sx={{ height: 64, justifyContent: 'center', bgcolor: '#ffffff', borderBottom: 1, borderColor: 'divider' }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: '64px !important' }}>
            <IconButton
              edge="start"
              sx={{ mr: 1, display: { md: 'none' }, color: '#0A0A0A', '&:hover': { bgcolor: '#F0F5FF' } }}
              onClick={() => setMobileOpen(true)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </IconButton>
=======
          sx={{
            height: 64,
            flexShrink: 0,
            justify: 'center',
            bgcolor: '#ffffff',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: '64px !important' }}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1.5, alignItems: 'center' }}>
              <Logo />
            </Box>
>>>>>>> Stashed changes

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: { xs: 12, sm: 14 }, fontWeight: 500, color: '#0A0A0A', whiteSpace: 'nowrap' }}>
                Home
              </Typography>
              <ChevronRight size={14} color="#828283" />
              <Typography sx={{ fontSize: { xs: 12, sm: 14 }, fontWeight: 600, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {title}
              </Typography>
            </Box>

            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#828283', display: { xs: 'none', md: 'block' } }}>
              {todayLabel()}
            </Typography>
          </Toolbar>
        </AppBar>

<<<<<<< Updated upstream
        {/* Page content (rendered by the nested route via Outlet) */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
=======
        {/* Scrollable Center Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: { xs: 2, sm: 3, md: 4 },
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
>>>>>>> Stashed changes
            <Outlet />
          </Box>
        </Box>

        {/* Fixed Mobile Bottom Navigation Bar */}
        <Paper
          elevation={6}
          sx={{
            flexShrink: 0,
            display: { xs: 'block', md: 'none' },
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: '#ffffff',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
            zIndex: 1100,
          }}
        >
          <BottomNavigation
            showLabels
            value={NAV_ITEMS.find((item) => isPathActive(pathname, item.to))?.to || false}
            onChange={(event, newValue) => {
              if (newValue) navigate(newValue)
            }}
            sx={{
              height: 60,
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                px: 0.5,
                py: 0.5,
                color: '#828283',
                '&.Mui-selected': {
                  color: '#2D69EB',
                  fontWeight: 600,
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: 10,
                  '&.Mui-selected': {
                    fontSize: 10,
                  },
                },
              },
            }}
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <BottomNavigationAction
                  key={item.to}
                  label={item.label}
                  value={item.to}
                  icon={<Icon size={18} />}
                />
              )
            })}
          </BottomNavigation>
        </Paper>
      </Box>
    </Box>
  )
}
