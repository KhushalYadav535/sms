const Accounting = require('../models/accountingModel');
const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const data = await Accounting.getAll();
    res.json(data);
  } catch (error) {
    console.error('Error fetching accounting data:', error);
    res.status(500).json({ message: 'Error fetching accounting data' });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    // Get member_id from the authenticated user
    const userId = req.user.id;
    const [member] = await pool.query('SELECT id FROM members WHERE user_id = ?', [userId]);
    
    if (!member || !member.length) {
      return res.status(400).json({ 
        message: 'You need to create a member profile first. Please provide your house number and phone number.',
        code: 'NO_MEMBER_PROFILE',
        requiredFields: ['house_number', 'phone_number']
      });
    }
    
    const member_id = member[0].id;
    const entry = await Accounting.create({ ...req.body, member_id });
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating accounting entry:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // Provide more specific error messages
    let statusCode = 400;
    let errorMessage = error.message;
    
    if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
      errorMessage = 'Missing required member profile. Please create a member profile first.';
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.remove = async (req, res) => {
  try {
    await Accounting.remove(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting accounting entry:', error);
    res.status(500).json({ message: 'Error deleting accounting entry' });
  }
};

exports.getStats = async (req, res) => {
  try {
    // Get total income
    const [incomeResult] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM accounting 
      WHERE type = 'income'
    `);
    const totalIncome = parseFloat(incomeResult[0].total) || 0;

    // Get total expenses
    const [expenseResult] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM accounting 
      WHERE type = 'expense'
    `);
    const totalExpenses = parseFloat(expenseResult[0].total) || 0;

    // Calculate balance
    const balance = totalIncome - totalExpenses;

    // Get recent transactions
    const [recentTransactions] = await pool.query(`
      SELECT * FROM accounting 
      ORDER BY date DESC, created_at DESC 
      LIMIT 10
    `);

    res.json({
      totalIncome,
      totalExpenses,
      balance,
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching accounting stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
