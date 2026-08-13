import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  ButtonBase,
} from '@mui/material'
import {
  CalendarCheck,
  CheckSquare,
  ChevronRight,
  FolderGit2,
  LayoutDashboard,
  Layers,
  LogOut,
  Users,
  User as UserIcon,
  Moon,
  CalendarClock,
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
  { to: '/schedules', label: 'Schedules', icon: CalendarClock },
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

  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
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
        <ButtonBase
          onClick={handleMenuClick}
          sx={{
            width: '100%',
            p: 1.5,
            borderRadius: 1.5,
            border: 1,
            borderColor: openMenu ? '#2D69EB' : 'divider',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            textAlign: 'left',
            '&:hover': { bgcolor: '#F8FAFA', borderColor: '#2D69EB' }
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
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Admin'}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#828283', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </Typography>
          </Box>
        </ButtonBase>

        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          slotProps={{ paper: { sx: { width: 200, mt: -1, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } } }}
        >
          <MenuItem component={Link} to="/profile" onClick={handleMenuClose} sx={{ py: 1.5, gap: 1.5 }}>
            <UserIcon size={16} color="#474B53" />
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#0A0A0A' }}>Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, gap: 1.5 }}>
            <Moon size={16} color="#474B53" />
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#0A0A0A' }}>Dark Mode</Typography>
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }} sx={{ py: 1.5, gap: 1.5, color: '#DC2626' }}>
            <LogOut size={16} color="currentColor" />
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'inherit' }}>Log out</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  )
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const current = NAV_ITEMS.find((item) => isPathActive(pathname, item.to))
  const title = current?.label || 'Dashboard'

  return (
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
      {/* Desktop Sidebar */}
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

      {/* Main Layout Column */}
      <Box
        component="main"
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
        {/* Topbar Header */}
        <AppBar
          position="static"
          elevation={0}
          color="inherit"
          sx={{
            height: 64,
            flexShrink: 0,
            justifyContent: 'center',
            bgcolor: '#ffffff',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: '64px !important' }}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1.5, alignItems: 'center' }}>
              <Logo />
            </Box>

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
