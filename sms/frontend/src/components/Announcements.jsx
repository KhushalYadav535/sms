import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Announcement as AnnouncementIcon
} from '@mui/icons-material';
import axios from '../config/axios';
import { useUser } from '../context/UserContext';
import { useLocation } from 'react-router-dom';

const Announcements = () => {
  const theme = useTheme();
  const { userRole } = useUser();
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
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

  // Define which role can see announcements on which dashboard route
  const routeRoleMap = {
    '/admin-dashboard': 'admin',
    '/treasure-dashboard': 'treasure',
    '/secretary-dashboard': 'secretary',
    '/security-dashboard': 'security',
    '/user-dashboard': 'user',
  };

  // Only show announcements if current route matches dashboard and user has correct role
  const showAnnouncements = Object.entries(routeRoleMap).some(
    ([route, role]) => location.pathname === route && userRole === role
  );

  const canEdit = (userRole === 'admin' && location.pathname === '/admin-dashboard') ||
                  (userRole === 'secretary' && location.pathname === '/secretary-dashboard');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/announcements');
      const announcementsData = Array.isArray(response.data) ? response.data : [];
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    }
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
        await axios.put(`/announcements/${selectedAnnouncement.id}`, formData);
      } else {
        await axios.post('/announcements', formData);
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
        await axios.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

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
      {showAnnouncements && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnnouncementIcon color="primary" />
            Announcements
          </Typography>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              New Announcement
            </Button>
          )}
        </Box>
      )}
      {showAnnouncements && (
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} md={6} lg={4} key={announcement.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {announcement.title}
                    </Typography>
                    {canEdit && (
                      <Box>
                        <IconButton size="small" onClick={() => handleOpenDialog(announcement)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(announcement.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {announcement.content}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    <Chip
                      label={announcement.type}
                      color={announcement.type === 'event' ? 'warning' : 'primary'}
                      size="small"
                    />
                    <Chip
                      label={announcement.priority}
                      color={getPriorityColor(announcement.priority)}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                    <Typography variant="caption">
                      From: {new Date(announcement.startDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption">
                      To: {new Date(announcement.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="notice">Notice</MenuItem>
              <MenuItem value="event">Event</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
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

export default Announcements;