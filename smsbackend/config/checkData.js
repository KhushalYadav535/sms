const pool = require('./db');

async function checkData() {
  try {
    // Check table structure
    const [columns] = await pool.query('SHOW COLUMNS FROM accounting');
    console.log('Table structure:', columns.map(col => col.Field).join(', '));

    // Check existing data
    const [rows] = await pool.query('SELECT * FROM accounting');
    console.log('Number of records:', rows.length);
    if (rows.length > 0) {
      console.log('Sample record:', rows[0]);
    }

    // Check for any NULL values in type column
    const [nullTypes] = await pool.query('SELECT COUNT(*) as count FROM accounting WHERE type IS NULL');
    console.log('Records with NULL type:', nullTypes[0].count);

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    process.exit(0);
  }
}

checkData(); 