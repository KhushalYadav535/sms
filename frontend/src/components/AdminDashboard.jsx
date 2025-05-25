import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Stack, Avatar, Fade, Button, Tooltip } from '@mui/material';
import { People, AccountBalance, BugReport, Notifications, Payment, Announcement, TrendingUp, Add } from '@mui/icons-material';

const mockData = {
  totalMembers: 150,
  totalDues: 250000,
  collectedDues: 180000,
  pendingComplaints: 8,
  totalNotices: 15,
  monthlyDues: [
    { month: 'Jan', amount: 150000 },
    { month: 'Feb', amount: 180000 },
    { month: 'Mar', amount: 220000 },
    { month: 'Apr', amount: 250000 },
    { month: 'May', amount: 280000 },
    { month: 'Jun', amount: 300000 },
  ],
  recentActivities: [
    { id: 1, type: 'payment', description: 'Monthly maintenance paid', amount: 5000, date: '2024-03-15', user: 'John Doe' },
    { id: 2, type: 'complaint', description: 'New complaint registered', status: 'Pending', date: '2024-03-14', user: 'Jane Smith' },
    { id: 3, type: 'notice', description: 'New notice published', title: 'Water Supply', date: '2024-03-13', user: 'Admin' },
  ],
};

const glass = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
  border: '1px solid rgba(255,255,255,0.18)',
};

const quickActions = [
  { label: 'Add Member', icon: <People />, color: 'primary', onClick: () => {} },
  { label: 'Record Payment', icon: <Payment />, color: 'success', onClick: () => {} },
  { label: 'Post Notice', icon: <Announcement />, color: 'info', onClick: () => {} },
];

const StatCard = ({ title, value, icon, color }) => (
  <Fade in timeout={600}>
    <Card sx={{ ...glass, borderRadius: 4, p: 0, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: '0 12px 32px 0 rgba(31,38,135,0.16)' } }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48, boxShadow: 2 }}>{icon}</Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6" fontWeight={700}>{title}</Typography>
            <Typography variant="h4" fontWeight={800}>{value}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Fade>
);

const AdminDashboard = () => (
  <Box>
    <Typography variant="h5" fontWeight={800} color="primary.main" mb={3}>Society Admin Dashboard</Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}><StatCard title="Total Members" value={mockData.totalMembers} icon={<People />} color="primary" /></Grid>
      <Grid item xs={12} md={3}><StatCard title="Total Dues" value={`₹${mockData.totalDues.toLocaleString()}`} icon={<AccountBalance />} color="success" /></Grid>
      <Grid item xs={12} md={3}><StatCard title="Collected Dues" value={`₹${mockData.collectedDues.toLocaleString()}`} icon={<TrendingUp />} color="info" /></Grid>
      <Grid item xs={12} md={3}><StatCard title="Pending Complaints" value={mockData.pendingComplaints} icon={<BugReport />} color="warning" /></Grid>
      <Grid item xs={12} md={3}><StatCard title="Notices" value={mockData.totalNotices} icon={<Notifications />} color="secondary" /></Grid>
    </Grid>
    {/* Quick Actions */}
    <Card sx={{ ...glass, borderRadius: 4, mt: 4, mb: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Stack direction="row" spacing={4} alignItems="center" justifyContent="center" width="100%">
        {quickActions.map((action) => (
          <Tooltip title={action.label} key={action.label} arrow>
            <Button variant="contained" color={action.color} startIcon={action.icon} sx={{ borderRadius: 3, fontWeight: 700, px: 3, py: 1.5, boxShadow: '0 2px 8px 0 rgba(80,80,200,0.10)', textTransform: 'none', fontSize: 16, transition: 'all 0.2s', '&:hover': { transform: 'scale(1.07)' } }} onClick={action.onClick}>{action.label}</Button>
          </Tooltip>
        ))}
      </Stack>
    </Card>
    {/* Recent Activity Timeline */}
    <Card sx={{ ...glass, borderRadius: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={2}>Recent Activity</Typography>
        <Stack spacing={3}>
          {mockData.recentActivities.map((activity, idx) => (
            <Fade in timeout={600} style={{ transitionDelay: `${idx * 100}ms` }} key={activity.id}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>{activity.type === 'payment' ? <Payment /> : activity.type === 'complaint' ? <BugReport /> : <Notifications />}</Avatar>
                <Box flexGrow={1}>
                  <Typography variant="subtitle1" fontWeight={700}>{activity.description}</Typography>
                  <Typography variant="caption" color="text.secondary">{activity.date} • {activity.user}</Typography>
                </Box>
                {activity.amount && (<Typography variant="subtitle1" fontWeight={700} color="success.main">₹{activity.amount.toLocaleString()}</Typography>)}
              </Stack>
            </Fade>
          ))}
        </Stack>
      </CardContent>
    </Card>
  </Box>
);

export default AdminDashboard; 