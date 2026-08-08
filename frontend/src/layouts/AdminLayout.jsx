import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  CalendarCheck,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Users,
  UsersRound,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Logo } from '../components/ui/Logo'

const DRAWER_WIDTH = 240

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview of your section this week' },
  { to: '/students', label: 'Students', icon: Users, description: 'Manage student profiles and batches' },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck, description: 'Mark and review daily attendance' },
  { to: '/teams', label: 'Teams', icon: UsersRound, description: 'Organize students into teams' },
  { to: '/projects', label: 'Projects', icon: FolderKanban, description: 'Track team projects' },
  { to: '/tasks', label: 'Tasks', icon: ListTodo, description: 'Manage and assign tasks' },
]

function isPathActive(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

function SidebarContent({ pathname, onNavigate }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Logo />
      </Box>
      <List sx={{ px: 1, flexGrow: 1 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 1.5,
            py: 0.75,
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          Admin
        </Typography>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.to}
            component={Link}
            to={item.to}
            selected={isPathActive(pathname, item.to)}
            onClick={onNavigate}
            sx={{ mb: 0.25 }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <item.icon size={20} />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { fontSize: 14, fontWeight: 500 } }}
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ px: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <LogOut size={18} />
          </ListItemIcon>
          <ListItemText primary="Logout" slotProps={{ primary: { fontSize: 14, fontWeight: 500 } }} />
        </ListItemButton>
      </Box>
    </Box>
  )
}

export function AdminLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const current = NAV_ITEMS.find((item) => isPathActive(pathname, item.to))
  const title = current?.label || 'Dashboard'
  const description = current?.description || ''

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        open
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        <SidebarContent pathname={pathname} />
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              sx={{ mr: 1.5, display: { md: 'none' } }}
              onClick={() => setMobileOpen(true)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: -0.2 }}>
                {title}
              </Typography>
              {description && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                  {description}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1.5, mr: 1 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user?.name || 'Admin'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <TopbarLogoutButton />
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function TopbarLogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <IconButton onClick={handleLogout} aria-label="Logout" sx={{ color: 'text.secondary' }}>
      <LogOut size={18} />
    </IconButton>
  )
}
