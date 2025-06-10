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
  Announcement as AnnouncementIcon,
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import axios from '../config/axios';

const SecretaryDashboard = () => {
  const theme = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({
    totalAnnouncements: 0,
    activeAnnouncements: 0,
    upcomingEvents: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'notice',
    priority: 'normal',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/api/announcements');
      const announcementsData = Array.isArray(response.data) ? response.data : [];
      setAnnouncements(announcementsData);
      calculateStats(announcementsData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
      setStats({
        totalAnnouncements: 0,
        activeAnnouncements: 0,
        upcomingEvents: 0
      });
    }
  };

  const calculateStats = (data) => {
    if (!Array.isArray(data)) {
      setStats({
        totalAnnouncements: 0,
        activeAnnouncements: 0,
        upcomingEvents: 0
      });
      return;
    }

    const stats = data.reduce((acc, announcement) => {
      acc.totalAnnouncements++;
      if (new Date(announcement.endDate) >= new Date()) {
        acc.activeAnnouncements++;
      }
      if (announcement.type === 'event') {
        acc.upcomingEvents++;
      }
      return acc;
    }, { totalAnnouncements: 0, activeAnnouncements: 0, upcomingEvents: 0 });
    setStats(stats);
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
      fetchAnnouncements();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`/api/announcements/${id}`);
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Secretary Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Announcements"
            value={stats.totalAnnouncements}
            icon={<AnnouncementIcon sx={{ color: 'primary.main' }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Active Announcements"
            value={stats.activeAnnouncements}
            icon={<NotificationsIcon sx={{ color: 'success.main' }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon={<EventIcon sx={{ color: 'warning.main' }} />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Announcements Table */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Announcements & Notices</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Announcement
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(announcements) && announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>{announcement.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={announcement.type}
                        color={announcement.type === 'event' ? 'warning' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={announcement.priority}
                        color={getPriorityColor(announcement.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(announcement.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(announcement.endDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(announcement)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No announcements found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Announcement Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
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
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="notice">Notice</option>
                  <option value="event">Event</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedAnnouncement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecretaryDashboard; 