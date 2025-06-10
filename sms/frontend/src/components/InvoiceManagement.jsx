import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  List as ListIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import InvoiceGenerator from './InvoiceGenerator';
import InvoiceList from './InvoiceList';
import StandardCharges from './StandardCharges';
import PaymentHistory from './PaymentHistory';

const drawerWidth = 240;

const InvoiceManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin/invoices/generate',
      label: 'Generate Invoices',
      icon: <ReceiptIcon />,
    },
    {
      path: '/admin/invoices/list',
      label: 'Invoice List',
      icon: <ListIcon />,
    },
    {
      path: '/admin/invoices/charges',
      label: 'Standard Charges',
      icon: <SettingsIcon />,
    },
    {
      path: '/admin/invoices/payments',
      label: 'Payment History',
      icon: <HistoryIcon />,
    },
  ];

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={sidebarOpen}
        onClose={handleSidebarToggle}
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
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Invoice Management
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.path}
              button
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  handleSidebarToggle();
                }
              }}
              selected={location.pathname === item.path}
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
                  mr: 2,
                  justifyContent: 'center',
                  color: location.pathname === item.path ? 'primary.main' : '#b0b7c3',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#f6f8fb',
        }}
      >
        <Routes>
          <Route path="generate" element={<InvoiceGenerator />} />
          <Route path="list" element={<InvoiceList />} />
          <Route path="charges" element={<StandardCharges />} />
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="*" element={<InvoiceGenerator />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default InvoiceManagement; 