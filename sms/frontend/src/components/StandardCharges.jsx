import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from '../config/axios';

const StandardCharges = () => {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
  });

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/standard-charges');
      setCharges(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch standard charges');
      console.error('Error fetching standard charges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  const handleOpenDialog = (charge = null) => {
    if (charge) {
      setEditingCharge(charge);
      setFormData({
        description: charge.description,
        amount: charge.amount,
      });
    } else {
      setEditingCharge(null);
      setFormData({
        description: '',
        amount: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCharge(null);
    setFormData({
      description: '',
      amount: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingCharge) {
        await axios.put(`/standard-charges/${editingCharge.id}`, formData);
      } else {
        await axios.post('/standard-charges', formData);
      }
      fetchCharges();
      handleCloseDialog();
      setError('');
    } catch (err) {
      setError('Failed to save standard charge');
      console.error('Error saving standard charge:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this charge?')) {
      try {
        await axios.delete(`/standard-charges/${id}`);
        fetchCharges();
        setError('');
      } catch (err) {
        setError('Failed to delete standard charge');
        console.error('Error deleting standard charge:', err);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Standard Charges
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Charge
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {charges.map((charge) => (
              <TableRow key={charge.id}>
                <TableCell>{charge.description}</TableCell>
                <TableCell>₹{charge.amount}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(charge)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(charge.id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingCharge ? 'Edit Standard Charge' : 'Add Standard Charge'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCharge ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StandardCharges; 