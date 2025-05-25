import React, { useState } from 'react';
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
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  SentimentSatisfiedAlt as SmileIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';

const statGradients = [
  'linear-gradient(135deg, #6a93f8 0%, #4f7cf7 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
];

const StatCard = ({ title, value, icon, gradient, trend, delay }) => (
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
        '&:hover': { boxShadow: '0 6px 24px 0 rgba(80,80,200,0.16)', transform: 'scale(1.03)' },
      }}
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

// Mock data - replace with actual API data
const mockTransactions = [
  {
    id: 1,
    date: '2024-03-15',
    type: 'Maintenance',
    member: 'John Doe',
    amount: 5000,
    status: 'Paid',
    description: 'Monthly maintenance for March 2024',
  },
  {
    id: 2,
    date: '2024-03-14',
    type: 'Water Bill',
    member: 'Jane Smith',
    amount: 1200,
    status: 'Pending',
    description: 'Water bill payment for Block A',
  },
  // Add more mock data as needed
];

const mockDues = [
  {
    id: 1,
    member: 'John Doe',
    type: 'Maintenance',
    amount: 5000,
    dueDate: '2024-03-31',
    status: 'Paid',
  },
  {
    id: 2,
    member: 'Jane Smith',
    type: 'Water Bill',
    amount: 1200,
    dueDate: '2024-03-31',
    status: 'Pending',
  },
  // Add more mock data as needed
];

const mockIncome = [
  { id: 1, type: 'Maintenance', amount: 5000, date: '2024-05-01' },
  { id: 2, type: 'Parking', amount: 1200, date: '2024-05-03' },
];
const mockExpense = [
  { id: 1, type: 'Security', amount: 2000, date: '2024-05-02' },
  { id: 2, type: 'Repairs', amount: 800, date: '2024-05-04' },
];

const Accounting = () => {
  const { userRole } = useUser();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: '',
    member: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [newPayment, setNewPayment] = useState({
    member: '',
    type: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: '', amount: '', date: '' });
  const [income, setIncome] = useState(mockIncome);
  const [expense, setExpense] = useState(mockExpense);
  const [tab, setTab] = useState('income');

  const statCards = [
    {
      title: 'Total Balance',
      value: '₹1,25,000',
      icon: <AccountBalanceIcon />,
      gradient: statGradients[0],
      trend: 4,
    },
    {
      title: 'Monthly Collection',
      value: '₹45,000',
      icon: <PaymentIcon />,
      gradient: statGradients[1],
      trend: 2,
    },
    {
      title: 'Pending Dues',
      value: '₹12,500',
      icon: <WarningIcon />,
      gradient: statGradients[2],
      trend: -1,
    },
    {
      title: 'Total Transactions',
      value: '156',
      icon: <ReceiptIcon />,
      gradient: statGradients[3],
      trend: 0,
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddTransaction = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsAddTransactionOpen(false);
      setNewTransaction({
        type: '',
        member: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPayment = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsAddPaymentOpen(false);
      setNewPayment({
        member: '',
        type: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpen = (type) => {
    setTab(type);
    setForm({ type: '', amount: '', date: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = () => {
    if (tab === 'income') setIncome([...income, { ...form, id: Date.now() }]);
    else setExpense([...expense, { ...form, id: Date.now() }]);
    setOpen(false);
  };

  const filteredTransactions = mockTransactions.filter((transaction) =>
    Object.values(transaction).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
              <StatCard {...stat} delay={i * 100} />
            </Grid>
          ))}
        </Grid>
      </Fade>
      {/* Actions */}
      {userRole === 'admin' && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddTransactionOpen(true)}
          >
            Add Transaction
          </Button>
          <Button
            variant="outlined"
            startIcon={<PaymentIcon />}
            onClick={() => setIsAddPaymentOpen(true)}
          >
            Record Payment
          </Button>
        </Box>
      )}
      {/* Transactions Table */}
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
              variant="outlined"
            />
            <IconButton>
              <FilterIcon />
            </IconButton>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <SmileIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No transactions found.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        hover
                        sx={{
                          transition: 'background 0.3s, box-shadow 0.3s',
                          '&:hover': {
                            backgroundColor: 'action.selected',
                            boxShadow: '0 2px 12px 0 rgba(80,80,200,0.10)',
                          },
                        }}
                      >
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 28, height: 28 }}>
                              <ReceiptIcon fontSize="small" />
                            </Avatar>
                            <Typography>{transaction.type}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{transaction.member}</TableCell>
                        <TableCell>₹{transaction.amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            color={transaction.status === 'Paid' ? 'success' : 'warning'}
                            size="small"
                            icon={transaction.status === 'Paid' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                          />
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Fade>
      {/* Income/Expense Tables */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)', mb: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 6px 24px 0 rgba(80,80,200,0.16)' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>Income</Typography>
              {userRole === 'admin' && <Button variant="contained" onClick={() => handleOpen('income')}>Add Income</Button>}
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {income.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary" py={2}>
                        No income records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  income.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.amount}</TableCell>
                      <TableCell>{row.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)', mb: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 6px 24px 0 rgba(80,80,200,0.16)' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>Expenses</Typography>
              {userRole === 'admin' && <Button variant="contained" onClick={() => handleOpen('expense')}>Add Expense</Button>}
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expense.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary" py={2}>
                        No expense records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  expense.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.amount}</TableCell>
                      <TableCell>{row.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </Grid>
      </Grid>
      {/* Ledger & Invoice Generation (mock) */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight={700}>Ledger & Trial Balance (Mock)</Typography>
        <Card sx={{ p: 2, mt: 1, borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)' }}>
          <Typography variant="body2">Total Income: {income.reduce((a, b) => a + Number(b.amount), 0)}</Typography>
          <Typography variant="body2">Total Expense: {expense.reduce((a, b) => a + Number(b.amount), 0)}</Typography>
          <Typography variant="body2">Trial Balance: {income.reduce((a, b) => a + Number(b.amount), 0) - expense.reduce((a, b) => a + Number(b.amount), 0)}</Typography>
        </Card>
        <Button variant="outlined" sx={{ mt: 2 }}>Generate Invoice (Mock)</Button>
      </Box>
      {/* Dialogs */}
      <Dialog
        open={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={newTransaction.type}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, type: e.target.value })
                  }
                  label="Transaction Type"
                >
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Water Bill">Water Bill</MenuItem>
                  <MenuItem value="Electricity">Electricity</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Member</InputLabel>
                <Select
                  value={newTransaction.member}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, member: e.target.value })
                  }
                  label="Member"
                >
                  <MenuItem value="John Doe">John Doe</MenuItem>
                  <MenuItem value="Jane Smith">Jane Smith</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, amount: e.target.value })
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newTransaction.description}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, description: e.target.value })
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newTransaction.date}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddTransactionOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddTransaction}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Member</InputLabel>
                <Select
                  value={newPayment.member}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, member: e.target.value })
                  }
                  label="Member"
                >
                  <MenuItem value="John Doe">John Doe</MenuItem>
                  <MenuItem value="Jane Smith">Jane Smith</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={newPayment.type}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, type: e.target.value })
                  }
                  label="Payment Type"
                >
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Water Bill">Water Bill</MenuItem>
                  <MenuItem value="Electricity">Electricity</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, amount: e.target.value })
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={newPayment.date}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddPaymentOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddPayment}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{tab === 'income' ? 'Add Income' : 'Add Expense'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Type" name="type" value={form.type} onChange={handleChange} fullWidth variant="outlined" />
          <TextField label="Amount" name="amount" value={form.amount} onChange={handleChange} fullWidth variant="outlined" />
          <TextField label="Date" name="date" value={form.date} onChange={handleChange} fullWidth type="date" InputLabelProps={{ shrink: true }} variant="outlined" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounting; 