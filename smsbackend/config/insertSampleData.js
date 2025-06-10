const pool = require('./db');

async function insertSampleData() {
  try {
    // Insert sample income transactions
    const incomeTransactions = [
      ['income', 50000.00, 'Monthly Maintenance Collection', 'maintenance', new Date(), 1],
      ['income', 25000.00, 'Parking Fee Collection', 'parking', new Date(), 1],
      ['income', 15000.00, 'Event Hall Booking', 'facilities', new Date(), 1],
      ['income', 10000.00, 'Gym Membership', 'facilities', new Date(), 1],
      ['income', 5000.00, 'Late Fee Collection', 'fines', new Date(), 1]
    ];

    // Insert sample expense transactions
    const expenseTransactions = [
      ['expense', 20000.00, 'Electricity Bill Payment', 'utilities', new Date(), 1],
      ['expense', 15000.00, 'Water Supply Bill', 'utilities', new Date(), 1],
      ['expense', 10000.00, 'Security Staff Salary', 'salary', new Date(), 1],
      ['expense', 8000.00, 'Garden Maintenance', 'maintenance', new Date(), 1],
      ['expense', 5000.00, 'Cleaning Supplies', 'maintenance', new Date(), 1]
    ];

    // Insert income transactions
    for (const transaction of incomeTransactions) {
      await pool.query(
        'INSERT INTO transactions (type, amount, description, category, date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        transaction
      );
    }

    // Insert expense transactions
    for (const transaction of expenseTransactions) {
      await pool.query(
        'INSERT INTO transactions (type, amount, description, category, date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        transaction
      );
    }

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    process.exit();
  }
}

insertSampleData(); 