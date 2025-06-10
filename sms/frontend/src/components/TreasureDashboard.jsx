import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  Tabs,
  Tab,
  Stack,
  Avatar,
  Fade,
  Tooltip,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Search
} from '@mui/icons-material';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const API_BASE_URL = '/accounting';

const StatCard = ({ title, value, subtitle, subvalue, icon, color, onClick }) => (
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
          <Typography variant="h4" component="div" fontWeight="bold">₹{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}: ₹{subvalue}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const TreasureDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, userRole } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    total_income: 0,
    total_expense: 0,
    total_transactions: 0,
    monthly_income: 0,
    monthly_expense: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState(0);
  const [formError, setFormError] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [statDetails, setStatDetails] = useState({
    income: [],
    expenses: []
  });

  useEffect(() => {
    if (!user || userRole !== 'treasure') {
      setError('Unauthorized access. Treasure privileges required.');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([fetchTransactions(), fetchStats()]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, userRole]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch accounting statistics');
    }
  };

  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      setSelectedTransaction(transaction);
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date
      });
    } else {
      setSelectedTransaction(null);
      setFormData({
        type: 'income',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransaction(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

      if (selectedTransaction) {
        await axios.put(`${API_BASE_URL}/${selectedTransaction.id}`, transactionData);
      } else {
        await axios.post(API_BASE_URL, transactionData);
      }
      
      await fetchTransactions();
      await fetchStats();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving transaction:', error);
      setError('Failed to save transaction. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        await fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        if (error.code === 'ERR_NETWORK') {
          alert('Unable to connect to the server. Please check if the backend server is running.');
        } else {
          alert(error.response?.data?.message || 'Error deleting transaction. Please try again.');
        }
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStatClick = async (stat) => {
    setSelectedStat(stat);
    try {
      let response;
      switch (stat) {
        case 'income':
          response = await axios.get(`${API_BASE_URL}?type=income`);
          setStatDetails(prev => ({ ...prev, income: response.data }));
          break;
        case 'expenses':
          response = await axios.get(`${API_BASE_URL}?type=expense`);
          setStatDetails(prev => ({ ...prev, expenses: response.data }));
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${stat} details:`, error);
      setError(`Failed to load ${stat} details`);
    }
  };

  const renderStatDetails = () => {
    if (!selectedStat) return null;

    const details = statDetails[selectedStat] || [];
    const columns = {
      income: ['Date', 'Description', 'Amount'],
      expenses: ['Date', 'Description', 'Amount']
    };

    return (
      <Dialog 
        open={!!selectedStat} 
        onClose={() => setSelectedStat(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedStat.charAt(0).toUpperCase() + selectedStat.slice(1)} Details
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {columns[selectedStat].map((column) => (
                    <TableCell key={column}>{column}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {details.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>₹{item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedStat(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Treasure Dashboard
      </Typography>

      {/* Financial Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Income"
            value={stats.total_income}
            subtitle="This Month"
            subvalue={stats.monthly_income}
            icon={<TrendingUpIcon />}
            color="success"
            onClick={() => handleStatClick('income')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Expenses"
            value={stats.total_expense}
            subtitle="This Month"
            subvalue={stats.monthly_expense}
            icon={<TrendingUpIcon />}
            color="error"
            onClick={() => handleStatClick('expenses')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Balance"
            value={stats.total_income - stats.total_expense}
            subtitle="Monthly Balance"
            subvalue={stats.monthly_income - stats.monthly_expense}
            icon={<AccountBalanceIcon />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
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

      {/* Transactions Table */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Financial Transactions</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Transaction
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.type}
                      color={transaction.type === 'income' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>₹{transaction.amount}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(transaction)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(transaction.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </DialogTitle>
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
              required
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              sx={{ mb: 2 }}
              inputProps={{ min: 0, step: 0.01 }}
              error={formError}
              helperText={formError ? 'Amount is required' : ''}
            />
            <TextField
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
              error={formError}
              helperText={formError ? 'Description is required' : ''}
            />
            <TextField
              fullWidth
              required
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              error={formError}
              helperText={formError ? 'Date is required' : ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleTransactionSubmit} 
            variant="contained"
            disabled={!formData.amount || !formData.description || !formData.date}
          >
            {selectedTransaction ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stat Details Dialog */}
      {renderStatDetails()}
    </Box>
  );
};

export default TreasureDashboard; 