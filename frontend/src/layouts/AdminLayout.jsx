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
  CheckSquare,
  ChevronRight,
  FolderGit2,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Users,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Logo } from '../components/ui/Logo'

const DRAWER_WIDTH = 240

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/teams', label: 'Teams', icon: Layers },
  { to: '/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
]

function isPathActive(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function SidebarContent({ pathname, onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#F8FAFA' }}>
      <Box
        sx={{
          px: 2,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Logo />
      </Box>

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
          Management
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

      <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
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
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Admin'}
            </Typography>
            <Typography sx={{ fontSize: 10, color: '#828283', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>

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

export function AdminLayout() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const current = NAV_ITEMS.find((item) => isPathActive(pathname, item.to))
  const title = current?.label || 'Dashboard'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFA' }}>
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
        <SidebarContent pathname={pathname} />
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderColor: '#E2E8F0' },
        }}
      >
        <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', bgcolor: '#F7F9FA' }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
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

        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
