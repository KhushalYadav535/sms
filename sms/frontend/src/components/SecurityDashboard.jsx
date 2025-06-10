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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Report as ReportIcon
} from '@mui/icons-material';
import axios from '../config/axios';

const SecurityDashboard = () => {
  const theme = useTheme();
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    resolvedIncidents: 0,
    pendingIncidents: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '',
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await axios.get('/security/incidents');
      const incidentsData = Array.isArray(response.data) ? response.data : [];
      setIncidents(incidentsData);
      calculateStats(incidentsData);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]);
      setStats({
        totalIncidents: 0,
        resolvedIncidents: 0,
        pendingIncidents: 0
      });
    }
  };

  const calculateStats = (data) => {
    if (!Array.isArray(data)) {
      setStats({
        totalIncidents: 0,
        resolvedIncidents: 0,
        pendingIncidents: 0
      });
      return;
    }

    const stats = data.reduce((acc, incident) => {
      acc.totalIncidents++;
      if (incident.status === 'resolved') {
        acc.resolvedIncidents++;
      } else {
        acc.pendingIncidents++;
      }
      return acc;
    }, { totalIncidents: 0, resolvedIncidents: 0, pendingIncidents: 0 });
    setStats(stats);
  };

  const handleOpenDialog = (incident = null) => {
    if (incident) {
      setSelectedIncident(incident);
      setFormData({
        type: incident.type,
        description: incident.description,
        location: incident.location,
        status: incident.status,
        date: incident.date
      });
    } else {
      setSelectedIncident(null);
      setFormData({
        type: '',
        description: '',
        location: '',
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedIncident(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedIncident) {
        await axios.put(`/security/incidents/${selectedIncident.id}`, formData);
      } else {
        await axios.post('/security/incidents', formData);
      }
      fetchIncidents();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving incident:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await axios.delete(`/security/incidents/${id}`);
        fetchIncidents();
      } catch (error) {
        console.error('Error deleting incident:', error);
      }
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Security Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Incidents"
            value={stats.totalIncidents}
            icon={<SecurityIcon sx={{ color: 'primary.main' }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Resolved"
            value={stats.resolvedIncidents}
            icon={<CheckCircleIcon sx={{ color: 'success.main' }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Pending"
            value={stats.pendingIncidents}
            icon={<WarningIcon sx={{ color: 'warning.main' }} />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Incidents Table */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Security Incidents</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Report Incident
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>{new Date(incident.date).toLocaleDateString()}</TableCell>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>{incident.location}</TableCell>
                  <TableCell>{incident.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={incident.status}
                      color={getStatusColor(incident.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(incident)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(incident.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Incident Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedIncident ? 'Edit Incident' : 'Report New Incident'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              fullWidth
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              sx={{ mb: 2 }}
            >
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="urgent">Urgent</option>
            </TextField>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedIncident ? 'Update' : 'Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityDashboard; 