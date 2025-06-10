import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Card, Avatar, Stack, Fade } from '@mui/material';
import { People as PeopleIcon, Person as PersonIcon, Phone as PhoneIcon, SentimentSatisfiedAlt as SmileIcon } from '@mui/icons-material';
import { fetchMembers, addMember, updateMember, deleteMember } from '../api';

const Members = () => {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    house_number: '', 
    phone_number: '' 
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchMembers().then(setMembers);
  }, []);

  const handleOpen = (member) => {
    if (member) {
      setForm({
        name: member.name,
        email: member.email,
        house_number: member.house_number,
        phone_number: member.phone_number
      });
      setEditId(member.id);
    } else {
      setForm({ 
        name: '', 
        email: '', 
        house_number: '', 
        phone_number: '' 
      });
      setEditId(null);
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = async () => {
    if (editId) {
      const updated = await updateMember(editId, form);
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } else {
      const created = await addMember(form);
      setMembers((prev) => [...prev, created]);
    }
    setOpen(false);
  };
  const handleDelete = async (id) => {
    await deleteMember(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <PeopleIcon />
        </Avatar>
        <Typography variant="h5" fontWeight={700}>Member Management</Typography>
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpen()}>Add Member</Button>
      </Box>
      <Fade in timeout={600}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)', mb: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 6px 24px 0 rgba(80,80,200,0.16)' } }}>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>House Number</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <SmileIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No members found. Add your first member!
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        transition: 'background 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          backgroundColor: 'action.selected',
                          boxShadow: '0 2px 12px 0 rgba(80,80,200,0.10)',
                        },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Typography fontWeight={600}>{row.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.house_number}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PhoneIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                          <Typography>{row.phone_number || 'Not provided'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleOpen(row)}>Edit</Button>
                        <Button size="small" color="error" onClick={() => handleDelete(row.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Fade>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editId ? 'Edit Member' : 'Add Member'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 350 }}>
          <TextField 
            label="Name" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            fullWidth 
            variant="outlined" 
            required
          />
          <TextField 
            label="Email" 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            fullWidth 
            variant="outlined" 
            required
            type="email"
          />
          <TextField 
            label="House Number" 
            name="house_number" 
            value={form.house_number} 
            onChange={handleChange} 
            fullWidth 
            variant="outlined" 
            required
          />
          <TextField 
            label="Phone Number" 
            name="phone_number" 
            value={form.phone_number} 
            onChange={handleChange} 
            fullWidth 
            variant="outlined" 
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Members;