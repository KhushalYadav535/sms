import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
} from '@mui/icons-material';
import { logout } from '../store/authSlice';
import { useUser } from '../context/UserContext';

const drawerWidth = 240;

function Layout() {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userRole, setUserRole } = useUser();

  const menuItems = userRole === 'admin' ? [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Members', icon: <PeopleIcon />, path: '/members' },
    { text: 'Accounting', icon: <AccountBalanceIcon />, path: '/accounting' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Notices', icon: <NotificationsIcon />, path: '/notices' },
    { text: 'Complaints', icon: <ReportProblemIcon />, path: '/complaints' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Profile', icon: <PeopleIcon />, path: '/profile' },
  ] : [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Notices', icon: <NotificationsIcon />, path: '/notices' },
    { text: 'Complaints', icon: <ReportProblemIcon />, path: '/complaints' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Profile', icon: <PeopleIcon />, path: '/profile' },
  ];

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
    dispatch(logout());
    navigate('/login');
    handleProfileMenuClose();
  };

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
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
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
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: open ? 1 : 0, fontWeight: location.pathname === item.path ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        {/* User info at bottom */}
        <Box sx={{ px: 2, py: 3, display: 'flex', alignItems: 'center', gap: 1, borderTop: '1px solid #e5e9f2' }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>{user?.name?.charAt(0) || 'A'}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700}>{user?.email || 'jamesbrown@example.com'}</Typography>
            <Typography variant="caption" color="text.secondary">Admin</Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Top Bar */}
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#fff',
          borderBottom: '1px solid #e5e9f2',
          ml: { sm: `${drawerWidth}px` },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: 72, display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Search */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', bgcolor: '#f6f8fb', borderRadius: 2, px: 2, py: 1, maxWidth: 400 }}>
            <SearchIcon sx={{ color: '#b0b7c3', mr: 1 }} />
            <InputBase placeholder="Search..." sx={{ width: '100%', color: '#495057' }} />
          </Box>
          {/* Action Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 700,
              boxShadow: '0 2px 8px 0 rgba(26,115,232,0.10)',
              textTransform: 'none',
              ml: 3,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Add Notice
          </Button>
          {/* User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 3, gap: 1 }}>
            <Typography variant="body2" fontWeight={700} color="#495057">
              {user?.email || 'jamesbrown@example.com'}
            </Typography>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', ml: 1 }}>
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '72px',
          minHeight: 'calc(100vh - 72px)',
          bgcolor: '#f6f8fb',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout; 