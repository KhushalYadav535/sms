import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { login } from '../api';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const { setUser, setUserRole } = useUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    setLocalError('');

    if (!credentials.email || !credentials.password) {
      setLocalError('Please enter email and password.');
      dispatch(loginFailure('Missing credentials'));
      return;
    }

    try {
      const response = await login(credentials);
      // Save user info to context and localStorage
      setUser(response.user);
      setUserRole(response.user.role);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('userRole', response.user.role);
      localStorage.setItem('token', response.token);
      dispatch(loginSuccess(response));
      if (response.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error) {
      setLocalError(error.message || 'Login failed');
      dispatch(loginFailure(error.message || 'Login failed'));
    }
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
          Society Management System
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
          Sign in to your account
        </Typography>

        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {localError || error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Don't have an account? <a href="/register">Register here</a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;