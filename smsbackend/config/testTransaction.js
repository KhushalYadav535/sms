const pool = require('./db');

async function testTransaction() {
  try {
    // Get the first member ID
    const [members] = await pool.query('SELECT id FROM members LIMIT 1');
    if (members.length === 0) {
      throw new Error('No members found in the database');
    }
    const memberId = members[0].id;

    // Add a test transaction
    const [result] = await pool.query(
      'INSERT INTO accounting (member_id, type, amount, date, description) VALUES (?, ?, ?, ?, ?)',
      [memberId, 'income', 100.00, new Date().toISOString().split('T')[0], 'Test transaction']
    );
    console.log('Test transaction added with ID:', result.insertId);

    // Verify the transaction was added
    const [rows] = await pool.query('SELECT * FROM accounting WHERE id = ?', [result.insertId]);
    console.log('Added transaction:', rows[0]);

    // Test the stats query
    const [stats] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COUNT(*) as total_transactions
      FROM accounting
    `);
    console.log('Stats:', stats[0]);

  } catch (error) {
    console.error('Error testing transaction:', error);
  } finally {
    process.exit(0);
  }
}

testTransaction(); 