import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Stack, Avatar, Fade, Button, Tooltip, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { People, AccountBalance, BugReport, Notifications, Payment, Announcement, TrendingUp, Add, Search } from '@mui/icons-material';
import { fetchAdminDashboardStats, fetchMembers, fetchAccounting, fetchComplaints, fetchNotices } from '../api';
import { useNavigate } from 'react-router-dom';

const glass = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
  border: '1px solid rgba(255,255,255,0.18)',
};

const StatCard = ({ title, value, icon, color, onClick }) => (
  <Fade in timeout={600}>
    <Card 
      sx={{ 
        ...glass, 
        borderRadius: 0, 
        p: 2, 
        minHeight: 120, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        transition: 'transform 0.2s', 
        '&:hover': { 
          transform: 'translateY(-4px) scale(1.03)', 
          boxShadow: '0 12px 32px 0 rgba(31,38,135,0.16)',
          cursor: onClick ? 'pointer' : 'default'
        } 
      }}
      onClick={onClick}
    >
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);
  const [accounting, setAccounting] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isAccountingDialogOpen, setIsAccountingDialogOpen] = useState(false);
  const [isComplaintsDialogOpen, setIsComplaintsDialogOpen] = useState(false);
  const [isNoticesDialogOpen, setIsNoticesDialogOpen] = useState(false);
  const [accountingFilter, setAccountingFilter] = useState('all');
  const [accountingSearch, setAccountingSearch] = useState('');

  const quickActions = [
    { 
      label: 'Add Member', 
      icon: <People />, 
      color: 'primary', 
      onClick: () => navigate('/members') 
    },
    { 
      label: 'Record Payment', 
      icon: <Payment />, 
      color: 'success', 
      onClick: () => navigate('/accounting') 
    },
    { 
      label: 'Post Notice', 
      icon: <Announcement />, 
      color: 'info', 
      onClick: () => navigate('/notices') 
    },
  ];

  useEffect(() => {
    fetchAdminDashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load dashboard');
      setLoading(false);
    });
  }, []);

  const handleMembersClick = async () => {
    try {
      const membersData = await fetchMembers();
      setMembers(membersData);
      setIsMembersDialogOpen(true);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleAccountingClick = async () => {
    try {
      const accountingData = await fetchAccounting();
      setAccounting(accountingData);
      setIsAccountingDialogOpen(true);
    } catch (error) {
      console.error('Error fetching accounting data:', error);
    }
  };

  const handleComplaintsClick = async () => {
    try {
      const complaintsData = await fetchComplaints();
      setComplaints(complaintsData);
      setIsComplaintsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const handleNoticesClick = async () => {
    try {
      const noticesData = await fetchNotices();
      setNotices(noticesData);
      setIsNoticesDialogOpen(true);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  const filteredAccounting = accounting.filter(entry => {
    const matchesFilter = accountingFilter === 'all' || entry.type === accountingFilter;
    const matchesSearch = accountingSearch === '' || 
      entry.description.toLowerCase().includes(accountingSearch.toLowerCase()) ||
      entry.amount.toString().includes(accountingSearch) ||
      new Date(entry.date).toLocaleDateString().includes(accountingSearch);
    return matchesFilter && matchesSearch;
  });

  const totalIncome = filteredAccounting
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const totalExpense = filteredAccounting
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!stats) return null;

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} color="primary.main" mb={3}>Society Admin Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Total Members" 
            value={stats.totalMembers} 
            icon={<People />} 
            color="primary" 
            onClick={handleMembersClick}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Total Dues" 
            value={`₹${stats.totalDues?.toLocaleString?.() ?? stats.totalDues}`} 
            icon={<AccountBalance />} 
            color="success" 
            onClick={handleAccountingClick}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Collected Dues" 
            value={`₹${stats.collectedDues?.toLocaleString?.() ?? stats.collectedDues}`} 
            icon={<TrendingUp />} 
            color="info" 
            onClick={handleAccountingClick}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Pending Complaints" 
            value={stats.pendingComplaints} 
            icon={<BugReport />} 
            color="warning" 
            onClick={handleComplaintsClick}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Notices" 
            value={stats.totalNotices} 
            icon={<Notifications />} 
            color="secondary" 
            onClick={handleNoticesClick}
          />
        </Grid>
      </Grid>
      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Quick Actions</Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Button
                variant="contained"
                color={action.color}
                startIcon={action.icon}
                onClick={action.onClick}
                fullWidth
                sx={{
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                  transition: 'all 0.2s',
                }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Recent Activity Timeline */}
      <Card sx={{ ...glass, borderRadius: 0, mt: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>Recent Activity</Typography>
          <Stack spacing={3}>
            {stats.recentActivities.map((activity, idx) => (
              <Fade in timeout={600} style={{ transitionDelay: `${idx * 100}ms` }} key={activity.id}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>{activity.type === 'payment' ? <Payment /> : activity.type === 'complaint' ? <BugReport /> : <Notifications />}</Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" fontWeight={700}>{activity.description}</Typography>
                    <Typography variant="caption" color="text.secondary">{activity.date} • {activity.user}</Typography>
                  </Box>
                  {activity.amount && (<Typography variant="subtitle1" fontWeight={700} color="success.main">₹{activity.amount.toLocaleString?.() ?? activity.amount}</Typography>)}
                </Stack>
              </Fade>
            ))}
          </Stack>
        </CardContent>
      </Card>
      {/* Members List Dialog */}
      <Dialog 
        open={isMembersDialogOpen} 
        onClose={() => setIsMembersDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>All Members</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>House Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone_number}</TableCell>
                    <TableCell>{member.house_number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
      {/* Accounting Dialog */}
      <Dialog 
        open={isAccountingDialogOpen} 
        onClose={() => setIsAccountingDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <AccountBalance color="primary" />
            <Typography variant="h6">Accounting Details</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search transactions..."
                  value={accountingSearch}
                  onChange={(e) => setAccountingSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Type</InputLabel>
                  <Select
                    value={accountingFilter}
                    label="Filter by Type"
                    onChange={(e) => setAccountingFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Transactions</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="subtitle2">Total Income</Typography>
                  <Typography variant="h6">₹{totalIncome.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="subtitle2">Total Expense</Typography>
                  <Typography variant="h6">₹{totalExpense.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="subtitle2">Net Balance</Typography>
                  <Typography variant="h6">₹{(totalIncome - totalExpense).toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounting.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          No transactions found.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounting.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={entry.type}
                          color={entry.type === 'income' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        color: entry.type === 'income' ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}>
                        ₹{Number(entry.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
      {/* Complaints Dialog */}
      <Dialog 
        open={isComplaintsDialogOpen} 
        onClose={() => setIsComplaintsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>All Complaints</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell>{complaint.title}</TableCell>
                    <TableCell>{complaint.status}</TableCell>
                    <TableCell>{new Date(complaint.date).toLocaleDateString()}</TableCell>
                    <TableCell>{complaint.user_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
      {/* Notices Dialog */}
      <Dialog 
        open={isNoticesDialogOpen} 
        onClose={() => setIsNoticesDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>All Notices</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Content</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell>{notice.title}</TableCell>
                    <TableCell>{new Date(notice.date).toLocaleDateString()}</TableCell>
                    <TableCell>{notice.content}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;