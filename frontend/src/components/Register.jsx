import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { setUserRole } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prevent admin registration
    if (form.email === 'admin@society.com') {
      setError('Cannot register as admin.');
      return;
    }
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u) => u.email === form.email)) {
      setError('Email already registered.');
      return;
    }
    // Save new user
    users.push({ ...form });
    localStorage.setItem('users', JSON.stringify(users));
    // Set role and redirect
    setUserRole('user');
    // Optionally, set a token or isAuthenticated in Redux here
    localStorage.setItem('token', 'user-token');
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          borderRadius: 12,
          boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Register as User
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
          Create your account
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
          >
            Register
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Already have an account? <a href="/login">Login</a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register; 