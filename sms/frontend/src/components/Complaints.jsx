import React, { useState, useEffect } from 'react';
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
  Input,
  Avatar,
  Stack,
  Fade,
  Zoom,
  Tooltip,
  Badge,
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
  AccessTime as TimeIcon,
  Person as PersonIcon,
  SentimentSatisfiedAlt as SmileIcon,
  AttachFile as AttachFileIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { fetchComplaints, addComplaint, updateComplaintStatus, deleteComplaint } from '../api';

const gradient = 'linear-gradient(135deg, #e3ecfa 0%, #f9e7f7 100%)';

const Complaints = () => {
  const { user } = useUser();
  const [complaints, setComplaints] = useState([]);
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
    attachment: '',
  });

  useEffect(() => {
    fetchComplaints().then(setComplaints);
  }, []);

  const handleAddComplaint = async () => {
    setIsSubmitting(true);
    try {
      const complaintData = {
        title: newComplaint.title,
        content: newComplaint.description, // use 'content' for backend
        user_id: user.id
      };
      const created = await addComplaint(complaintData);
      setComplaints((prev) => [...prev, created]);
      setIsAddDialogOpen(false);
      setNewComplaint({
        title: '',
        type: '',
        description: '',
        priority: 'Medium',
        date: new Date().toISOString().split('T')[0],
        attachment: '',
      });
    } catch (error) {
      console.error('Error adding complaint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComplaint = async (id) => {
    await deleteComplaint(id);
    setComplaints((prev) => prev.filter((c) => c.id !== id));
  };

  const handleStatusChange = async (id, newStatus) => {
    await updateComplaintStatus(id, newStatus);
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
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

  const handleOpen = () => setIsAddDialogOpen(true);
  const handleClose = () => setIsAddDialogOpen(false);
  const handleChange = (e) => setNewComplaint({ ...newComplaint, [e.target.name]: e.target.value });
  const handleFile = (e) => setNewComplaint({ ...newComplaint, attachment: e.target.files[0]?.name || '' });

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <BugReportIcon />
        </Avatar>
        <Typography variant="h5" fontWeight={700}>
          Complaints & Helpdesk
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Fade in timeout={600}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)',
                background: gradient,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <BugReportIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Total Complaints
                    </Typography>
                    <Typography variant="h4">{complaints.length}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        <Grid item xs={12} md={4}>
          <Fade in timeout={600} style={{ transitionDelay: '100ms' }}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)',
                background: gradient,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <PendingIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Pending
                    </Typography>
                    <Typography variant="h4">
                      {complaints.filter((c) => c.status === 'Pending').length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        <Grid item xs={12} md={4}>
          <Fade in timeout={600} style={{ transitionDelay: '200ms' }}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)',
                background: gradient,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Resolved
                    </Typography>
                    <Typography variant="h4">
                      {complaints.filter((c) => c.status === 'Resolved').length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Complaints List */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant={activeTab === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setActiveTab('all')}
                >
                  All
                </Button>
                <Button
                  variant={activeTab === 'pending' ? 'contained' : 'outlined'}
                  onClick={() => setActiveTab('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={activeTab === 'in progress' ? 'contained' : 'outlined'}
                  onClick={() => setActiveTab('in progress')}
                >
                  In Progress
                </Button>
                <Button
                  variant={activeTab === 'resolved' ? 'contained' : 'outlined'}
                  onClick={() => setActiveTab('resolved')}
                >
                  Resolved
                </Button>
              </Stack>
              {user.role === 'user' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpen}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Raise Complaint
                </Button>
              )}
            </Box>
            <Divider />
            <List>
              {filteredComplaints.length === 0 ? (
                <Box
                  sx={{
                    py: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <SmileIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No complaints found.
                  </Typography>
                  {user.role === 'user' && (
                    <Button variant="contained" onClick={handleOpen}>
                      Raise Complaint
                    </Button>
                  )}
                </Box>
              ) : (
                filteredComplaints.map((complaint, idx) => (
                  <Fade in timeout={600} style={{ transitionDelay: `${idx * 100}ms` }} key={complaint.id}>
                    <ListItem 
                      sx={{ 
                        transition: 'all 0.2s',
                        '&:hover': { 
                          backgroundColor: 'action.hover',
                          transform: 'translateX(8px)'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: getStatusColor(complaint.status) }}>
                          {getTypeIcon(complaint.type || 'General')}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {complaint.title}
                            </Typography>
                            <Chip 
                              label={complaint.status} 
                              color={getStatusColor(complaint.status)} 
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body2">{complaint.description}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <TimeIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(complaint.date).toLocaleDateString()}
                              </Typography>
                            </Stack>
                          </Stack>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Details">
                            <IconButton edge="end" size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {user.role === 'admin' && (
                            <>
                              <Tooltip title="Edit Complaint">
                                <IconButton edge="end" size="small">
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Complaint">
                                <IconButton 
                                  edge="end" 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteComplaint(complaint.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Fade>
                ))
              )}
            </List>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={isAddDialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Raise New Complaint</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            name="title"
            value={newComplaint.title}
            onChange={handleChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Description"
            name="description"
            value={newComplaint.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={newComplaint.type}
              onChange={handleChange}
              label="Type"
            >
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Infrastructure">Infrastructure</MenuItem>
              <MenuItem value="Housekeeping">Housekeeping</MenuItem>
              <MenuItem value="Security">Security</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={newComplaint.priority}
              onChange={handleChange}
              label="Priority"
            >
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFileIcon />}
            sx={{ mt: 1 }}
          >
            Attach File
            <input
              type="file"
              hidden
              onChange={handleFile}
            />
          </Button>
          {newComplaint.attachment && (
            <Typography variant="caption" color="text.secondary">
              Selected file: {newComplaint.attachment}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          {user.role === 'user' && (
            <Button
              onClick={handleAddComplaint}
              variant="contained"
              disabled={isSubmitting}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Submit Complaint'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Complaints;