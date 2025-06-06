import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Button, TextField, Stack, Divider, CircularProgress } from '@mui/material';
import { useUser } from '../context/UserContext';
import { fetchUserProfile, updateUserProfile, changeUserPassword } from '../api';

const Profile = () => {
  const { userRole } = useUser();
  const [user, setUser] = useState({ name: '', email: '', role: userRole, avatar: '' });
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [form, setForm] = useState(user);
  const [password, setPassword] = useState({ old: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchUserProfile().then(data => {
      setUser(data);
      setForm(data);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load profile');
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateUserProfile(form);
      setUser(updated);
      setEditMode(false);
      setSuccess('Profile updated');
    } catch {
      setError('Failed to update profile');
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    if (password.new !== password.confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await changeUserPassword({ oldPassword: password.old, newPassword: password.new });
      setPasswordMode(false);
      setPassword({ old: '', new: '', confirm: '' });
      setSuccess('Password changed');
    } catch {
      setError('Failed to change password');
    }
    setLoading(false);
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
                  <Button variant="contained" onClick={handleSave} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Save'}
                  </Button>
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
                <Button variant="contained" onClick={handlePasswordChange} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Change'}
                </Button>
                <Button onClick={() => setPasswordMode(false)}>Cancel</Button>
              </Stack>
            </Box>
          )}
          {error && <Typography color="error" mt={2}>{error}</Typography>}
          {success && <Typography color="success.main" mt={2}>{success}</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;