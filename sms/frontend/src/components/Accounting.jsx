import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  InputAdornment,
  CircularProgress,
  Avatar,
  Stack,
  Fade,
  Divider,
  Zoom,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MonetizationOn as MoneyIcon,
  Delete as DeleteIcon,
  TrendingFlat as TrendingFlatIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { fetchAccounting, fetchAccountingStats, addAccounting, deleteAccounting } from '../api';
import axios from 'axios';

// Configure axios with base URL and auth token
axios.defaults.baseURL = 'http://localhost:5000';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const statGradients = [
  'linear-gradient(135deg, #6a93f8 0%, #4f7cf7 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
];

const StatCard = ({ title, value, icon, gradient, trend, delay, onClick }) => (
  <Fade in timeout={600} style={{ transitionDelay: `${delay}ms` }}>
    <Card
      elevation={0}
      sx={{
        background: gradient,
        color: '#fff',
        borderRadius: 3,
        p: 0,
        minHeight: 120,
        boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid',
        borderImage: `linear-gradient(135deg, #6a93f8 0%, #f857a6 100%) 1`,
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { 
          boxShadow: '0 6px 24px 0 rgba(80,80,200,0.16)', 
          transform: 'scale(1.03)',
          cursor: onClick ? 'pointer' : 'default'
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', mr: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              {trend > 0 ? (
                <TrendingUpIcon fontSize="small" sx={{ color: '#b6ffb0', mr: 0.5 }} />
              ) : trend < 0 ? (
                <TrendingDownIcon fontSize="small" sx={{ color: '#ffd6d6', mr: 0.5 }} />
              ) : (
                <TrendingFlatIcon fontSize="small" sx={{ color: '#fff', mr: 0.5 }} />
              )}
              <Typography variant="caption" sx={{ color: '#fff', opacity: 0.8 }}>
                {trend === 0 ? 'No change' : `${Math.abs(trend)}% from last month`}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  </Fade>
);

const Accounting = () => {
  const { userRole } = useUser();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState([]); // Always an array
  const [stats, setStats] = useState({
    total_income: 0,
    total_expense: 0,
    total_transactions: 0
  });
  const [newTransaction, setNewTransaction] = useState({
    type: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [formError, setFormError] = useState('');
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [dialogTransactions, setDialogTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
    loadStats();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await axios.get('/api/accounting');
      setTransactions(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      setTransactions([]);
      console.error('Error loading transactions:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/accounting/stats');
      const { totalIncome, totalExpenses, balance, recentTransactions } = response.data;
      
      setStats({
        total_income: Number(totalIncome) || 0,
        total_expense: Number(totalExpenses) || 0,
        total_transactions: Number(recentTransactions?.length || 0)
      });
      
      // Also update transactions list
      const transactionsResponse = await axios.get('/api/accounting');
      setTransactions(Array.isArray(transactionsResponse.data) ? transactionsResponse.data : []);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({ total_income: 0, total_expense: 0, total_transactions: 0 });
      setTransactions([]);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddTransaction = async () => {
    setFormError('');
    
    // Validate all required fields
    if (!newTransaction.type || !newTransaction.amount || !newTransaction.description || !newTransaction.date) {
      setFormError('Please fill in all required fields');
      console.error('Missing required fields:', {
        type: !newTransaction.type,
        amount: !newTransaction.amount,
        description: !newTransaction.description,
        date: !newTransaction.date
      });
      return;
    }

    // Validate amount is a positive number
    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Amount must be a positive number');
      console.error('Invalid amount:', newTransaction.amount);
      return;
    }

    setIsSubmitting(true);
    try {
      // First, get the member_id for the current user
      const memberResponse = await axios.get('/api/members/me');
      if (!memberResponse.data || !memberResponse.data.id) {
        throw new Error('Member profile not found. Please create a member profile first.');
      }

      await axios.post('/api/accounting', {
        ...newTransaction,
        amount: amount, // Ensure amount is a number
        member_id: memberResponse.data.id
      });
      
      // Reset form
      setNewTransaction({
        type: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      
      // Close dialog
      setIsAddTransactionOpen(false);
      
      // Reload data
      await loadStats();
      
    } catch (error) {
      setFormError(error.response?.data?.message || error.message || 'Error adding transaction');
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    setIsSubmitting(true);
    try {
      await deleteAccounting(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      await loadStats(); // Reload stats after deleting transaction
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = (cardType) => {
    setSelectedCard(cardType);
    let filtered = [...transactions];
    
    switch (cardType) {
      case 'balance':
        // Show all transactions
        filtered = transactions;
        break;
      case 'income':
        filtered = transactions.filter(t => t.type === 'income');
        break;
      case 'expense':
        filtered = transactions.filter(t => t.type === 'expense');
        break;
      case 'transactions':
        // Show all transactions
        filtered = transactions;
        break;
      default:
        filtered = transactions;
    }
    
    setDialogTransactions(filtered);
    setIsDetailsDialogOpen(true);
  };

  const getCardTitle = (type) => {
    switch (type) {
      case 'balance':
        return 'Total Balance Details';
      case 'income':
        return 'Income Transactions';
      case 'expense':
        return 'Expense Transactions';
      case 'transactions':
        return 'All Transactions';
      default:
        return 'Transaction Details';
    }
  };

  const getCardIcon = (type) => {
    switch (type) {
      case 'balance':
        return <AccountBalanceIcon />;
      case 'income':
        return <PaymentIcon />;
      case 'expense':
        return <WarningIcon />;
      case 'transactions':
        return <ReceiptIcon />;
      default:
        return <ReceiptIcon />;
    }
  };

  const searchFilteredTransactions = (Array.isArray(transactions) ? transactions : []).filter((transaction) => {
    if (!transaction) return false;
    return Object.entries(transaction).some(([key, value]) => {
      if (value == null) return false;
      try {
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      } catch (e) {
        return false;
      }
    });
  });

  const statCards = [
    {
      title: 'Total Balance',
      value: `₹${((stats?.total_income || 0) - (stats?.total_expense || 0)).toLocaleString()}`,
      icon: <AccountBalanceIcon />,
      gradient: statGradients[0],
      trend: 4,
      type: 'balance'
    },
    {
      title: 'Total Income',
      value: `₹${Number(stats?.total_income || 0).toLocaleString()}`,
      icon: <PaymentIcon />,
      gradient: statGradients[1],
      trend: 2,
      type: 'income'
    },
    {
      title: 'Total Expenses',
      value: `₹${Number(stats?.total_expense || 0).toLocaleString()}`,
      icon: <WarningIcon />,
      gradient: statGradients[2],
      trend: -1,
      type: 'expense'
    },
    {
      title: 'Total Transactions',
      value: String(stats?.total_transactions || 0),
      icon: <ReceiptIcon />,
      gradient: statGradients[3],
      trend: 0,
      type: 'transactions'
    },
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <MoneyIcon />
        </Avatar>
        <Typography variant="h5" fontWeight={700}>Accounting</Typography>
      </Stack>

      <Fade in timeout={600}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <StatCard {...stat} delay={i * 100} onClick={() => handleCardClick(stat.type)} />
            </Grid>
          ))}
        </Grid>
      </Fade>

      {userRole === 'admin' && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddTransactionOpen(true)}
          >
            Add Transaction
          </Button>
        </Box>
      )}

      <Fade in timeout={600}>
        <Paper sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)' }}>
          <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  {userRole === 'admin' && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {searchFilteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={userRole === 'admin' ? 5 : 4} align="center">
                      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No transactions found.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  searchFilteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            color={transaction.type === 'income' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>₹{Number(transaction.amount).toLocaleString()}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        {userRole === 'admin' && (
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={searchFilteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Fade>

      <Dialog
        open={isAddTransactionOpen}
        onClose={() => {
          setIsAddTransactionOpen(false);
          setFormError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl error={!!formError} fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newTransaction.type}
                  label="Type"
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, type: e.target.value })
                  }
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                error={!!formError}
                helperText={formError || ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                error={!!formError}
                helperText={formError || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                error={!!formError}
                helperText={formError || ''}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsAddTransactionOpen(false);
            setFormError('');
          }}>Cancel</Button>
          <Button
            onClick={handleAddTransaction}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Add Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            {selectedCard && getCardIcon(selectedCard)}
            <Typography variant="h6">{selectedCard && getCardTitle(selectedCard)}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
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
                {dialogTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No transactions found.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  dialogTransactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          color={transaction.type === 'income' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        color: transaction.type === 'income' ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}>
                        ₹{Number(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Accounting;