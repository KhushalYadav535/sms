const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.use(authMiddleware);

// Get current user's member profile
router.get('/me', async (req, res) => {
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
});

// Get all members
router.get('/', async (req, res) => {
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
});

// Create member profile
router.post('/', async (req, res) => {
  try {
    const { house_number, phone_number } = req.body;
    const user_id = req.user.id;

    // Check if member profile already exists
    const [existing] = await pool.query(
      'SELECT * FROM members WHERE user_id = ?',
      [user_id]
    );

    if (existing && existing.length > 0) {
      return res.status(400).json({ 
        message: 'Member profile already exists',
        code: 'PROFILE_EXISTS'
      });
    }

    // Create new member profile
    const [result] = await pool.query(
      'INSERT INTO members (user_id, house_number, phone_number) VALUES (?, ?, ?)',
      [user_id, house_number, phone_number]
    );

    const [newMember] = await pool.query(
      'SELECT * FROM members WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newMember[0]);
  } catch (error) {
    console.error('Error creating member profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update member profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { house_number, phone_number } = req.body;

    await pool.query(
      'UPDATE members SET house_number = ?, phone_number = ? WHERE id = ?',
      [house_number, phone_number, id]
    );

    const [updatedMember] = await pool.query(
      'SELECT * FROM members WHERE id = ?',
      [id]
    );

    res.json(updatedMember[0]);
  } catch (error) {
    console.error('Error updating member profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
