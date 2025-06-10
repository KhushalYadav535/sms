const pool = require('./db');

async function updateRoles() {
  try {
    console.log('Updating users table role ENUM...');
    
    // First, backup existing users
    const [users] = await pool.query('SELECT * FROM users');
    console.log('Backed up existing users:', users.length);
    
    // Drop the existing table
    await pool.query('DROP TABLE IF EXISTS users');
    console.log('Dropped existing users table');
    
    // Create the table with updated ENUM
    await pool.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user', 'treasure', 'security', 'secretary') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Created new users table with updated role ENUM');
    
    // Restore users
    for (const user of users) {
      await pool.query(
        'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [user.name, user.email, user.password, user.role, user.created_at, user.updated_at]
      );
    }
    console.log('Restored existing users');
    
    console.log('Successfully updated users table role ENUM');
  } catch (error) {
    console.error('Error updating roles:', error);
  } finally {
    process.exit();
  }
}

updateRoles(); 