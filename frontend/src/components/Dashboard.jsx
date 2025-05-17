import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  BugReport as BugReportIcon,
  Notifications as NotificationsIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

// Mock data - replace with actual API data
const mockStats = [
  {
    id: 1,
    title: 'Total Members',
    value: '150',
    icon: <PeopleIcon color="primary" />,
    trend: 5,
  },
  {
    id: 2,
    title: 'Monthly Collection',
    value: '₹2,50,000',
    icon: <AccountBalanceIcon color="success" />,
    trend: -2,
  },
  {
    id: 3,
    title: 'Pending Complaints',
    value: '8',
    icon: <BugReportIcon color="error" />,
    trend: 0,
  },
  {
    id: 4,
    title: 'Active Notices',
    value: '5',
    icon: <NotificationsIcon color="warning" />,
    trend: 0,
  },
];

const mockActivities = [
  {
    id: 1,
    title: 'New Member Registration',
    description: 'John Doe registered as a new member',
    time: '2 hours ago',
  },
  {
    id: 2,
    title: 'Maintenance Payment',
    description: 'Jane Smith paid monthly maintenance',
    time: '3 hours ago',
  },
  {
    id: 3,
    title: 'Complaint Resolved',
    description: 'Water leakage issue in Block A resolved',
    time: '5 hours ago',
  },
  {
    id: 4,
    title: 'New Notice Posted',
    description: 'Monthly maintenance collection notice',
    time: '1 day ago',
  },
];

const mockQuickActions = [
  {
    id: 1,
    title: 'Add New Member',
    icon: <AddIcon />,
    action: () => console.log('Add member'),
  },
  {
    id: 2,
    title: 'Record Payment',
    icon: <AccountBalanceIcon />,
    action: () => console.log('Record payment'),
  },
  {
    id: 3,
    title: 'Post Notice',
    icon: <NotificationsIcon />,
    action: () => console.log('Post notice'),
  },
  {
    id: 4,
    title: 'Register Complaint',
    icon: <BugReportIcon />,
    action: () => console.log('Register complaint'),
  },
];

const StatCard = ({ title, value, icon, trend }) => (
  <Card sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ mr: 2 }}>{icon}</Box>
      <Typography variant="h6" component="div">
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" component="div" sx={{ mb: 1 }}>
      {value}
    </Typography>
    {trend && (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          variant="body2"
          color={trend > 0 ? 'success.main' : 'error.main'}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {trend > 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
          {Math.abs(trend)}%
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          from last month
        </Typography>
      </Box>
    )}
  </Card>
);

const ActivityItem = ({ activity }) => (
  <ListItem>
    <ListItemIcon>{activity.icon}</ListItemIcon>
    <ListItemText
      primary={
        <Box>
          <Typography variant="body1">{activity.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {activity.description}
          </Typography>
        </Box>
      }
      secondary={
        <Typography variant="caption" color="text.secondary">
          {activity.time}
        </Typography>
      }
    />
  </ListItem>
);

const Dashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={3}>
          <StatCard
            title="Total Members"
            value="150"
            icon={<PeopleIcon color="primary" />}
            trend={5}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <StatCard
            title="Monthly Collection"
            value="₹2.5L"
            icon={<AccountBalanceWalletIcon color="primary" />}
            trend={-2}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <StatCard
            title="Pending Complaints"
            value="12"
            icon={<WarningIcon color="primary" />}
            trend={0}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <StatCard
            title="Active Notices"
            value="5"
            icon={<NotificationsIcon color="primary" />}
            trend={0}
          />
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activities
            </Typography>
            <List>
              {mockActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </List>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <List>
              {mockQuickActions.map((action, index) => (
                <ListItem button key={index} onClick={action.action}>
                  <ListItemIcon>{action.icon}</ListItemIcon>
                  <ListItemText primary={action.title} />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 