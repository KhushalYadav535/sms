import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  IconButton,
  Stack,
  Avatar,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AttachMoney,
  Receipt,
  Payment
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import axios from '../config/axios';

const API_BASE_URL = '/accounting';

const StatCard = ({ title, value, subvalue, subtitle, icon: Icon, color, onClick }) => (
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
        <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
          {Icon}
        </Avatar>
        <Box flexGrow={1}>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            ₹{value.toLocaleString()}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {subvalue && (
            <Typography variant="body2" color="text.secondary">
              {subvalue}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const UnifiedAccounting = () => {
  const { user, userRole } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    total_income: 0,
    total_expense: 0,
    total_transactions: 0,
    monthly_income: 0,
    monthly_expense: 0,
    income_trend: 0,
    expense_trend: 0,
    balance_trend: 0
  });

  const [members, setMembers] = useState([]);

  // State for selected member profile
  const [selectedMemberProfile, setSelectedMemberProfile] = useState(null);

  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    member_id: ''
  });

  // Restore editingTransaction state
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Check if user has permission to modify transactions
  const canModifyTransactions = userRole === 'admin' || userRole === 'treasurer' || userRole === 'treasure';
  // Only admin can delete transactions
  const canDeleteTransactions = userRole === 'admin';

  // Fetch selected member profile when dialog opens or member_id changes
  useEffect(() => {
    if (showAddDialog && (userRole === 'admin' || userRole === 'treasurer' || userRole === 'treasure')) {
      let memberId = formData.member_id;
      if (!memberId && members.length > 0) {
        memberId = members[0].id;
        setFormData(f => ({ ...f, member_id: memberId }));
      }
      if (memberId) {
        fetch(`/api/members/${memberId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
          .then(res => res.json())
          .then(data => setSelectedMemberProfile(data))
          .catch(() => setSelectedMemberProfile(null));
      }
    } else {
      setSelectedMemberProfile(null);
    }
    // eslint-disable-next-line
  }, [showAddDialog, formData.member_id, userRole, members]);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    // Fetch members if admin/treasurer/treasure
    if (userRole === 'admin' || userRole === 'treasurer' || userRole === 'treasure') {
      import('../api').then(api => {
        api.fetchMembers()
          .then(data => setMembers(data))
          .catch(() => setMembers([]));
      });
    }
  }, [userRole]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      const data = response.data;
      
      if (data) {
        setStats({
          total_income: data.total_income || 0,
          total_expense: data.total_expense || 0,
          total_transactions: data.total_transactions || 0,
          monthly_income: data.monthly_income || 0,
          monthly_expense: data.monthly_expense || 0,
          income_trend: data.income_trend || 0,
          expense_trend: data.expense_trend || 0,
          balance_trend: data.balance_trend || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics');
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!canModifyTransactions) {
      setError('You do not have permission to add transactions');
      return;
    }

    try {
      setError('');
      // Only send member_id if admin/treasurer
      const payload = { ...formData };
      if (!(userRole === 'admin' || userRole === 'treasure')) {
        delete payload.member_id;
      }
      await axios.post(API_BASE_URL, payload);
      setSuccess('Transaction added successfully');
      setShowAddDialog(false);
      setFormData({
        type: 'income',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError(error.response?.data?.message || 'Failed to add transaction');
    }
  };

  const handleEditTransaction = async () => {
    if (!canModifyTransactions) {
      setError('You do not have permission to edit transactions');
      return;
    }

    try {
      setError('');
      await axios.put(`${API_BASE_URL}/${editingTransaction.id}`, editingTransaction);
      setSuccess('Transaction updated successfully');
      setShowEditDialog(false);
      setEditingTransaction(null);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error updating transaction:', error);
      setError(error.response?.data?.message || 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!canDeleteTransactions) {
      setError('You do not have permission to delete transactions');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      setError('');
      await axios.delete(`${API_BASE_URL}/${id}`);
      setSuccess('Transaction deleted successfully');
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">Accounting Dashboard</Typography>
        {canModifyTransactions && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddDialog(true)}
          >
            Add Transaction
          </Button>
        )}
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Income"
            value={stats.total_income}
            subtitle="This Month"
            subvalue={`₹${stats.monthly_income.toLocaleString()}`}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Expenses"
            value={stats.total_expense}
            subtitle="This Month"
            subvalue={`₹${stats.monthly_expense.toLocaleString()}`}
            icon={<TrendingDown />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Balance"
            value={stats.total_income - stats.total_expense}
            subtitle="Current Balance"
            icon={<AccountBalance />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Transactions"
            value={stats.total_transactions}
            icon={<Receipt />}
            color="info"
          />
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="All Transactions" />
          <Tab label="Income" />
          <Tab label="Expenses" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                {canModifyTransactions && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                .filter(transaction => {
                  if (activeTab === 1) return transaction.type === 'income';
                  if (activeTab === 2) return transaction.type === 'expense';
                  return true;
                })
                .map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        color={transaction.type === 'income' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell align="right">
                      ₹{parseFloat(transaction.amount).toLocaleString()}
                    </TableCell>
                    {canModifyTransactions && (
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                        {canDeleteTransactions && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Transaction Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)}>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
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
            {(userRole === 'admin' || userRole === 'treasurer') && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Member</InputLabel>
                  <Select
                    value={formData.member_id || ''}
                    label="Member"
                    onChange={async (e) => {
                      setFormData({ ...formData, member_id: e.target.value });
                      try {
                        const data = await fetchMemberById(e.target.value);
                        setSelectedMemberProfile(data);
                      } catch (err) {
                        setSelectedMemberProfile(null);
                      }
                    }}
                  >
                    {members.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name} ({m.house_number})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* Member profile details */}
                {selectedMemberProfile ? (
                  <Box sx={{ mt: 2, mb: 1, p: 2, border: '1px solid #eee', borderRadius: 2, background: '#fafafa' }}>
                    <Typography variant="subtitle1" fontWeight="bold">Member Details</Typography>
                    <Typography variant="body2">Name: {selectedMemberProfile.name}</Typography>
                    <Typography variant="body2">Email: {selectedMemberProfile.email}</Typography>
                    <Typography variant="body2">House No: {selectedMemberProfile.house_number}</Typography>
                    <Typography variant="body2">Phone: {selectedMemberProfile.phone_number}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                    No details found for this member.
                  </Typography>
                )}
              </>
            )}
            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
            />
            <TextField
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTransaction} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)}>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={editingTransaction?.type || ''}
                label="Type"
                onChange={(e) => setEditingTransaction({ ...editingTransaction, type: e.target.value })}
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              type="number"
              value={editingTransaction?.amount || ''}
              onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={editingTransaction?.description || ''}
              onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
              fullWidth
            />
            <TextField
              label="Category"
              value={editingTransaction?.category || ''}
              onChange={(e) => setEditingTransaction({ ...editingTransaction, category: e.target.value })}
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={editingTransaction?.date || ''}
              onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditTransaction} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnifiedAccounting; 