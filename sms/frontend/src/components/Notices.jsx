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
  Avatar,
  Stack,
  Fade,
  Zoom,
  Tooltip,
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
  Notifications as NotificationsIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  SentimentSatisfiedAlt as SmileIcon,
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { fetchNotices, addNotice, deleteNotice } from '../api';

const gradient = 'linear-gradient(135deg, #e3ecfa 0%, #f9e7f7 100%)';

const Notices = () => {
  const { userRole } = useUser();
  const [notices, setNotices] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchNotices().then(setNotices);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSend = async () => {
    const created = await addNotice(form);
    setNotices((prev) => [...prev, created]);
    setOpen(false);
    setForm({ title: '', content: '' });
  };
  const handleDelete = async (id) => {
    await deleteNotice(id);
    setNotices((prev) => prev.filter((n) => n.id !== id));
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
      case 'Maintenance':
        return <WarningIcon color="warning" />;
      case 'Safety':
        return <InfoIcon color="info" />;
      case 'Meeting':
        return <EventIcon color="success" />;
      default:
        return <AnnouncementIcon color="primary" />;
    }
  };

  const filteredNotices = notices.filter(notice => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notice.read;
    return notice.type.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <NotificationsIcon />
        </Avatar>
        <Typography variant="h5" fontWeight={700}>Notices & Communication</Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Fade in timeout={600}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)',
              background: gradient,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <NotificationsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Total Notices</Typography>
                    <Typography variant="h4">{notices.length}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        <Grid item xs={12} md={4}>
          <Fade in timeout={600} style={{ transitionDelay: '100ms' }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)',
              background: gradient,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>High Priority</Typography>
                    <Typography variant="h4">{notices.filter(n => n.priority === 'High').length}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        <Grid item xs={12} md={4}>
          <Fade in timeout={600} style={{ transitionDelay: '200ms' }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)',
              background: gradient,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <EventIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Upcoming Events</Typography>
                    <Typography variant="h4">{notices.filter(n => n.type === 'Meeting').length}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Notices List */}
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
                  variant={activeTab === 'unread' ? 'contained' : 'outlined'} 
                  onClick={() => setActiveTab('unread')}
                >
                  Unread
                </Button>
                <Button 
                  variant={activeTab === 'meeting' ? 'contained' : 'outlined'} 
                  onClick={() => setActiveTab('meeting')}
                >
                  Meetings
                </Button>
              </Stack>
              {userRole === 'admin' && (
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleOpen}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  New Notice
                </Button>
              )}
            </Box>
            <Divider />
            <List>
              {filteredNotices.length === 0 ? (
                <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <SmileIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No notices found.
                  </Typography>
                  <Button variant="contained" onClick={handleOpen}>Create Notice</Button>
                </Box>
              ) : (
                filteredNotices.map((notice, idx) => (
                  <Fade in timeout={600} style={{ transitionDelay: `${idx * 100}ms` }} key={notice.id}>
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
                        <Avatar sx={{ bgcolor: notice.read ? 'action.disabled' : 'primary.main' }}>
                          {getTypeIcon(notice.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={notice.read ? 400 : 600}>
                              {notice.title}
                            </Typography>
                            <Chip 
                              label={notice.priority} 
                              color={getPriorityColor(notice.priority)} 
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body2">{notice.message}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <TimeIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {notice.date}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {notice.author}
                              </Typography>
                            </Stack>
                          </Stack>
                        }
                      />
                      <ListItemSecondaryAction>
                        {userRole === 'admin' && (
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton edge="end" size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Notice">
                              <IconButton edge="end" size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Notice">
                              <IconButton edge="end" size="small" color="error" onClick={() => handleDelete(notice.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
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
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Notice</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Content"
            name="content"
            value={form.content}
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
              value={form.type}
              onChange={handleChange}
              label="Type"
            >
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Safety">Safety</MenuItem>
              <MenuItem value="Meeting">Meeting</MenuItem>
              <MenuItem value="General">General</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              label="Priority"
            >
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSend} 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Send Notice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notices;