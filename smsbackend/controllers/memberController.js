const Member = require('../models/memberModel');
const pool = require('../config/db');

exports.getCurrentMember = async (req, res) => {
  try {
    const [member] = await pool.query(
      'SELECT * FROM members WHERE user_id = ?',
      [req.user.id]
    );

    if (!member || member.length === 0) {
      return res.status(404).json({ 
        message: 'Member profile not found. Please create a member profile first.',
        code: 'NO_MEMBER_PROFILE'
      });
    }

    res.json(member[0]);
  } catch (error) {
    console.error('Error fetching member profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const [members] = await pool.query(`
      SELECT m.*, u.name, u.email 
      FROM members m 
      JOIN users u ON m.user_id = u.id
    `);
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [member] = await pool.query(
      'SELECT m.*, u.name, u.email FROM members m JOIN users u ON m.user_id = u.id WHERE m.id = ?',
      [req.params.id]
    );
    
    if (!member || member.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.json(member[0]);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const bcrypt = require('bcrypt');

exports.create = async (req, res) => {
  try {
    const { house_number, phone_number, email, name, password } = req.body;
    const userRole = req.user && req.user.role;
    let user_id;

    if (userRole === 'admin' || userRole === 'secretary') {
      // Admin/secretary can create member for any email
      let existingUser;
      if (email) {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        existingUser = users.length > 0 ? users[0] : null;
      }
      if (existingUser) {
        user_id = existingUser.id;
      } else {
        // Use provided password or generate one
        const userPassword = password || Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(userPassword, 10);
        const [userResult] = await pool.query(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [name, email, hashedPassword, 'user']
        );
        user_id = userResult.insertId;
        // Optionally: send generated password to admin/secretary
      }
    } else {
      // Normal user: only create for themselves
      user_id = req.user.id;
    }

    // Check if member profile already exists for this user_id
    const [existing] = await pool.query('SELECT * FROM members WHERE user_id = ?', [user_id]);
    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Member profile already exists for this user',
        code: 'PROFILE_EXISTS',
        existingMember: existing[0]
      });
    }

    // Create new member profile
    const [result] = await pool.query(
      'INSERT INTO members (user_id, house_number, phone_number) VALUES (?, ?, ?)',
      [user_id, house_number, phone_number]
    );

    const [newMember] = await pool.query(
      'SELECT m.*, u.name, u.email FROM members m JOIN users u ON m.user_id = u.id WHERE m.id = ?',
      [result.insertId]
    );

    res.status(201).json(newMember[0]);
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { house_number, phone_number } = req.body;

    // Check if member exists
    const [existing] = await pool.query(
      'SELECT * FROM members WHERE id = ?',
      [id]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await pool.query(
      'UPDATE members SET house_number = ?, phone_number = ? WHERE id = ?',
      [house_number, phone_number, id]
    );

    const [updatedMember] = await pool.query(
      'SELECT m.*, u.name, u.email FROM members m JOIN users u ON m.user_id = u.id WHERE m.id = ?',
      [id]
    );

    res.json(updatedMember[0]);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if member exists
    const [existing] = await pool.query(
      'SELECT * FROM members WHERE id = ?',
      [id]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await pool.query('DELETE FROM members WHERE id = ?', [id]);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
