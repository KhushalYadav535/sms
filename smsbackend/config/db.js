const mysql = require('mysql2/promise');
require('dotenv').config();

// Log environment check
console.log('Environment Check:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST ? 'Set' : 'Not Set',
  DB_PORT: process.env.DB_PORT ? 'Set' : 'Not Set',
  DB_USER: process.env.DB_USER ? 'Set' : 'Not Set',
  DB_NAME: process.env.DB_NAME ? 'Set' : 'Not Set',
  DB_PASSWORD: process.env.DB_PASSWORD ? 'Set' : 'Not Set',
  MYSQL_URL: process.env.MYSQL_URL ? 'Set' : 'Not Set',
  MYSQL_PUBLIC_URL: process.env.MYSQL_PUBLIC_URL ? 'Set' : 'Not Set',
  MYSQLHOST: process.env.MYSQLHOST ? 'Set' : 'Not Set',
  MYSQLPORT: process.env.MYSQLPORT ? 'Set' : 'Not Set',
  MYSQLUSER: process.env.MYSQLUSER ? 'Set' : 'Not Set',
  MYSQLPASSWORD: process.env.MYSQLPASSWORD ? 'Set' : 'Not Set',
  MYSQLDATABASE: process.env.MYSQLDATABASE ? 'Set' : 'Not Set'
});

let pool;

// Try to use MYSQL_PUBLIC_URL first, then MYSQL_URL, then fall back to individual parameters
if (process.env.MYSQL_PUBLIC_URL) {
  console.log('Using MYSQL_PUBLIC_URL for database connection');
  console.log('MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL.replace(/:[^:@]*@/, ':****@')); // Hide password in logs
  
  // Parse the MYSQL_PUBLIC_URL to get connection options
  const url = new URL(process.env.MYSQL_PUBLIC_URL);
  const dbConfig = {
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1), // Remove leading slash
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000, // 60 seconds
    acquireTimeout: 60000, // 60 seconds
    timeout: 60000, // 60 seconds
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    } : undefined
  };

  console.log('Parsed Database Configuration (Public URL):', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    ssl: process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled'
  });

  pool = mysql.createPool(dbConfig);
} else if (process.env.MYSQL_URL) {
  console.log('Using MYSQL_URL for database connection');
  console.log('MYSQL_URL:', process.env.MYSQL_URL.replace(/:[^:@]*@/, ':****@')); // Hide password in logs
  
  // Parse the MYSQL_URL to get connection options
  const url = new URL(process.env.MYSQL_URL);
  const dbConfig = {
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1), // Remove leading slash
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000, // 60 seconds
    acquireTimeout: 60000, // 60 seconds
    timeout: 60000, // 60 seconds
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    } : undefined
  };

  console.log('Parsed Database Configuration:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    ssl: process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled'
  });

  pool = mysql.createPool(dbConfig);
} else {
  // Use Railway's environment variables if available, otherwise fall back to custom ones
  const dbConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT),
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000, // 60 seconds
    acquireTimeout: 60000, // 60 seconds
    timeout: 60000, // 60 seconds
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    } : undefined
  };

  // Log database configuration (without sensitive data)
  console.log('Database Configuration:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    ssl: process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled',
    connectTimeout: dbConfig.connectTimeout
  });

  pool = mysql.createPool(dbConfig);
}

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
