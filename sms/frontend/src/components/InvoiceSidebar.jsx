import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Receipt,
  Add,
  ListAlt,
  Settings,
  Payment
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const InvoiceSidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Generate Invoices', path: '/admin/invoices/generate', icon: <Add /> },
    { text: 'View Invoices', path: '/admin/invoices/list', icon: <ListAlt /> },
    { text: 'Standard Charges', path: '/admin/invoices/charges', icon: <Settings /> },
    { text: 'Payment History', path: '/admin/invoices/payments', icon: <Payment /> }
  ];

  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Receipt sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Invoice Management
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) {
                onClose();
              }
            }}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              color: location.pathname === item.path ? 'primary.main' : '#7b809a',
              bgcolor: location.pathname === item.path ? 'rgba(26,115,232,0.08)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(26,115,232,0.12)',
              },
              transition: 'all 0.2s',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2,
                justifyContent: 'center',
                color: location.pathname === item.path ? 'primary.main' : '#b0b7c3',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{ opacity: 1, fontWeight: location.pathname === item.path ? 700 : 500 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
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
      {drawer}
    </Drawer>
  );
};

export default InvoiceSidebar; 