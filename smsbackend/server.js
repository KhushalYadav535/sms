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
  'https://sms-xi-lilac.vercel.app',
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

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as current_time, version() as db_version');
    res.json({
      status: 'Database connected',
      timestamp: result.rows[0].current_time,
      version: result.rows[0].db_version,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(503).json({
      status: 'Database connection failed',
      error: error.message,
      code: error.code,
      environment: process.env.NODE_ENV
    });
  }
});

// Test database schema endpoint
app.get('/test-schema', async (req, res) => {
  try {
    // Check if members table exists
    const membersTableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'members'
      );
    `);
    
    if (!membersTableCheck.rows[0].exists) {
      return res.json({
        status: 'Members table does not exist',
        tables: []
      });
    }
    
    // Get members table columns
    const membersColumns = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'members' 
      ORDER BY ordinal_position
    `);
    
    // Check if house_number column exists
    const houseNumberCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'members' 
        AND column_name = 'house_number'
      );
    `);
    
    res.json({
      status: 'Schema check completed',
      membersTableExists: membersTableCheck.rows[0].exists,
      houseNumberColumnExists: houseNumberCheck.rows[0].exists,
      membersColumns: membersColumns.rows,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Schema test error:', error);
    res.status(500).json({
      status: 'Schema check failed',
      error: error.message,
      code: error.code,
      environment: process.env.NODE_ENV
    });
  }
});

// Test member creation endpoint
app.post('/test-member', async (req, res) => {
  try {
    console.log('Testing member creation with data:', req.body);
    
    // Check if members table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'members'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      return res.status(500).json({ error: 'Members table does not exist' });
    }
    
    // Check members table structure
    const columnsCheck = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'members' 
      ORDER BY ordinal_position
    `);
    
    console.log('Members table columns:', columnsCheck.rows);
    
    // Try to create a test user first
    const testUserResult = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Test User', 'test@example.com', '$2b$10$test', 'user']
    );
    
    const testUserId = testUserResult.rows[0].id;
    console.log('Test user created with ID:', testUserId);
    
    // Try to create a test member
    const testMemberResult = await db.query(
      'INSERT INTO members (user_id, house_number, phone) VALUES ($1, $2, $3) RETURNING id',
      [testUserId, 'TEST-101', '1234567890']
    );
    
    console.log('Test member created with ID:', testMemberResult.rows[0].id);
    
    // Clean up
    await db.query('DELETE FROM members WHERE user_id = $1', [testUserId]);
    await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
    
    res.json({
      success: true,
      message: 'Member creation test successful',
      tableExists: tableCheck.rows[0].exists,
      columns: columnsCheck.rows
    });
    
  } catch (error) {
    console.error('Test member creation failed:', error);
    res.status(500).json({
      error: 'Test member creation failed',
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position
    });
  }
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
      logger.info('Users table exists, running migration...');
      // Import and run migration SQL
      const fs = require('fs');
      const path = require('path');
      const migrateSQL = fs.readFileSync(path.join(__dirname, 'migrate.sql'), 'utf8');
      return db.query(migrateSQL);
    }
  })
  .then((result) => {
    logger.info('Database setup/migration completed successfully');
    
    // Verify critical tables and columns exist
    return db.query(`
      SELECT 
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'members')) as members_table_exists,
        (SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'house_number')) as house_number_exists,
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'standard_charges')) as standard_charges_exists
    `);
  })
  .then((result) => {
    const verification = result.rows[0];
    logger.info('Database verification results:', verification);
    
    if (!verification.members_table_exists) {
      logger.error('❌ Members table is missing!');
    } else {
      logger.info('✅ Members table exists');
    }
    
    if (!verification.house_number_exists) {
      logger.error('❌ House number column is missing from members table!');
    } else {
      logger.info('✅ House number column exists');
    }
    
    if (!verification.standard_charges_exists) {
      logger.error('❌ Standard charges table is missing!');
    } else {
      logger.info('✅ Standard charges table exists');
    }
    
    return db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
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
    // Don't exit in production, let the application continue
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Continuing without database connection in production');
    } else {
      process.exit(1);
    }
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

// Test endpoints for debugging
app.get('/api/test-invoice-schema', async (req, res) => {
  try {
    console.log('Testing invoice schema...');
    
    // Check if invoices table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      return res.json({ error: 'Invoices table does not exist' });
    }
    
    // Check columns in invoices table
    const columns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'invoices'
      ORDER BY ordinal_position;
    `);
    
    // Check if standard_charges table exists
    const chargesTableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'standard_charges'
      );
    `);
    
    // Check if members table has required columns
    const membersColumns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'members'
      ORDER BY ordinal_position;
    `);
    
    // Test standard charges data
    const chargesData = await db.query('SELECT COUNT(*) as count FROM standard_charges WHERE is_active = true');
    
    // Test members data
    const membersData = await db.query(`
      SELECT COUNT(*) as count 
      FROM members m 
      JOIN users u ON m.user_id = u.id 
      WHERE m.status = 'active' OR m.status IS NULL
    `);
    
    res.json({
      invoicesTable: tableExists.rows[0].exists,
      invoicesColumns: columns.rows,
      chargesTable: chargesTableExists.rows[0].exists,
      membersColumns: membersColumns.rows,
      activeCharges: chargesData.rows[0].count,
      activeMembers: membersData.rows[0].count
    });
  } catch (error) {
    console.error('Error testing invoice schema:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test-invoice-generation', async (req, res) => {
  try {
    console.log('Testing invoice generation...');
    
    // Test with sample data
    const testData = {
      month: 'January',
      year: '2024',
      startNumber: '001',
      includeAll: true,
      selectedMembers: []
    };
    
    // Get members
    const membersResult = await db.query(`
      SELECT m.id, u.name, m.house_number AS flat_number, u.email, m.status
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.status = 'active' OR m.status IS NULL
      LIMIT 1
    `);
    
    if (membersResult.rows.length === 0) {
      return res.json({ error: 'No active members found' });
    }
    
    // Get charges
    const chargesResult = await db.query(`
      SELECT * FROM standard_charges
      WHERE is_active = true
    `);
    
    if (chargesResult.rows.length === 0) {
      return res.json({ error: 'No standard charges found' });
    }
    
    res.json({
      testData,
      membersFound: membersResult.rows.length,
      chargesFound: chargesResult.rows.length,
      sampleMember: membersResult.rows[0],
      sampleCharges: chargesResult.rows
    });
  } catch (error) {
    console.error('Error testing invoice generation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'frontend/dist');
  const indexPath = path.join(frontendPath, 'index.html');
  
  // Only serve static files if frontend directory exists
  if (require('fs').existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    // Handle SPA routing
    app.get('*', (req, res) => {
      if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ 
          message: 'Frontend not found. Please deploy frontend separately.',
          api: 'Backend API is working',
          health: '/health',
          docs: 'API documentation available at /api endpoints'
        });
      }
    });
  } else {
    // If no frontend, provide API information
    app.get('/', (req, res) => {
      res.json({
        message: 'SMS Backend API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        endpoints: {
          health: '/health',
          auth: '/api/auth',
          users: '/api/users',
          members: '/api/members',
          notices: '/api/notices',
          complaints: '/api/complaints',
          invoices: '/api/invoices',
          payments: '/api/payments',
          announcements: '/api/announcements',
          accounting: '/api/accounting',
          reports: '/api/reports',
          security: '/api/security',
          settings: '/api/settings'
        },
        note: 'Frontend not deployed. Deploy frontend separately.'
      });
    });
  }
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
