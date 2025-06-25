require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const winston = require('winston');
const db = require('./config/db');
const errorHandler = require('./middleware/error');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Log startup information
logger.info('Starting application...', {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || 5000
});

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
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const standardChargesRoutes = require('./routes/standardChargesRoutes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL
].filter(Boolean);

logger.info('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Test database connection
db.query('SELECT 1')
  .then(() => {
    logger.info('Database connected successfully');
    
    // Check if users table exists and create if it doesn't
    return db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
  })
  .then((result) => {
    const tableExists = result.rows[0].exists;
    
    if (!tableExists) {
      logger.info('Users table does not exist, creating tables...');
      // Import and run setup SQL
      const fs = require('fs');
      const path = require('path');
      const setupSQL = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');
      return db.query(setupSQL);
    } else {
      logger.info('Users table exists');
      return db.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
    }
  })
  .then((result) => {
    if (result.rows && result.rows.length > 0) {
      logger.info('Users table columns:', result.rows.map(col => col.column_name).join(', '));
    } else {
      logger.info('Tables created successfully');
    }
  })
  .catch(err => {
    logger.error('Database connection error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/standard-charges', standardChargesRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/settings', settingsRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));

  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Global error handlers
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
