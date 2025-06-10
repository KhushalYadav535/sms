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
  Stack
} from '@mui/material';
import { Add, Edit, Delete, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import axios from '../config/axios';

const AccountingDashboard = () => {
  const { user, userRole } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });

  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/accounting');
      setTransactions(response.data);
      
      // Calculate stats
      const stats = response.data.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
          acc.totalIncome += parseFloat(transaction.amount);
        } else {
          acc.totalExpenses += parseFloat(transaction.amount);
        }
        return acc;
      }, { totalIncome: 0, totalExpenses: 0 });
      
      stats.balance = stats.totalIncome - stats.totalExpenses;
      setStats(stats);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    try {
      setError('');
      await axios.post('/accounting', newTransaction);
      setSuccess('Transaction added successfully');
      setShowAddDialog(false);
      setNewTransaction({
        type: 'income',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError(error.response?.data?.message || 'Failed to add transaction');
    }
  };

  const handleEditTransaction = async () => {
    try {
      setError('');
      await axios.put(`/accounting/${editingTransaction.id}`, editingTransaction);
      setSuccess('Transaction updated successfully');
      setShowEditDialog(false);
      setEditingTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      setError(error.response?.data?.message || 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      setError('');
      await axios.delete(`/accounting/${id}`);
      setSuccess('Transaction deleted successfully');
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ color: `${color}.main` }}>{icon}</Box>
          <Box>
            <Typography variant="h6" color="text.secondary">{title}</Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              ₹{value.toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">Accounting Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddDialog(true)}
        >
          Add Transaction
        </Button>
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

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Income"
            value={stats.totalIncome}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Expenses"
            value={stats.totalExpenses}
            icon={<TrendingDown />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Balance"
            value={stats.balance}
            icon={<TrendingUp />}
            color={stats.balance >= 0 ? "success" : "error"}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Typography
                    color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                  >
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </Typography>
                </TableCell>
                <TableCell>₹{parseFloat(transaction.amount).toLocaleString()}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setEditingTransaction(transaction);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)}>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Date"
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTransaction} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)}>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={editingTransaction?.type || ''}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, type: e.target.value })}
                label="Type"
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
              required
            />
            <TextField
              label="Description"
              value={editingTransaction?.description || ''}
              onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Date"
              type="date"
              value={editingTransaction?.date || ''}
              onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditTransaction} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountingDashboard; 