import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Stack, Avatar, Fade, Button, Tooltip } from '@mui/material';
import { AccountBalance, BugReport, Notifications, Payment, Announcement, ReportProblem } from '@mui/icons-material';

const mockUserData = {
  myDues: 3200,
  myComplaints: 2,
  unreadNotices: 1,
  recentNotices: [
    { id: 1, title: 'Water Supply Interruption', date: '2024-03-15', unread: true },
    { id: 2, title: 'Fire Drill', date: '2024-03-14', unread: false },
  ],
  myComplaintsList: [
    { id: 1, title: 'Water Leakage', status: 'Pending', date: '2024-03-10' },
    { id: 2, title: 'Lift Not Working', status: 'Resolved', date: '2024-03-05' },
  ],
};

const glass = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
  border: '1px solid rgba(255,255,255,0.18)',
};

const quickActions = [
  { label: 'Pay Dues', icon: <Payment />, color: 'success', onClick: () => {} },
  { label: 'Raise Complaint', icon: <ReportProblem />, color: 'warning', onClick: () => {} },
  { label: 'View Notices', icon: <Announcement />, color: 'info', onClick: () => {} },
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

const UserDashboard = () => (
  <Box>
    <Typography variant="h5" fontWeight={800} color="primary.main" mb={3}>Welcome to Your Dashboard</Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}><StatCard title="My Dues" value={`₹${mockUserData.myDues}`} icon={<AccountBalance />} color="success" /></Grid>
      <Grid item xs={12} md={4}><StatCard title="My Complaints" value={mockUserData.myComplaints} icon={<BugReport />} color="warning" /></Grid>
      <Grid item xs={12} md={4}><StatCard title="Unread Notices" value={mockUserData.unreadNotices} icon={<Notifications />} color="info" /></Grid>
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
    {/* Recent Notices */}
    <Card sx={{ ...glass, borderRadius: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={2}>Recent Notices</Typography>
        <Stack spacing={2}>
          {mockUserData.recentNotices.map((notice) => (
            <Stack key={notice.id} direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: notice.unread ? 'info.main' : 'grey.300', width: 36, height: 36 }}><Announcement /></Avatar>
              <Box flexGrow={1}>
                <Typography variant="subtitle1" fontWeight={700}>{notice.title}</Typography>
                <Typography variant="caption" color="text.secondary">{notice.date}</Typography>
              </Box>
              {notice.unread && <Typography color="info.main" fontWeight={700}>Unread</Typography>}
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
    {/* My Complaints */}
    <Card sx={{ ...glass, borderRadius: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={2}>My Complaints</Typography>
        <Stack spacing={2}>
          {mockUserData.myComplaintsList.map((complaint) => (
            <Stack key={complaint.id} direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: complaint.status === 'Resolved' ? 'success.main' : 'warning.main', width: 36, height: 36 }}><BugReport /></Avatar>
              <Box flexGrow={1}>
                <Typography variant="subtitle1" fontWeight={700}>{complaint.title}</Typography>
                <Typography variant="caption" color="text.secondary">{complaint.date}</Typography>
              </Box>
              <Typography color={complaint.status === 'Resolved' ? 'success.main' : 'warning.main'} fontWeight={700}>{complaint.status}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  </Box>
);

export default UserDashboard; 