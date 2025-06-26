const db = require('../config/db');
const bcrypt = require('bcryptjs');

const Member = {
  async getAll() {
    const result = await pool.query(`
      SELECT m.*, u.name, u.email, u.role 
      FROM members m 
      JOIN users u ON m.user_id = u.id
      ORDER BY m.id DESC
    `);
    return result.rows;
  },
  async getById(id) {
    const result = await pool.query('SELECT * FROM members WHERE id = $1', [id]);
    return result.rows[0];
  },
  async create(data) {
    const { name, email, house_number, phone_number } = data;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    let userId;

    if (existingUser) {
      // Check if member profile already exists for this user
      const existingMemberResult = await pool.query(
        'SELECT * FROM members WHERE user_id = $1',
        [existingUser.id]
      );

      if (existingMemberResult.rows.length > 0) {
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
    const result = await pool.query(
      'INSERT INTO members (user_id, house_number, phone_number) VALUES ($1, $2, $3) RETURNING id',
      [userId, house_number, phone_number]
    );

    // Get the created member with user details
    const memberResult = await pool.query(`
      SELECT m.*, u.name, u.email 
      FROM members m 
      JOIN users u ON m.user_id = u.id 
      WHERE m.id = $1
    `, [result.rows[0].id]);

    return memberResult.rows[0];
  },
  async update(id, data) {
    const { user_id, house_number, phone_number } = data;
    await pool.query('UPDATE members SET user_id=$1, house_number=$2, phone_number=$3 WHERE id=$4', [user_id, house_number, phone_number, id]);
    return { id, user_id, house_number, phone_number };
  },
  async remove(id) {
    await pool.query('DELETE FROM members WHERE id=$1', [id]);
    return { id };
  }
};

module.exports = Member;
