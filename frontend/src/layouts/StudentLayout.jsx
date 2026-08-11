import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  User,
  Users,
} from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import authService from '../services/authService.js';

const NAV_ITEMS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/student/profile', label: 'Profile', icon: <User size={20} /> },
  { to: '/student/attendance', label: 'Attendance', icon: <CalendarCheck size={20} /> },
  { to: '/student/team', label: 'Team', icon: <Users size={20} /> },
  { to: '/student/tasks', label: 'Tasks', icon: <ClipboardList size={20} /> },
];

const NavList = ({ onNavigate }) => (
  <List sx={{ display: 'flex', gap: 0.5, px: 1 }}>
    {NAV_ITEMS.map((item) => (
      <ListItem key={item.to} disablePadding sx={{ width: 'auto' }}>
        <ListItemButton
          component={NavLink}
          to={item.to}
          onClick={onNavigate}
          sx={{
            borderRadius: 2,
            color: 'text.secondary',
            '&.active': {
              color: 'primary.main',
              bgcolor: '#F0F5FF',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
        </ListItemButton>
      </ListItem>
    ))}
  </List>
);

const StudentLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const email = user?.email || 'student@lms.com';
  const name = user?.name || email.split('@')[0] || 'Student';
  const initial = name.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // token is discarded client-side regardless
    } finally {
      signOut();
      navigate('/login', { replace: true });
    }
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFB' }}>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 2, justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <GraduationCap size={28} color="#1976d2" />
            <Typography variant="h6" fontWeight={600} sx={{ display: { xs: 'none', md: 'block' } }}>
              Bootcamp LMS
            </Typography>
          </Stack>

          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <NavList />
          </Box>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
              {name}
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {initial}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate('/student/profile');
                }}
              >
                <ListItemIcon>
                  <User size={18} />
                </ListItemIcon>
                My Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogOut size={18} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { sm: 'none' } }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2 }}>
          <GraduationCap size={28} color="#1976d2" />
          <Typography variant="h6" fontWeight={600}>
            Bootcamp LMS
          </Typography>
        </Stack>
        <NavList onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box
        component="main"
        sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default StudentLayout;
