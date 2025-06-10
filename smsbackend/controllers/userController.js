const User = require('../models/userModel');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.findAll();
    res.json(users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    })));
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate role
    const validRoles = ['user', 'treasure', 'security', 'secretary'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user exists
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hash,
      role
    });

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    // Validate role
    const validRoles = ['user', 'treasure', 'security', 'secretary'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.delete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get dashboard stats based on role
exports.getUserDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let stats = {};
    switch (user.role) {
      case 'treasure':
        // Get financial stats
        stats = {
          totalIncome: 0, // Implement actual calculation
          totalExpenses: 0, // Implement actual calculation
          balance: 0, // Implement actual calculation
          recentTransactions: [] // Implement actual data
        };
        break;
      case 'security':
        // Get security stats
        stats = {
          activeVisitors: 0, // Implement actual count
          securityAlerts: [], // Implement actual data
          recentIncidents: [] // Implement actual data
        };
        break;
      case 'secretary':
        // Get secretary stats
        stats = {
          upcomingMeetings: [], // Implement actual data
          pendingTasks: [], // Implement actual data
          recentDocuments: [] // Implement actual data
        };
        break;
      default:
        stats = {
          notices: [], // Implement actual data
          complaints: [] // Implement actual data
        };
    }

    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Change current user's password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, userId]);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get admin dashboard stats
exports.getAdminDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const [usersResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = usersResult[0].total;

    // Get total members count (users with role 'user')
    const [membersResult] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = "user"');
    const totalMembers = membersResult[0].total;

    // Get total complaints count
    const [complaintsResult] = await pool.query('SELECT COUNT(*) as total FROM complaints');
    const totalComplaints = complaintsResult[0].total;

    // Get total income
    const [incomeResult] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = "income"');
    const totalIncome = incomeResult[0].total;

    // Get total expenses
    const [expensesResult] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = "expense"');
    const totalExpenses = expensesResult[0].total;

    // Get recent users
    const [recentUsers] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    // Get recent complaints
    const [recentComplaints] = await pool.query(
      'SELECT c.*, u.name as user_name FROM complaints c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC LIMIT 5'
    );

    res.json({
      stats: {
        totalUsers,
        totalMembers,
        totalComplaints,
        totalIncome,
        totalExpenses
      },
      recentUsers,
      recentComplaints
    });
  } catch (error) {
    console.error('Error getting admin dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
