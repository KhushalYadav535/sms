import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

// Mock data - replace with actual API data
const monthlyData = [
  { month: 'Jan', income: 45000, expenses: 35000 },
  { month: 'Feb', income: 48000, expenses: 32000 },
  { month: 'Mar', income: 52000, expenses: 38000 },
  { month: 'Apr', income: 46000, expenses: 34000 },
  { month: 'May', income: 49000, expenses: 36000 },
  { month: 'Jun', income: 51000, expenses: 37000 },
];

const categoryData = [
  { name: 'Maintenance', value: 45 },
  { name: 'Water Bill', value: 20 },
  { name: 'Electricity', value: 25 },
  { name: 'Other', value: 10 },
];

const duesData = [
  { month: 'Jan', amount: 15000 },
  { month: 'Feb', amount: 12000 },
  { month: 'Mar', amount: 18000 },
  { month: 'Apr', amount: 14000 },
  { month: 'May', amount: 16000 },
  { month: 'Jun', amount: 13000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Reports = () => {
  const [reportType, setReportType] = useState('monthly');
  const [timeRange, setTimeRange] = useState('6months');

  const handleExport = (format) => {
    // TODO: Implement export functionality
    console.log(`Exporting ${reportType} report in ${format} format`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Financial Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              label="Report Type"
            >
              <MenuItem value="monthly">Monthly Report</MenuItem>
              <MenuItem value="category">Category-wise</MenuItem>
              <MenuItem value="dues">Dues Report</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <Tooltip title="Download Report">
              <IconButton onClick={() => handleExport('pdf')}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print Report">
              <IconButton onClick={() => handleExport('print')}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Monthly Income vs Expenses Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Income vs Expenses
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#4CAF50" />
                  <Bar dataKey="expenses" name="Expenses" fill="#F44336" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Distribution Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Category Distribution
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Dues Trend Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Dues Trend
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={duesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Pending Dues"
                    stroke="#FF9800"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Summary Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Financial Summary
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Total Income</TableCell>
                    <TableCell align="right">Total Expenses</TableCell>
                    <TableCell align="right">Net Balance</TableCell>
                    <TableCell align="right">Pending Dues</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlyData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell align="right">₹{row.income.toLocaleString()}</TableCell>
                      <TableCell align="right">₹{row.expenses.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        ₹{(row.income - row.expenses).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ₹{duesData[index].amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports; 