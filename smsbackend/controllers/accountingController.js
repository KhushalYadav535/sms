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
    const total_income = parseFloat(incomeResult[0].total) || 0;

    // Get total expenses
    const [expenseResult] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM accounting 
      WHERE type = 'expense'
    `);
    const total_expense = parseFloat(expenseResult[0].total) || 0;

    // Get monthly income
    const [monthlyIncomeResult] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM accounting 
      WHERE type = 'income'
      AND MONTH(date) = MONTH(CURRENT_DATE())
      AND YEAR(date) = YEAR(CURRENT_DATE())
    `);
    const monthly_income = parseFloat(monthlyIncomeResult[0].total) || 0;

    // Get last month's income
    const [lastMonthIncomeResult] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM accounting 
      WHERE type = 'income'
      AND MONTH(date) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
      AND YEAR(date) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
    `);
    const last_month_income = parseFloat(lastMonthIncomeResult[0].total) || 0;

    // Get monthly expenses
    const [monthlyExpenseResult] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM accounting 
      WHERE type = 'expense'
      AND MONTH(date) = MONTH(CURRENT_DATE())
      AND YEAR(date) = YEAR(CURRENT_DATE())
    `);
    const monthly_expense = parseFloat(monthlyExpenseResult[0].total) || 0;

    // Get last month's expenses
    const [lastMonthExpenseResult] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM accounting 
      WHERE type = 'expense'
      AND MONTH(date) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
      AND YEAR(date) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
    `);
    const last_month_expense = parseFloat(lastMonthExpenseResult[0].total) || 0;

    // Get total transactions count
    const [transactionsResult] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM accounting
    `);
    const total_transactions = parseInt(transactionsResult[0].total) || 0;

    // Calculate trends
    let income_trend = 0;
    if (last_month_income > 0) {
      income_trend = ((monthly_income - last_month_income) / last_month_income) * 100;
    } else if (monthly_income > 0) {
      income_trend = 100; // If last month was 0 and this month has income, it's a 100% increase
    }

    let expense_trend = 0;
    if (last_month_expense > 0) {
      expense_trend = ((monthly_expense - last_month_expense) / last_month_expense) * 100;
    } else if (monthly_expense > 0) {
      expense_trend = 100; // If last month was 0 and this month has expenses, it's a 100% increase
    }

    let balance_trend = 0;
    const current_balance = monthly_income - monthly_expense;
    const last_month_balance = last_month_income - last_month_expense;
    if (last_month_balance !== 0) {
      balance_trend = ((current_balance - last_month_balance) / Math.abs(last_month_balance)) * 100;
    } else if (current_balance !== 0) {
      balance_trend = current_balance > 0 ? 100 : -100;
    }

    // Log the calculated values for debugging
    console.log('Calculated stats:', {
      total_income,
      total_expense,
      monthly_income,
      monthly_expense,
      total_transactions,
      income_trend,
      expense_trend,
      balance_trend,
      last_month_income,
      last_month_expense,
      current_balance,
      last_month_balance
    });

    // Send response with all values
    res.json({
      total_income,
      total_expense,
      monthly_income,
      monthly_expense,
      total_transactions,
      income_trend: Math.round(income_trend),
      expense_trend: Math.round(expense_trend),
      balance_trend: Math.round(balance_trend)
    });
  } catch (error) {
    console.error('Error fetching accounting stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
