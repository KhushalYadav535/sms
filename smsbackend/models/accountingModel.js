const pool = require('../config/db');

const Accounting = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM accounting ORDER BY date DESC');
    return rows;
  },
  async create(data) {
    try {
      console.log('Creating accounting entry with data:', data);
      const { type, amount, date, description, member_id } = data;
      
      // Validate required fields
      if (!type || !amount || !date || !member_id) {
        throw new Error('Missing required fields: type, amount, date, and member_id are required');
      }

      // Validate type
      if (!['income', 'expense'].includes(type)) {
        throw new Error('Invalid type: must be either "income" or "expense"');
      }

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount: must be a positive number');
      }

      const [result] = await pool.query(
        'INSERT INTO accounting (type, amount, date, description, member_id) VALUES (?, ?, ?, ?, ?)',
        [type, amountNum, date, description || null, member_id]
      );
      
      console.log('Created accounting entry:', { id: result.insertId, ...data });
      return { id: result.insertId, ...data };
    } catch (error) {
      console.error('Error in create:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      throw error;
    }
  },
  async remove(id) {
    await pool.query('DELETE FROM accounting WHERE id = ?', [id]);
    return { id };
  },
  async getStats() {
    try {
      console.log('Executing getStats query...');
      const [rows] = await pool.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
          COUNT(*) as total_transactions
        FROM accounting
      `);
      console.log('Query result:', rows[0]);
      return rows[0];
    } catch (error) {
      console.error('Error in getStats:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      throw error;
    }
  }
};

module.exports = Accounting;
