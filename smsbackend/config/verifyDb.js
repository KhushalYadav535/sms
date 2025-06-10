const pool = require('./db');

async function verifyDatabase() {
  try {
    // Check if accounting table exists
    const [tables] = await pool.query('SHOW TABLES LIKE "accounting"');
    if (tables.length === 0) {
      console.log('Accounting table does not exist. Creating it...');
      await pool.query(`
        CREATE TABLE accounting (
          id INT PRIMARY KEY AUTO_INCREMENT,
          member_id INT,
          type ENUM('income', 'expense') NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES members(id)
        )
      `);
      console.log('Accounting table created successfully');
    } else {
      // Check if member_id column exists and is nullable
      const [columns] = await pool.query('SHOW COLUMNS FROM accounting LIKE "member_id"');
      if (columns.length > 0 && columns[0].Null === 'NO') {
        console.log('Making member_id nullable...');
        await pool.query('ALTER TABLE accounting MODIFY COLUMN member_id INT NULL');
        console.log('member_id is now nullable');
      }
    }

    console.log('Database verification completed');
  } catch (error) {
    console.error('Error verifying database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

verifyDatabase(); 