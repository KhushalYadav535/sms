import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { updateUser } from '../store/authSlice';
import { ThemeContext } from '../context/ThemeContext';
import { fetchSettings, updateSettings } from '../api';

const Settings = () => {
  const { user, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: darkMode,
    language: 'English',
    notifications: true,
    societyName: 'Green Valley Society',
    address: '123 Main Street, City',
  });

  useEffect(() => {
    setSettings((prev) => ({ ...prev, darkMode }));
  }, [darkMode]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchSettings().then((data) => {
      // Map API data to settings state if needed
      // setSettings(...)
    });
  }, []);

  const handleSettingChange = (setting) => (event) => {
    if (setting === 'darkMode') {
      toggleDarkMode();
    } else {
      setSettings({
        ...settings,
        [setting]: event.target.checked,
      });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // TODO: Show error message
      return;
    }
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // TODO: Handle password update
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleSaveSettings = async () => {
    await updateSettings(settings);
    // Optionally show success message
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Society Settings</Typography>
          <TextField label="Society Name" value={settings.societyName} onChange={e => setSettings({ ...settings, societyName: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Address" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" mb={2}>Preferences</Typography>
          <FormControlLabel
            control={<Switch checked={settings.notifications} onChange={e => setSettings({ ...settings, notifications: e.target.checked })} />}
            label="Enable Notifications"
          />
          <FormControlLabel
            control={<Switch checked={settings.darkMode} onChange={handleSettingChange('darkMode')} />}
            label="Dark Mode"
          />
          <Stack direction="row" spacing={2} mt={3}>
            <Button variant="contained" onClick={handleSaveSettings}>Save Settings</Button>
            <Button variant="outlined">Reset</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
export default Settings;
