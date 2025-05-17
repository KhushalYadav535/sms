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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

// Mock data - replace with actual API data
const mockComplaints = [
  {
    id: 1,
    title: 'Water Leakage in Bathroom',
    type: 'Maintenance',
    description: 'There is a water leakage in the bathroom ceiling. Please check and fix the issue.',
    status: 'Pending',
    priority: 'High',
    reportedBy: 'John Doe',
    flatNo: 'A-101',
    date: '2024-03-20',
    assignedTo: 'Maintenance Team',
    comments: [
      {
        id: 1,
        text: 'Issue reported and assigned to maintenance team',
        date: '2024-03-20',
        by: 'Admin',
      },
    ],
  },
  {
    id: 2,
    title: 'Broken Street Light',
    type: 'Infrastructure',
    description: 'Street light near Block B is not working for the past 2 days.',
    status: 'In Progress',
    priority: 'Medium',
    reportedBy: 'Jane Smith',
    flatNo: 'B-203',
    date: '2024-03-19',
    assignedTo: 'Electrical Team',
    comments: [
      {
        id: 1,
        text: 'Issue reported',
        date: '2024-03-19',
        by: 'Admin',
      },
      {
        id: 2,
        text: 'Electrical team will check tomorrow',
        date: '2024-03-19',
        by: 'Electrical Team',
      },
    ],
  },
  {
    id: 3,
    title: 'Garbage Collection Issue',
    type: 'Housekeeping',
    description: 'Garbage is not being collected regularly in Block C.',
    status: 'Resolved',
    priority: 'Low',
    reportedBy: 'Mike Johnson',
    flatNo: 'C-305',
    date: '2024-03-18',
    assignedTo: 'Housekeeping Team',
    comments: [
      {
        id: 1,
        text: 'Issue reported',
        date: '2024-03-18',
        by: 'Admin',
      },
      {
        id: 2,
        text: 'Schedule updated for regular collection',
        date: '2024-03-18',
        by: 'Housekeeping Team',
      },
      {
        id: 3,
        text: 'Issue resolved',
        date: '2024-03-19',
        by: 'Admin',
      },
    ],
  },
];

const Complaints = () => {
  const [complaints, setComplaints] = useState(mockComplaints);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    type: '',
    description: '',
    priority: 'Medium',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddComplaint = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newId = Math.max(...complaints.map((c) => c.id)) + 1;
      setComplaints([
        {
          id: newId,
          ...newComplaint,
          status: 'Pending',
          reportedBy: 'Current User', // TODO: Get from auth context
          flatNo: 'Current Flat', // TODO: Get from user profile
          assignedTo: 'Pending Assignment',
          comments: [],
        },
        ...complaints,
      ]);
      setIsAddDialogOpen(false);
      setNewComplaint({
        title: '',
        type: '',
        description: '',
        priority: 'Medium',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding complaint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComplaint = async (id) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setComplaints(complaints.filter((complaint) => complaint.id !== id));
    } catch (error) {
      console.error('Error deleting complaint:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setComplaints(
        complaints.map((complaint) =>
          complaint.id === id
            ? {
                ...complaint,
                status: newStatus,
                comments: [
                  ...complaint.comments,
                  {
                    id: complaint.comments.length + 1,
                    text: `Status changed to ${newStatus}`,
                    date: new Date().toISOString().split('T')[0],
                    by: 'Admin',
                  },
                ],
              }
            : complaint
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Pending':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Maintenance':
        return <BuildIcon color="primary" />;
      case 'Infrastructure':
        return <BugReportIcon color="error" />;
      case 'Housekeeping':
        return <InfoIcon color="info" />;
      case 'Security':
        return <SecurityIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    if (activeTab === 'all') return true;
    return complaint.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Complaints & Maintenance</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          New Complaint
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Complaints List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab
                label={`All (${complaints.length})`}
                value="all"
                icon={<InfoIcon />}
                iconPosition="start"
              />
              <Tab
                label={`Pending (${complaints.filter((c) => c.status === 'Pending').length})`}
                value="pending"
                icon={<PendingIcon />}
                iconPosition="start"
              />
              <Tab
                label={`In Progress (${complaints.filter((c) => c.status === 'In Progress').length})`}
                value="in progress"
                icon={<BuildIcon />}
                iconPosition="start"
              />
              <Tab
                label={`Resolved (${complaints.filter((c) => c.status === 'Resolved').length})`}
                value="resolved"
                icon={<CheckCircleIcon />}
                iconPosition="start"
              />
            </Tabs>
            <List>
              {filteredComplaints.map((complaint) => (
                <React.Fragment key={complaint.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>{getTypeIcon(complaint.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{complaint.title}</Typography>
                          <Chip
                            label={complaint.priority}
                            size="small"
                            color={getPriorityColor(complaint.priority)}
                          />
                          <Chip
                            label={complaint.status}
                            size="small"
                            color={getStatusColor(complaint.status)}
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
                            {complaint.type} • {complaint.flatNo} • {complaint.date}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {complaint.description}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setSelectedComplaint(complaint);
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
                        onClick={() => handleDeleteComplaint(complaint.id)}
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

        {/* Statistics */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BugReportIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Complaints</Typography>
                  </Box>
                  <Typography variant="h4">{complaints.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PendingIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6">Pending</Typography>
                  </Box>
                  <Typography variant="h4">
                    {complaints.filter((c) => c.status === 'Pending').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Resolved</Typography>
                  </Box>
                  <Typography variant="h4">
                    {complaints.filter((c) => c.status === 'Resolved').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Add Complaint Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Complaint</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newComplaint.title}
                onChange={(e) =>
                  setNewComplaint({ ...newComplaint, title: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newComplaint.type}
                  onChange={(e) =>
                    setNewComplaint({ ...newComplaint, type: e.target.value })
                  }
                  label="Type"
                  required
                >
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                  <MenuItem value="Housekeeping">Housekeeping</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newComplaint.priority}
                  onChange={(e) =>
                    setNewComplaint({ ...newComplaint, priority: e.target.value })
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
                label="Description"
                multiline
                rows={4}
                value={newComplaint.description}
                onChange={(e) =>
                  setNewComplaint({ ...newComplaint, description: e.target.value })
                }
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddComplaint}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            Submit Complaint
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Complaint Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complaint Details</DialogTitle>
        <DialogContent>
          {selectedComplaint && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedComplaint.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  icon={getTypeIcon(selectedComplaint.type)}
                  label={selectedComplaint.type}
                  size="small"
                />
                <Chip
                  label={selectedComplaint.priority}
                  size="small"
                  color={getPriorityColor(selectedComplaint.priority)}
                />
                <Chip
                  label={selectedComplaint.status}
                  size="small"
                  color={getStatusColor(selectedComplaint.status)}
                />
              </Box>
              <Typography variant="body1" paragraph>
                {selectedComplaint.description}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Reported by: {selectedComplaint.reportedBy}
                </Typography>
                <Typography variant="body2">
                  Flat No: {selectedComplaint.flatNo}
                </Typography>
                <Typography variant="body2">
                  Date: {selectedComplaint.date}
                </Typography>
                <Typography variant="body2">
                  Assigned to: {selectedComplaint.assignedTo}
                </Typography>
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                Comments
              </Typography>
              <List>
                {selectedComplaint.comments.map((comment) => (
                  <ListItem key={comment.id}>
                    <ListItemText
                      primary={comment.text}
                      secondary={`${comment.by} • ${comment.date}`}
                    />
                  </ListItem>
                ))}
              </List>
              {selectedComplaint.status !== 'Resolved' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Update Status
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => handleStatusChange(selectedComplaint.id, 'In Progress')}
                      disabled={selectedComplaint.status === 'In Progress'}
                    >
                      Mark In Progress
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => handleStatusChange(selectedComplaint.id, 'Resolved')}
                      disabled={selectedComplaint.status === 'Resolved'}
                    >
                      Mark Resolved
                    </Button>
                  </Box>
                </Box>
              )}
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

export default Complaints; 