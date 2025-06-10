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
  Avatar,
  AvatarGroup,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Notifications as NotificationsIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { format, isSameDay, parseISO } from 'date-fns';
import { fetchEvents, addEvent, deleteEvent } from '../api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    location: '',
    maxParticipants: 50,
    agenda: [],
    reminder: false,
    reminderTime: '1', // hours before event
  });

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  const handleAddEvent = async () => {
    setIsSubmitting(true);
    try {
      const created = await addEvent(newEvent);
      setEvents((prev) => [...prev, created]);
      setIsAddDialogOpen(false);
      setNewEvent({
        title: '',
        type: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        location: '',
        maxParticipants: 50,
        agenda: [],
        reminder: false,
        reminderTime: '1',
      });
    } catch (error) {
      console.error('Error adding event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleRSVP = async (eventId, userId) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setEvents(
        events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                participants: [
                  ...event.participants,
                  { id: userId, name: 'Current User', flatNo: 'Current Flat' },
                ],
              }
            : event
        )
      );
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Meeting':
        return 'primary';
      case 'Festival':
        return 'success';
      case 'Administrative':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Meeting':
        return <EventIcon color="primary" />;
      case 'Festival':
        return <PeopleIcon color="success" />;
      case 'Administrative':
        return <CalendarIcon color="warning" />;
      default:
        return <EventIcon color="info" />;
    }
  };

  const filteredEvents = events.filter((event) => {
    if (activeTab === 'all') return true;
    return event.type.toLowerCase() === activeTab.toLowerCase();
  });

  const handleEditEvent = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEvents(
        events.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                ...newEvent,
              }
            : event
        )
      );
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error editing event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      type: event.type,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      maxParticipants: event.maxParticipants,
      agenda: event.agenda,
      reminder: event.reminder || false,
      reminderTime: event.reminderTime || '1',
    });
    setIsEditDialogOpen(true);
  };

  const getEventsForDate = (date) => {
    return events.filter((event) => isSameDay(parseISO(event.date), date));
  };

  const renderCalendarView = () => (
    <Paper sx={{ p: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          renderInput={(params) => <TextField {...params} />}
          renderDay={(day, _value, DayComponentProps) => {
            const eventsForDay = getEventsForDate(day);
            return (
              <Badge
                key={day.toString()}
                overlap="circular"
                badgeContent={eventsForDay.length}
                color="primary"
              >
                <DayComponentProps.Day />
              </Badge>
            );
          }}
        />
      </LocalizationProvider>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Events on {format(selectedDate, 'MMMM d, yyyy')}
        </Typography>
        <List>
          {getEventsForDate(selectedDate).map((event) => (
            <ListItem
              key={event.id}
              sx={{
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>{getTypeIcon(event.type)}</ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">{event.title}</Typography>
                    <Chip
                      label={event.type}
                      size="small"
                      color={getTypeColor(event.type)}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">
                      <TimeIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {event.time} •{' '}
                      <LocationIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {event.location}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsViewDialogOpen(true);
                  }}
                  sx={{ mr: 1 }}
                >
                  <ViewIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleEditClick(event)} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteEvent(event.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Events & Meetings</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={viewMode === 'list' ? <ViewModuleIcon /> : <ViewListIcon />}
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            {viewMode === 'list' ? 'Calendar View' : 'List View'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
          >
            New Event
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Events List/Calendar */}
        <Grid item xs={12} md={8}>
          {viewMode === 'list' ? (
            <Paper sx={{ p: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab
                  label={`All (${events.length})`}
                  value="all"
                  icon={<EventIcon />}
                  iconPosition="start"
                />
                <Tab
                  label={`Meetings (${events.filter((e) => e.type === 'Meeting').length})`}
                  value="meeting"
                  icon={<EventIcon />}
                  iconPosition="start"
                />
                <Tab
                  label={`Festivals (${events.filter((e) => e.type === 'Festival').length})`}
                  value="festival"
                  icon={<PeopleIcon />}
                  iconPosition="start"
                />
                <Tab
                  label={`Administrative (${events.filter((e) => e.type === 'Administrative').length})`}
                  value="administrative"
                  icon={<CalendarIcon />}
                  iconPosition="start"
                />
              </Tabs>
              <List>
                {filteredEvents.map((event) => (
                  <React.Fragment key={event.id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon>{getTypeIcon(event.type)}</ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{event.title}</Typography>
                            <Chip
                              label={event.type}
                              size="small"
                              color={getTypeColor(event.type)}
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
                              <TimeIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                              {event.date} at {event.time} •{' '}
                              <LocationIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                              {event.location}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {event.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <PeopleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2">
                                {event.participants.length} / {event.maxParticipants} participants
                              </Typography>
                            </Box>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            setSelectedEvent(event);
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
                          onClick={() => handleDeleteEvent(event.id)}
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
          ) : (
            renderCalendarView()
          )}
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Events</Typography>
                  </Box>
                  <Typography variant="h4">{events.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Upcoming Festivals</Typography>
                  </Box>
                  <Typography variant="h4">
                    {events.filter((e) => e.type === 'Festival').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">Meetings This Month</Typography>
                  </Box>
                  <Typography variant="h4">
                    {events.filter((e) => e.type === 'Meeting').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Add Event Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, type: e.target.value })
                  }
                  label="Type"
                  required
                >
                  <MenuItem value="Meeting">Meeting</MenuItem>
                  <MenuItem value="Festival">Festival</MenuItem>
                  <MenuItem value="Administrative">Administrative</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={newEvent.time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Maximum Participants"
                type="number"
                value={newEvent.maxParticipants}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, maxParticipants: parseInt(e.target.value) })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newEvent.reminder}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, reminder: e.target.checked })
                    }
                  />
                }
                label="Enable Reminder"
              />
            </Grid>
            {newEvent.reminder && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Reminder Time</InputLabel>
                  <Select
                    value={newEvent.reminderTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, reminderTime: e.target.value })
                    }
                    label="Reminder Time"
                  >
                    <MenuItem value="0.5">30 minutes before</MenuItem>
                    <MenuItem value="1">1 hour before</MenuItem>
                    <MenuItem value="2">2 hours before</MenuItem>
                    <MenuItem value="24">1 day before</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddEvent}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, type: e.target.value })
                  }
                  label="Type"
                  required
                >
                  <MenuItem value="Meeting">Meeting</MenuItem>
                  <MenuItem value="Festival">Festival</MenuItem>
                  <MenuItem value="Administrative">Administrative</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={newEvent.time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Maximum Participants"
                type="number"
                value={newEvent.maxParticipants}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, maxParticipants: parseInt(e.target.value) })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newEvent.reminder}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, reminder: e.target.checked })
                    }
                  />
                }
                label="Enable Reminder"
              />
            </Grid>
            {newEvent.reminder && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Reminder Time</InputLabel>
                  <Select
                    value={newEvent.reminderTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, reminderTime: e.target.value })
                    }
                    label="Reminder Time"
                  >
                    <MenuItem value="0.5">30 minutes before</MenuItem>
                    <MenuItem value="1">1 hour before</MenuItem>
                    <MenuItem value="2">2 hours before</MenuItem>
                    <MenuItem value="24">1 day before</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditEvent}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  icon={getTypeIcon(selectedEvent.type)}
                  label={selectedEvent.type}
                  size="small"
                  color={getTypeColor(selectedEvent.type)}
                />
              </Box>
              <Typography variant="body1" paragraph>
                {selectedEvent.description}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Event Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <TimeIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  Date: {selectedEvent.date} at {selectedEvent.time}
                </Typography>
                <Typography variant="body2">
                  <LocationIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  Location: {selectedEvent.location}
                </Typography>
                <Typography variant="body2">
                  <PeopleIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  Organizer: {selectedEvent.organizer}
                </Typography>
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                Agenda
              </Typography>
              <List dense>
                {selectedEvent.agenda.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
              <Typography variant="subtitle2" gutterBottom>
                Participants ({selectedEvent.participants.length} / {selectedEvent.maxParticipants})
              </Typography>
              <Box sx={{ mb: 2 }}>
                <AvatarGroup max={4}>
                  {selectedEvent.participants.map((participant) => (
                    <Avatar key={participant.id}>
                      {participant.name.charAt(0)}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Box>
              {selectedEvent.participants.length < selectedEvent.maxParticipants && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleRSVP(selectedEvent.id, 1)} // TODO: Get actual user ID
                >
                  RSVP Now
                </Button>
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

export default Events;