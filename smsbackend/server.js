require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const memberRoutes = require('./routes/memberRoutes');
const accountingRoutes = require('./routes/accountingRoutes');
const reportsRoutes = require('./routes/reportRoutes');
const securityRoutes = require('./routes/securityRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Test database connection
db.query('SELECT 1')
  .then(() => {
    console.log('Database connected successfully');
    
    // Verify users table structure
    return db.query('SHOW COLUMNS FROM users');
  })
  .then(([columns]) => {
    console.log('Users table columns:', columns.map(col => col.Field).join(', '));
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/announcements', announcementRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
