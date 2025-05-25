import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Button, TextField, Stack, Divider } from '@mui/material';
import { useUser } from '../context/UserContext';

const Profile = () => {
  const { userRole } = useUser();
  // Mock user info
  const [user, setUser] = useState({
    name: 'Admin User',
    email: 'admin@society.com',
    role: userRole,
    avatar: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [form, setForm] = useState(user);
  const [password, setPassword] = useState({ old: '', new: '', confirm: '' });

  // Placeholder for API integration
  const handleSave = () => {
    setUser(form);
    setEditMode(false);
    // TODO: Call API to update user info
  };
  const handlePasswordChange = () => {
    // TODO: Call API to change password
    setPasswordMode(false);
  };

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack alignItems="center" spacing={2}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 36 }}>
              {user.name[0]}
            </Avatar>
            {!editMode ? (
              <>
                <Typography variant="h6">{user.name}</Typography>
                <Typography color="text.secondary">{user.email}</Typography>
                <Typography color="info.main" fontWeight={600}>
                  {user.role.toUpperCase()}
                </Typography>
                <Button variant="outlined" onClick={() => setEditMode(true)} sx={{ mt: 2 }}>Edit Profile</Button>
                <Button variant="text" onClick={() => setPasswordMode(true)} sx={{ mt: 1 }}>Change Password</Button>
              </>
            ) : (
              <>
                <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth sx={{ mb: 2 }} />
                <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth sx={{ mb: 2 }} />
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={handleSave}>Save</Button>
                  <Button onClick={() => setEditMode(false)}>Cancel</Button>
                </Stack>
              </>
            )}
          </Stack>
          {passwordMode && (
            <Box mt={3}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" mb={2}>Change Password</Typography>
              <TextField label="Old Password" type="password" value={password.old} onChange={e => setPassword({ ...password, old: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="New Password" type="password" value={password.new} onChange={e => setPassword({ ...password, new: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Confirm New Password" type="password" value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={handlePasswordChange}>Change</Button>
                <Button onClick={() => setPasswordMode(false)}>Cancel</Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile; 