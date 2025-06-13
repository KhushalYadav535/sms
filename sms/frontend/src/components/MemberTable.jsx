import React, { useState } from 'react';
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
  TablePagination,
  TextField,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Menu,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  ListItem,
  List,
  Card,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { fetchMembers, addMember, updateMember, deleteMember } from '../api';

const MemberTable = () => {
  const { userRole } = useUser();
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberMenuAnchorEl, setMemberMenuAnchorEl] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: '',
    house_number: '',
    phone_number: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    fetchMembers().then((data) => {
      setMembers(Array.isArray(data) ? data : []);
    });
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleMemberMenuClick = (event, member) => {
    setMemberMenuAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMemberMenuClose = () => {
    setMemberMenuAnchorEl(null);
    setSelectedMember(null);
  };

  const handleViewMember = () => {
    handleMemberMenuClose();
    setIsViewDialogOpen(true);
  };

  const handleEditMember = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    try {
      const updated = await updateMember(selectedMember.id, selectedMember);
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error updating member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    try {
      await deleteMember(selectedMember.id);
      setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error deleting member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewMemberChange = (e) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newMember.name.trim()) errors.name = 'Name is required';
    if (!newMember.email.trim()) errors.email = 'Email is required';
    if (!newMember.password.trim()) errors.password = 'Password is required';
    if (!newMember.house_number.trim()) errors.house_number = 'House number is required';
    if (!newMember.phone_number.trim()) errors.phone_number = 'Phone number is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newMember.email && !emailRegex.test(newMember.email)) {
      errors.email = 'Invalid email format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddMember = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const created = await addMember(newMember);
      setMembers((prev) => [...prev, created]);
      setIsAddDialogOpen(false);
      setNewMember({
        name: '',
        email: '',
        password: '',
        house_number: '',
        phone_number: '',
      });
    } catch (error) {
      console.error('Error adding member:', error);
      if (error.message.includes('Member profile already exists')) {
        setFormErrors({
          email: 'A member profile already exists for this email. Please use a different email address.'
        });
      } else if (error.message.includes('Email already exists')) {
        setFormErrors({
          email: 'This email is already registered. Please use a different email address.'
        });
      } else {
        setFormErrors({
          general: error.message || 'Error adding member. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter((member) =>
    Object.values(member).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Member Management</Typography>
        {userRole === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add Member
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 2 }}>
            <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton onClick={handleFilterClick}>
                <FilterIcon />
              </IconButton>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Flat No.</TableCell>
                    <TableCell>Block</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle1">{member.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {member.flatNo} • {member.block}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {member.phone}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{member.flatNo}</TableCell>
                        <TableCell>{member.block}</TableCell>
                        <TableCell>
                          <Chip
                            label={member.status}
                            color={member.status === 'Active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{member.joinDate}</TableCell>
                        <TableCell align="right">
                          {userRole === 'admin' && (
                            <IconButton
                              onClick={(e) => handleMemberMenuClick(e, member)}
                              size="small"
                              aria-label="actions"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredMembers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            {/* Filter Menu */}
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <MenuItem onClick={handleFilterClose}>All Members</MenuItem>
              <MenuItem onClick={handleFilterClose}>Active Members</MenuItem>
              <MenuItem onClick={handleFilterClose}>Inactive Members</MenuItem>
            </Menu>

            {/* Member Actions Menu */}
            {userRole === 'admin' && (
              <Menu
                anchorEl={memberMenuAnchorEl}
                open={Boolean(memberMenuAnchorEl)}
                onClose={handleMemberMenuClose}
              >
                <MenuItem onClick={handleViewMember}>
                  <ListItem
                    onClick={handleViewMember}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <ViewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="View Details" />
                  </ListItem>
                </MenuItem>
                <MenuItem onClick={handleEditMember}>
                  <ListItem
                    onClick={handleEditMember}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Edit" />
                  </ListItem>
                </MenuItem>
                <MenuItem onClick={handleDeleteMember}>
                  <ListItem
                    onClick={handleDeleteMember}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Delete" />
                  </ListItem>
                </MenuItem>
              </Menu>
            )}

            {/* View Member Dialog */}
            <Dialog
              open={isViewDialogOpen}
              onClose={() => setIsViewDialogOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Member Details</DialogTitle>
              <DialogContent>
                {selectedMember && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">{selectedMember.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Flat No.
                      </Typography>
                      <Typography variant="body1">{selectedMember.flatNo}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Block
                      </Typography>
                      <Typography variant="body1">{selectedMember.block}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Contact
                      </Typography>
                      <Typography variant="body1">{selectedMember.phone}</Typography>
                      <Typography variant="body1">{selectedMember.email}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={selectedMember.status}
                        color={selectedMember.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Join Date
                      </Typography>
                      <Typography variant="body1">{selectedMember.joinDate}</Typography>
                    </Grid>
                  </Grid>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </DialogActions>
            </Dialog>

            {/* Add Member Dialog */}
            <Dialog
              open={isAddDialogOpen}
              onClose={() => setIsAddDialogOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Add New Member</DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={newMember.name}
                      onChange={handleNewMemberChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={newMember.email}
                      onChange={handleNewMemberChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={newMember.password}
                      onChange={handleNewMemberChange}
                      error={!!formErrors.password}
                      helperText={formErrors.password}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="House Number"
                      name="house_number"
                      value={newMember.house_number}
                      onChange={handleNewMemberChange}
                      error={!!formErrors.house_number}
                      helperText={formErrors.house_number}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone_number"
                      value={newMember.phone_number}
                      onChange={handleNewMemberChange}
                      error={!!formErrors.phone_number}
                      helperText={formErrors.phone_number}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleAddMember} 
                  variant="contained" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Add Member'}
                </Button>
              </DialogActions>
            </Dialog>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberTable;