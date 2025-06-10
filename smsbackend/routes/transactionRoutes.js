const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const ensureAdmin = require('../middleware/ensureAdmin');

// Protected routes
router.use(authMiddleware);

// Get transactions by type (income/expense)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM transactions';
    const params = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY date DESC';

    const [transactions] = await pool.query(query, params);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin only routes
router.use(ensureAdmin);

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO transactions (type, amount, description, category, date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [type, amount, description, category, date, req.user.id]
    );
    res.status(201).json({ id: result.insertId, message: 'Transaction created successfully' });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, category, date } = req.body;
    await pool.query(
      'UPDATE transactions SET type = ?, amount = ?, description = ?, category = ?, date = ? WHERE id = ?',
      [type, amount, description, category, date, id]
    );
    res.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 