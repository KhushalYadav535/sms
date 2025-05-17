import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Announcement as AnnouncementIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

// Mock data - replace with actual API data
const mockNotices = [
  {
    id: 1,
    title: 'Monthly Maintenance Collection',
    type: 'Announcement',
    content: 'Monthly maintenance collection will be held on 1st April 2024. Please ensure timely payment.',
    date: '2024-03-20',
    priority: 'High',
    status: 'Active',
  },
  {
    id: 2,
    title: 'Society Annual General Meeting',
    type: 'Event',
    content: 'Annual General Meeting of the society will be held on 15th April 2024 at 6:00 PM in the community hall.',
    date: '2024-03-19',
    priority: 'High',
    status: 'Active',
  },
  {
    id: 3,
    title: 'Water Supply Maintenance',
    type: 'Maintenance',
    content: 'Water supply will be temporarily shut down on 25th March 2024 from 10:00 AM to 2:00 PM for maintenance work.',
    date: '2024-03-18',
    priority: 'Medium',
    status: 'Active',
  },
];

const Notices = () => {
  const [notices, setNotices] = useState(mockNotices);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    type: '',
    content: '',
    priority: 'Medium',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddNotice = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newId = Math.max(...notices.map((n) => n.id)) + 1;
      setNotices([
        {
          id: newId,
          ...newNotice,
          status: 'Active',
        },
        ...notices,
      ]);
      setIsAddDialogOpen(false);
      setNewNotice({
        title: '',
        type: '',
        content: '',
        priority: 'Medium',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding notice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setNotices(notices.filter((notice) => notice.id !== id));
    } catch (error) {
      console.error('Error deleting notice:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Announcement':
        return <AnnouncementIcon color="primary" />;
      case 'Event':
        return <EventIcon color="success" />;
      case 'Maintenance':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Notices & Announcements</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Notice
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Active Notices */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Active Notices
            </Typography>
            <List>
              {notices.map((notice) => (
                <React.Fragment key={notice.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>{getTypeIcon(notice.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{notice.title}</Typography>
                          <Chip
                            label={notice.priority}
                            size="small"
                            color={getPriorityColor(notice.priority)}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {notice.type} • {notice.date}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {notice.content}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setSelectedNotice(notice);
                          setIsViewDialogOpen(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton edge="end" sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteNotice(notice.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Notice Statistics */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AnnouncementIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Notices</Typography>
                  </Box>
                  <Typography variant="h4">{notices.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">High Priority</Typography>
                  </Box>
                  <Typography variant="h4">
                    {notices.filter((n) => n.priority === 'High').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Upcoming Events</Typography>
                  </Box>
                  <Typography variant="h4">
                    {notices.filter((n) => n.type === 'Event').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Add Notice Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Notice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newNotice.title}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, title: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newNotice.type}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, type: e.target.value })
                  }
                  label="Type"
                  required
                >
                  <MenuItem value="Announcement">Announcement</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newNotice.priority}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, priority: e.target.value })
                  }
                  label="Priority"
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                multiline
                rows={4}
                value={newNotice.content}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, content: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newNotice.date}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddNotice}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            Add Notice
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Notice Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notice Details</DialogTitle>
        <DialogContent>
          {selectedNotice && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedNotice.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  icon={getTypeIcon(selectedNotice.type)}
                  label={selectedNotice.type}
                  size="small"
                />
                <Chip
                  label={selectedNotice.priority}
                  size="small"
                  color={getPriorityColor(selectedNotice.priority)}
                />
                <Chip
                  label={selectedNotice.date}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Typography variant="body1" paragraph>
                {selectedNotice.content}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notices; 