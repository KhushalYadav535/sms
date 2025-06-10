const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'society_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Test the connection and verify table structure
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected successfully');

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
    }
  } catch (error) {
    console.error('Database connection test failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run connection test
testConnection();

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle connection', err);
  process.exit(-1);
});

module.exports = pool;
