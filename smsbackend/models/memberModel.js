const pool = require('../config/db');
const User = require('./userModel');
const bcrypt = require('bcrypt');

const Member = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT m.*, u.name, u.email, u.role 
      FROM members m 
      JOIN users u ON m.user_id = u.id
      ORDER BY m.id DESC
    `);
    return rows;
  },
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
    return rows[0];
  },
  async create(data) {
    const { name, email, house_number, phone_number } = data;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    let userId;

    if (existingUser) {
      // Check if member profile already exists for this user
      const [existingMember] = await pool.query(
        'SELECT * FROM members WHERE user_id = ?',
        [existingUser.id]
      );

      if (existingMember && existingMember.length > 0) {
        throw new Error('Member profile already exists for this user');
      }

      // Use existing user
      userId = existingUser.id;
    } else {
      // Generate a random password
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      // Create new user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'user'
      });
      userId = user.id;
      
      // Log the generated password for admin reference
      console.log(`Generated password for ${email}: ${randomPassword}`);
    }

    // Create the member with the user's ID
    const [result] = await pool.query(
      'INSERT INTO members (user_id, house_number, phone_number) VALUES (?, ?, ?)',
      [userId, house_number, phone_number]
    );

    // Get the created member with user details
    const [member] = await pool.query(`
      SELECT m.*, u.name, u.email 
      FROM members m 
      JOIN users u ON m.user_id = u.id 
      WHERE m.id = ?
    `, [result.insertId]);

    return member[0];
  },
  async update(id, data) {
    const { user_id, house_number, phone_number } = data;
    await pool.query('UPDATE members SET user_id=?, house_number=?, phone_number=? WHERE id=?', [user_id, house_number, phone_number, id]);
    return { id, user_id, house_number, phone_number };
  },
  async remove(id) {
    await pool.query('DELETE FROM members WHERE id=?', [id]);
    return { id };
  }
};

module.exports = Member;
