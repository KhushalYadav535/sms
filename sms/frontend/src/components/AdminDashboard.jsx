import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Stack, Avatar, Fade, Button, Tooltip, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Chip, Alert, CircularProgress, DialogActions, IconButton, useTheme } from '@mui/material';
import { People, AccountBalance, BugReport, Notifications, Payment, Announcement, TrendingUp, Add, Search, Edit, Delete, Receipt } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from '../config/axios';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import InvoiceGenerator from './InvoiceGenerator';

const glass = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
  border: '1px solid rgba(255,255,255,0.18)',
};

const API_BASE_URL = 'http://localhost:5000/api/accounting';

const StatCard = ({ title, value, icon, color, onClick }) => (
  <Card 
    sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: 3
      }
    }}
    onClick={onClick}
  >
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>{icon}</Avatar>
        <Box flexGrow={1}>
          <Typography variant="h6" color="text.secondary">{title}</Typography>
          <Typography variant="h4" component="div" fontWeight="bold">{value}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole } = useUser();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalMembers: 0,
      totalComplaints: 0,
      totalIncome: 0,
      totalExpenses: 0
    },
    recentUsers: [],
    recentComplaints: []
  });
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [showAddUser, setShowAddUser] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStat, setSelectedStat] = useState(null);
  const [statDetails, setStatDetails] = useState([]);
  const [statError, setStatError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    total_income: 0,
    total_expense: 0,
    total_transactions: 0
  });
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [formError, setFormError] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const theme = useMuiTheme();
  const [openStatDialog, setOpenStatDialog] = useState(false);
  const [statType, setStatType] = useState('');
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);

  useEffect(() => {
    if (!user || userRole !== 'admin') {
      setError('Unauthorized access. Admin privileges required.');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [usersResponse, dashboardResponse, announcementsResponse] = await Promise.all([
          fetchUsers(),
          fetchDashboardData(),
          fetchAnnouncements()
        ]);
        setUsers(usersResponse);
        setDashboardData(dashboardResponse);
        setAnnouncements(announcementsResponse);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, userRole]);

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, accountingResponse] = await Promise.all([
        axios.get('/users/admin/dashboard'),
        axios.get('/accounting/stats')
      ]);

      console.log('Accounting Response:', accountingResponse.data); // Debug log

      const updatedDashboardData = {
        stats: {
          ...dashboardResponse.data.stats,
          totalIncome: accountingResponse.data.total_income || 0,
          totalExpenses: accountingResponse.data.total_expense || 0
        },
        recentUsers: dashboardResponse.data.recentUsers,
        recentComplaints: dashboardResponse.data.recentComplaints
      };

      console.log('Updated Dashboard Data:', updatedDashboardData); // Debug log
      setDashboardData(updatedDashboardData);
      return updatedDashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      throw error;
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/accounting');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/accounting/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch accounting statistics');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/announcements');
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const response = await axios.post('/api/users', newUser);
      if (response.data) {
        setSuccess('User created successfully');
        setShowAddUser(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'user'
        });
        await fetchUsers();
      }
    } catch (error) {
      if (error.response) {
        console.error('Error creating user:', error.response);
        setError(
          error.response.data?.message ||
          error.response.data?.error ||
          JSON.stringify(error.response.data) ||
          `Error: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response received from server. Please check your connection or try again later.');
      } else {
        console.error('Error creating user:', error.message);
        setError('An unexpected error occurred: ' + error.message);
      }
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setError('');
      const response = await axios.put(`/users/${userId}/role`, { role: newRole });
      if (response.data) {
        setSuccess('User role updated successfully');
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      setError('');
      const response = await axios.delete(`/users/${userId}`);
      if (response.data) {
        setSuccess('User deleted successfully');
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleStatClick = async (type) => {
    try {
      setLoading(true);
      setStatError(null);
      let data = [];
      let title = '';

      switch (type) {
        case 'users':
          const usersResponse = await axios.get('/api/users');
          data = usersResponse.data;
          title = 'User Details';
          break;
        case 'members':
          const membersResponse = await axios.get('/api/members');
          data = membersResponse.data;
          title = 'Member Details';
          break;
        case 'complaints':
          const complaintsResponse = await axios.get('/api/complaints');
          data = complaintsResponse.data;
          title = 'Complaint Details';
          break;
        case 'income':
          const incomeResponse = await axios.get('/api/accounting/income');
          data = incomeResponse.data;
          title = 'Income Details';
          break;
        case 'expenses':
          const expensesResponse = await axios.get('/api/accounting/expenses');
          data = expensesResponse.data;
          title = 'Expense Details';
          break;
        default:
          throw new Error('Invalid stat type');
      }

      if (!Array.isArray(data)) {
        throw new Error(`Invalid data format received for ${type}`);
      }

      setStatDetails(data);
      setStatType(type);
      setOpenStatDialog(true);
      
      // Refresh dashboard data after fetching details
      await fetchDashboardData();
    } catch (error) {
      console.error(`Error fetching ${type} details:`, error);
      setStatError(`Failed to load ${type} details. Please try again later.`);
      setOpenStatDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseStatDialog = () => {
    setOpenStatDialog(false);
    setStatType('');
    setStatDetails([]);
    setStatError('');
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.amount || !formData.description || !formData.date) {
        setFormError(true);
        return;
      }
      setFormError(false);

      const transactionData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        member_id: 1 // Using a default member ID for now
      };

      const response = await axios.post(API_BASE_URL, transactionData);
      setTransactions([response.data, ...transactions]);
      setShowTransactionDialog(false);
      setFormData({
        type: 'income',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error saving transaction:', error);
      setError(error.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setSelectedAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority,
        startDate: announcement.startDate,
        endDate: announcement.endDate
      });
    } else {
      setSelectedAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        type: 'notice',
        priority: 'normal',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnnouncement(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAnnouncement) {
        await axios.put(`/api/announcements/${selectedAnnouncement.id}`, formData);
      } else {
        await axios.post('/api/announcements', formData);
      }
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`/api/announcements/${id}`);
        const updatedAnnouncements = await fetchAnnouncements();
        setAnnouncements(updatedAnnouncements);
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'normal':
        return 'primary';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const renderStatDetails = () => {
    if (!openStatDialog) return null;

    const columns = {
      users: ['Name', 'Email', 'Role'],
      members: ['Name', 'House Number', 'Phone'],
      complaints: ['Title', 'Status', 'Date'],
      income: ['Amount', 'Description', 'Date', 'Member'],
      expenses: ['Amount', 'Description', 'Date', 'Member']
    };

    const getColumnValue = (item, column) => {
      switch (column) {
        case 'Amount':
          return `₹${Number(item.amount).toLocaleString()}`;
        case 'Date':
          return new Date(item.date).toLocaleDateString();
        case 'Member':
          return item.member_name || 'N/A';
        default:
          return item[column.toLowerCase().replace(' ', '_')] || 'N/A';
      }
    };

    return (
      <Dialog 
        open={openStatDialog} 
        onClose={handleCloseStatDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {statType.charAt(0).toUpperCase() + statType.slice(1)} Details
        </DialogTitle>
        <DialogContent>
          {statError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {statError}
            </Alert>
          ) : null}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {columns[statType].map((column) => (
                      <TableCell key={column}>{column}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statDetails.map((item, index) => (
                    <TableRow key={index}>
                      {columns[statType].map((column) => (
                        <TableCell key={column}>
                          {getColumnValue(item, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (!user || userRole !== 'admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Unauthorized access. Admin privileges required.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">Admin Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddUser(true)}
          >
            Add New User
          </Button>
          <Button
            variant="contained"
            startIcon={<Receipt />}
            onClick={() => setShowInvoiceGenerator(true)}
          >
            Generate Invoices
          </Button>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card onClick={() => handleStatClick('users')} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, background: theme.palette.action.hover } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4" color="primary.main">
                {dashboardData?.stats?.totalUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card onClick={() => handleStatClick('members')} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, background: theme.palette.action.hover } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Members
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {dashboardData?.stats?.totalMembers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card onClick={() => handleStatClick('complaints')} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, background: theme.palette.action.hover } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Complaints
              </Typography>
              <Typography variant="h4" color="warning.main">
                {dashboardData?.stats?.totalComplaints || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card onClick={() => handleStatClick('income')} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, background: theme.palette.action.hover } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Income
              </Typography>
              <Typography variant="h4" color="success.main">
                ₹{Number(dashboardData?.stats?.totalIncome || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card onClick={() => handleStatClick('expenses')} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, background: theme.palette.action.hover } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" color="error.main">
                ₹{Number(dashboardData?.stats?.totalExpenses || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stat Details Dialog */}
      <Dialog open={openStatDialog} onClose={handleCloseStatDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {statType === 'users' && 'All Users'}
          {statType === 'members' && 'All Members'}
          {statType === 'complaints' && 'All Complaints'}
          {statType === 'income' && 'All Income Transactions'}
          {statType === 'expenses' && 'All Expense Transactions'}
        </DialogTitle>
        <DialogContent>
          {statError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {statError}
            </Alert>
          ) : null}
          {statType === 'users' || statType === 'members' ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statDetails && statDetails.length > 0 ? (
                    statDetails.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
          {(statType === 'income' || statType === 'expenses') ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Member</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statDetails && statDetails.length > 0 ? (
                    statDetails.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.date ? new Date(t.date).toLocaleDateString() : ''}</TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell align="right">₹{parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell>{t.member_name || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>Recent Users</Typography>
              <Stack spacing={2}>
                {dashboardData?.recentUsers?.map((user) => (
                  <Box key={user.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">{user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                    </Box>
                    <Chip
                      label={user.role}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>Recent Complaints</Typography>
              <Stack spacing={2}>
                {dashboardData?.recentComplaints?.map((complaint) => (
                  <Box key={complaint.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">{complaint.title}</Typography>
                      <Typography variant="body2" color="text.secondary">by {complaint.user_name}</Typography>
                    </Box>
                    <Chip
                      label={complaint.status}
                      size="small"
                      color={
                        complaint.status === 'pending' ? 'warning' :
                        complaint.status === 'resolved' ? 'success' : 'error'
                      }
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>Users</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(users) ? users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <FormControl size="small">
                            <Select
                              value={user.role}
                              onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                              sx={{ minWidth: 120 }}
                            >
                              <MenuItem value="user">User</MenuItem>
                              <MenuItem value="treasure">Treasure</MenuItem>
                              <MenuItem value="security">Security</MenuItem>
                              <MenuItem value="secretary">Secretary</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            color="error"
                            size="small"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : null}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {renderStatDetails()}

      <Dialog open={showAddUser} onClose={() => setShowAddUser(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddUser}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  label="Role"
                  required
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="treasure">Treasure</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="secretary">Secretary</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => setShowAddUser(false)}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary">
                  Create User
                </Button>
              </Stack>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={showTransactionDialog} onClose={() => setShowTransactionDialog(false)}>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleTransactionSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }} error={formError}>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              sx={{ mb: 2 }}
              error={formError}
              helperText={formError ? 'Amount is required' : ''}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
              error={formError}
              helperText={formError ? 'Description is required' : ''}
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              error={formError}
              helperText={formError ? 'Date is required' : ''}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Save Transaction
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Transactions Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Transactions</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowTransactionDialog(true)}
                >
                  Add Transaction
                </Button>
              </Stack>
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
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            color={transaction.type === 'income' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>₹{transaction.amount}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {location.pathname === '/admin-dashboard' && userRole === 'admin' && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Announcement />
              Announcements
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              New Announcement
            </Button>
          </Box>

          <Grid container spacing={3}>
            {announcements.map((announcement) => (
              <Grid item xs={12} md={6} lg={4} key={announcement.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {announcement.title}
                      </Typography>
                      <Box>
                        <IconButton size="small" onClick={() => handleOpenDialog(announcement)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(announcement.id)}>
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {announcement.content}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      <Chip
                        label={announcement.type}
                        color={announcement.type === 'event' ? 'warning' : 'primary'}
                        size="small"
                      />
                      <Chip
                        label={announcement.priority}
                        color={getPriorityColor(announcement.priority)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                      <Typography variant="caption">
                        From: {new Date(announcement.startDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption">
                        To: {new Date(announcement.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Announcement Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAnnouncement ? 'Edit Announcement' : 'New Announcement'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="notice">Notice</MenuItem>
              <MenuItem value="event">Event</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedAnnouncement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showInvoiceGenerator}
        onClose={() => setShowInvoiceGenerator(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Invoice Generator</DialogTitle>
        <DialogContent>
          <InvoiceGenerator />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInvoiceGenerator(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;