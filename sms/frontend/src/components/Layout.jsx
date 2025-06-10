import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Button,
  InputBase,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  ReportProblem as ReportProblemIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ExitToApp,
  Receipt,
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import Announcements from './Announcements';

const drawerWidth = 240;

function Layout() {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, userRole, setUser } = useUser();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
    handleProfileMenuClose();
  };

  const getNavigationItems = () => {
    if (!userRole) return [];

    switch (userRole) {
      case 'admin':
        return [
          { path: '/admin-dashboard', label: 'Dashboard' },
          { path: '/members', label: 'Members' },
          { path: '/accounting', label: 'Accounting' },
          { path: '/admin/invoices', label: 'Invoices', icon: <Receipt /> },
          { path: '/reports', label: 'Reports' },
          { path: '/notices', label: 'Notices' },
          { path: '/complaints', label: 'Complaints' },
          { path: '/settings', label: 'Settings' },
        ];
      case 'treasure':
        return [
          { path: '/treasure-dashboard', label: 'Dashboard' },
          { path: '/accounting', label: 'Accounting' },
          { path: '/reports', label: 'Reports' },
          { path: '/settings', label: 'Settings' },
        ];
      case 'security':
        return [
          { path: '/security-dashboard', label: 'Dashboard' },
          { path: '/complaints', label: 'Complaints' },
          { path: '/settings', label: 'Settings' },
        ];
      case 'secretary':
        return [
          { path: '/secretary-dashboard', label: 'Dashboard' },
          { path: '/notices', label: 'Notices' },
          { path: '/settings', label: 'Settings' },
        ];
      default:
        return [
          { path: '/user-dashboard', label: 'Dashboard' },
          { path: '/notices', label: 'Notices' },
          { path: '/complaints', label: 'Complaints' },
          { path: '/settings', label: 'Settings' },
        ];
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Please log in to access this page.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f6f8fb', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#fff',
            borderRight: '1px solid #e5e9f2',
            pt: 2,
            borderRadius: '0 24px 24px 0',
            boxShadow: '2px 0 8px 0 rgba(80,80,200,0.04)',
          },
        }}
      >
        <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>S</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>Society</Typography>
        </Box>
        <Divider />
        <List sx={{ mt: 2 }}>
          {getNavigationItems().map((item) => (
            <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  color: location.pathname === item.path ? 'primary.main' : '#7b809a',
                  bgcolor: location.pathname === item.path ? 'rgba(26,115,232,0.08)' : 'transparent',
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  '&:hover': {
                    bgcolor: 'rgba(26,115,232,0.12)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: location.pathname === item.path ? 'primary.main' : '#b0b7c3',
                  }}
                >
                  {item.label === 'Dashboard' ? <DashboardIcon /> : item.label === 'Members' ? <PeopleIcon /> : item.label === 'Accounting' ? <AccountBalanceIcon /> : item.label === 'Reports' ? <AssessmentIcon /> : item.label === 'Notices' ? <NotificationsIcon /> : item.label === 'Complaints' ? <ReportProblemIcon /> : <SettingsIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{ opacity: open ? 1 : 0, fontWeight: location.pathname === item.path ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        {/* User info at bottom */}
        <Box sx={{ px: 2, py: 3, display: 'flex', alignItems: 'center', gap: 1, borderTop: '1px solid #e5e9f2', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>{user?.name?.charAt(0) || 'A'}</Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700}>{user?.email || 'User'}</Typography>
              <Typography variant="caption" color="text.secondary">{userRole === 'admin' ? 'Admin' : userRole === 'treasure' ? 'Treasure' : userRole === 'security' ? 'Security' : userRole === 'secretary' ? 'Secretary' : 'User'}</Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            sx={{ mt: 2, width: '100%', textTransform: 'none', fontWeight: 600 }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 0,
          minHeight: '100vh',
          bgcolor: '#f6f8fb',
        }}
      >
        <Toolbar />
        <Announcements />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;