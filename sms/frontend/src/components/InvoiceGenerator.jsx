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
  Tooltip,
  CircularProgress,
  Chip,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Receipt,
  Payment,
  Email,
  PictureAsPdf
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import axios from '../config/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const InvoiceGenerator = () => {
  const { userRole } = useUser();
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState(new Date());
  const [includeAll, setIncludeAll] = useState(true);
  const [startNumber, setStartNumber] = useState('001');
  const [invoices, setInvoices] = useState([]);
  const [members, setMembers] = useState([]);
  const [standardCharges, setStandardCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = ['2024', '2025', '2026'];

  useEffect(() => {
    fetchMembers();
    fetchStandardCharges();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get('/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Failed to fetch members');
    }
  };

  const fetchStandardCharges = async () => {
    try {
      const response = await axios.get('/invoices/charges/standard');
      setStandardCharges(response.data);
    } catch (error) {
      console.error('Error fetching standard charges:', error);
      setError('Failed to fetch standard charges');
    }
  };

  const generateInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.post('/invoices/generate', {
        month,
        year,
        startNumber,
        includeAll,
        selectedMembers: members.map(m => m.id)
      });

      setInvoices(response.data.invoices);
      setSuccess('Invoices generated successfully');
    } catch (error) {
      console.error('Error generating invoices:', error);
      setError(error.response?.data?.message || 'Failed to generate invoices');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (invoice) => {
    const doc = new jsPDF();
    doc.text('Housing Society Invoice', 20, 20);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 30);
    doc.text(`Date: ${invoice.date}`, 20, 40);
    doc.text(`Member: ${invoice.memberName}`, 20, 50);
    doc.text(`Flat: ${invoice.flat}`, 20, 60);

    const tableData = standardCharges.map(item => [
      item.description,
      `₹${item.amount.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Description', 'Amount']],
      body: tableData,
    });

    const total = standardCharges.reduce((sum, item) => sum + item.amount, 0);
    doc.text(`Total: ₹${total.toLocaleString()}`, 20, doc.lastAutoTable.finalY + 10);
    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const sendEmail = async (invoice) => {
    try {
      // TODO: Implement email sending functionality
      console.log(`Sending email to ${invoice.email} with Invoice ${invoice.invoiceNumber}`);
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send email');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Monthly Invoice Generator
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  label="Month"
                >
                  {months.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  label="Year"
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Invoice Start Number"
                value={startNumber}
                onChange={(e) => setStartNumber(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeAll}
                    onChange={(e) => setIncludeAll(e.target.checked)}
                  />
                }
                label="Include All Members"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={generateInvoices}
                disabled={loading || !month || !year}
                startIcon={loading ? <CircularProgress size={20} /> : <Add />}
              >
                Generate Invoices
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {invoices.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generated Invoices
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice Number</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>Flat</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.invoiceId}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.memberName}</TableCell>
                      <TableCell>{invoice.flat}</TableCell>
                      <TableCell>₹{invoice.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Download PDF">
                            <IconButton onClick={() => generatePDF(invoice)}>
                              <PictureAsPdf />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Email">
                            <IconButton onClick={() => sendEmail(invoice)}>
                              <Email />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default InvoiceGenerator; 