const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { type } = req.query;
    let query = `
      SELECT t.*, u.name as created_by_name 
      FROM transactions t 
      LEFT JOIN users u ON t.created_by = u.id
    `;
    const params = [];

    if (type) {
      query += ' WHERE t.type = $1';
      params.push(type);
    }

    query += ' ORDER BY t.date DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;
    const created_by = req.user.id;

    const result = await db.query(
      `INSERT INTO transactions 
       (type, amount, description, category, date, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [type, amount, description, category, date, created_by]
    );

    const newTransactionResult = await db.query(
      `SELECT t.*, u.name as created_by_name 
       FROM transactions t 
       LEFT JOIN users u ON t.created_by = u.id 
       WHERE t.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(newTransactionResult.rows[0]);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, category, date } = req.body;

    // Check if transaction exists
    const transactionsResult = await db.query(
      'SELECT id FROM transactions WHERE id = $1',
      [id]
    );

    if (transactionsResult.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update transaction
    await db.query(
      `UPDATE transactions 
       SET type = $1, amount = $2, description = $3, category = $4, date = $5 
       WHERE id = $6`,
      [type, amount, description, category, date, id]
    );

    const updatedTransactionResult = await db.query(
      `SELECT t.*, u.name as created_by_name 
       FROM transactions t 
       LEFT JOIN users u ON t.created_by = u.id 
       WHERE t.id = $1`,
      [id]
    );

    res.json(updatedTransactionResult.rows[0]);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transaction exists
    const transactionsResult = await db.query(
      'SELECT id FROM transactions WHERE id = $1',
      [id]
    );

    if (transactionsResult.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Delete transaction
    await db.query('DELETE FROM transactions WHERE id = $1', [id]);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 