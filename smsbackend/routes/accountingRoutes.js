const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const ensureAdmin = require('../middleware/ensureAdmin');
const ensureTreasure = require('../middleware/ensureTreasure');
const accountingController = require('../controllers/accountingController');

// Protected routes
router.use(authMiddleware);

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, u.name as member_name 
      FROM accounting a 
      LEFT JOIN members m ON a.member_id = m.id 
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY a.date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get stats
router.get('/stats', accountingController.getStats);

// Get total income
router.get('/total-income', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM accounting WHERE type = "income"');
    res.json({ total: rows[0].total });
  } catch (error) {
    console.error('Error fetching total income:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get total expenses
router.get('/total-expenses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM accounting WHERE type = "expense"');
    res.json({ total: rows[0].total });
  } catch (error) {
    console.error('Error fetching total expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get income transactions
router.get('/income', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, u.name as member_name 
      FROM accounting a 
      LEFT JOIN members m ON a.member_id = m.id 
      LEFT JOIN users u ON m.user_id = u.id
      WHERE a.type = "income" 
      ORDER BY a.date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching income transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get expense transactions
router.get('/expenses', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, u.name as member_name 
      FROM accounting a 
      LEFT JOIN members m ON a.member_id = m.id 
      LEFT JOIN users u ON m.user_id = u.id
      WHERE a.type = "expense" 
      ORDER BY a.date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expense transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Treasure and Admin only routes
router.use(ensureTreasure);

// Add new transaction
router.post('/', async (req, res) => {
  try {
    const { type, amount, description, date, member_id } = req.body;

    // Validate required fields
    if (!type || !amount || !date || !member_id) {
      return res.status(400).json({ 
        message: 'Missing required fields: type, amount, date, and member_id are required' 
      });
    }

    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        message: 'Invalid type: must be either "income" or "expense"' 
      });
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ 
        message: 'Invalid amount: must be a positive number' 
      });
    }

    const [result] = await pool.query(
      'INSERT INTO accounting (type, amount, description, date, member_id) VALUES (?, ?, ?, ?, ?)',
      [type, amountNum, description || null, date, member_id]
    );

    const [newTransaction] = await pool.query(`
      SELECT a.*, u.name as member_name 
      FROM accounting a 
      LEFT JOIN members m ON a.member_id = m.id 
      LEFT JOIN users u ON m.user_id = u.id
      WHERE a.id = ?
    `, [result.insertId]);

    res.status(201).json(newTransaction[0]);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, date, member_id } = req.body;

    // Validate required fields
    if (!type || !amount || !date || !member_id) {
      return res.status(400).json({ 
        message: 'Missing required fields: type, amount, date, and member_id are required' 
      });
    }

    await pool.query(
      'UPDATE accounting SET type = ?, amount = ?, description = ?, date = ?, member_id = ? WHERE id = ?',
      [type, amount, description || null, date, member_id, id]
    );

    const [updatedTransaction] = await pool.query(`
      SELECT a.*, u.name as member_name 
      FROM accounting a 
      LEFT JOIN members m ON a.member_id = m.id 
      LEFT JOIN users u ON m.user_id = u.id
      WHERE a.id = ?
    `, [id]);

    res.json(updatedTransaction[0]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM accounting WHERE id = ?', [id]);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
