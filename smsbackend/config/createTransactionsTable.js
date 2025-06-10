const pool = require('./db');

async function createTransactionsTable() {
  try {
    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type ENUM('income', 'expense') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        date DATE NOT NULL,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    console.log('Transactions table created successfully');
  } catch (error) {
    console.error('Error creating transactions table:', error);
  } finally {
    process.exit();
  }
}

createTransactionsTable(); 