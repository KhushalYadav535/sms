const Member = require('../models/memberModel');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getCurrentMember = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM members WHERE user_id = $1',
      [req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ 
        message: 'Member profile not found. Please create a member profile first.',
        code: 'NO_MEMBER_PROFILE'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching member profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.name, u.email 
      FROM members m 
      JOIN users u ON m.user_id = u.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT m.*, u.name, u.email FROM members m JOIN users u ON m.user_id = u.id WHERE m.id = $1',
      [req.params.id]
    );
    
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('Creating member with data:', req.body);
    
    // Test database connection first
    try {
      const testResult = await pool.query('SELECT 1 as test');
      console.log('Database connection test successful:', testResult.rows[0]);
    } catch (dbError) {
      console.error('Database connection test failed:', dbError);
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    const { house_number, phone_number, email, name, password } = req.body;
    const userRole = req.user && req.user.role;
    let user_id;

    console.log('User role:', userRole);
    console.log('Extracted data:', { house_number, phone_number, email, name, password: password ? '[HIDDEN]' : 'undefined' });

    if (userRole === 'admin' || userRole === 'secretary') {
      // Admin/secretary can create member for any email
      let existingUser;
      if (email) {
        console.log('Checking for existing user with email:', email);
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        existingUser = userResult.rows[0] || null;
        console.log('Existing user found:', existingUser ? 'Yes' : 'No');
      }
      if (existingUser) {
        user_id = existingUser.id;
        console.log('Using existing user ID:', user_id);
      } else {
        // Use provided password or generate one
        const userPassword = password || Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(userPassword, 10);
        console.log('Creating new user with email:', email);
        const userResult = await pool.query(
          'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
          [name, email, hashedPassword, 'user']
        );
        user_id = userResult.rows[0].id;
        console.log('Created new user with ID:', user_id);
        // Optionally: send generated password to admin/secretary
      }
    } else {
      // Normal user: only create for themselves
      user_id = req.user.id;
      console.log('Using current user ID:', user_id);
    }

    // Check if member profile already exists for this user_id
    console.log('Checking for existing member profile for user ID:', user_id);
    const existingResult = await pool.query('SELECT * FROM members WHERE user_id = $1', [user_id]);
    if (existingResult.rows.length > 0) {
      console.log('Member profile already exists for user ID:', user_id);
      return res.status(400).json({
        message: 'Member profile already exists for this user',
        code: 'PROFILE_EXISTS',
        existingMember: existingResult.rows[0]
      });
    }

    // Validate required fields
    if (!name || !email || !house_number || !phone_number) {
      return res.status(400).json({
        message: 'All fields (name, email, house_number, phone_number) are required.'
      });
    }

    // Check for duplicate email in members table
    const emailExists = await pool.query('SELECT * FROM members WHERE email = $1', [email]);
    if (emailExists.rows.length > 0) {
      return res.status(400).json({
        message: 'A member with this email already exists.',
        code: 'EMAIL_EXISTS',
        existingMember: emailExists.rows[0]
      });
    }

    // Create new member profile (insert all relevant fields)
    console.log('Creating member profile with data:', { user_id, name, email, house_number, phone_number });
    const result = await pool.query(
      'INSERT INTO members (user_id, name, email, house_number, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [user_id, name, email, house_number, phone_number]
    );
    console.log('Member profile created with ID:', result.rows[0].id);

    const newMemberResult = await pool.query(
      'SELECT m.*, u.name, u.email FROM members m JOIN users u ON m.user_id = u.id WHERE m.id = $1',
      [result.rows[0].id]
    );
    console.log('Retrieved new member data:', newMemberResult.rows[0]);

    res.status(201).json(newMemberResult.rows[0]);
  } catch (error) {
    console.error('Error creating member:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      stack: error.stack
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { house_number, phone_number } = req.body;

    // Check if member exists
    const existingResult = await pool.query(
      'SELECT * FROM members WHERE id = $1',
      [id]
    );

    if (!existingResult.rows[0]) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await pool.query(
      'UPDATE members SET house_number = $1, phone = $2 WHERE id = $3',
      [house_number, phone_number, id]
    );

    const updatedMemberResult = await pool.query(
      'SELECT m.*, u.name, u.email FROM members m JOIN users u ON m.user_id = u.id WHERE m.id = $1',
      [id]
    );

    res.json(updatedMemberResult.rows[0]);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if member exists
    const existingResult = await pool.query(
      'SELECT * FROM members WHERE id = $1',
      [id]
    );

    if (!existingResult.rows[0]) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await pool.query('DELETE FROM members WHERE id = $1', [id]);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
