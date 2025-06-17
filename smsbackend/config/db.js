const mysql = require('mysql2/promise');
require('dotenv').config();

// Log environment check
console.log('Environment Check:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST ? 'Set' : 'Not Set',
  DB_PORT: process.env.DB_PORT ? 'Set' : 'Not Set',
  DB_USER: process.env.DB_USER ? 'Set' : 'Not Set',
  DB_NAME: process.env.DB_NAME ? 'Set' : 'Not Set',
  DB_PASSWORD: process.env.DB_PASSWORD ? 'Set' : 'Not Set'
});

// Log database configuration (without sensitive data)
console.log('Database Configuration:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled'
});

const pool = mysql.createPool({
  uri: `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  }
});

// Test the connection
async function testConnection() {
  let connection;
  try {
    console.log('Attempting database connection...');
    connection = await pool.getConnection();
    console.log('Database connected successfully');

    // Test basic query
    const [result] = await connection.query('SELECT 1 as test');
    console.log('Basic query test:', result);

    // Verify users table structure
    const [columns] = await connection.query('SHOW COLUMNS FROM users');
    console.log('Users table columns:', columns.map(col => col.Field).join(', '));

    // Verify admin user exists
    const [admin] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@society.com']);
    if (admin.length === 0) {
      console.log('Admin user not found, creating...');
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [
          'Admin User',
          'admin@society.com',
          '$2b$10$33OGfn44KVCNPswdBzsYPO4IdS5HdaexwK4SRsI4ZzlJzNnN6ps3G',
          'admin'
        ]
      );
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user exists');
    }
  } catch (error) {
    console.error('Database connection test failed:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
    
    // Don't exit in production, let the application retry
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run the connection test
testConnection();

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle connection:', {
    message: err.message,
    code: err.code,
    errno: err.errno,
    sqlState: err.sqlState,
    sqlMessage: err.sqlMessage,
    stack: err.stack
  });
  
  // Don't exit in production, let the application retry
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

module.exports = pool;
