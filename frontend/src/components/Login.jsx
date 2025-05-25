import React, { useState } from 'react';
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

const ADMIN_EMAIL = 'admin@society.com';
const ADMIN_PASSWORD = 'admin123';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const { setUserRole } = useUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState('');

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

    // Admin login
    if (
      credentials.email === ADMIN_EMAIL &&
      credentials.password === ADMIN_PASSWORD
    ) {
      const response = {
        user: {
          id: 1,
          name: 'Admin User',
          email: ADMIN_EMAIL,
          role: 'admin',
        },
        token: 'dummy-token-123',
      };
      dispatch(loginSuccess(response));
      setUserRole('admin');
      navigate('/dashboard');
      return;
    }

    // User login (any other email/password)
    if (!credentials.email || !credentials.password) {
      setLocalError('Please enter email and password.');
      dispatch(loginFailure('Missing credentials'));
      return;
    }
    // Simulate user login
    try {
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            user: {
              id: 2,
              name: 'Normal User',
              email: credentials.email,
              role: 'user',
            },
            token: 'dummy-token-456',
          });
        }, 1000);
      });
      dispatch(loginSuccess(response));
      setUserRole('user');
      navigate('/dashboard');
    } catch (error) {
      setLocalError('Login failed.');
      dispatch(loginFailure(error.message));
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
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Society Management System
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
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
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            <b>Admin Login:</b> admin@society.com / admin123
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 