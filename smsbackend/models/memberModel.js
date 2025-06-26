const db = require('../config/db');
const bcrypt = require('bcryptjs');

const Member = {
  async getAll() {
    const result = await pool.query(`
      SELECT m.*, u.name, u.email 
      FROM members m 
      JOIN users u ON m.user_id = u.id
    `);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      'SELECT m.*, u.name, u.email FROM members m JOIN users u ON m.user_id = u.id WHERE m.id = $1',
      [id]
    );
    return result.rows[0];
  },

  async getByUserId(userId) {
    const result = await pool.query(
      'SELECT m.*, u.name, u.email FROM members m JOIN users u ON m.user_id = u.id WHERE m.user_id = $1',
      [userId]
    );
    return result.rows[0];
  },

  async create(data) {
    const { name, email, house_number, phone_number } = data;
    
    // First create user if not exists
    let userId = data.user_id;
    if (!userId) {
      const userResult = await pool.query(
        'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id',
        [name, email, 'user']
      );
      userId = userResult.rows[0].id;
    }

    // Then create member
    const result = await pool.query(
      'INSERT INTO members (user_id, house_number, phone) VALUES ($1, $2, $3) RETURNING id',
      [userId, house_number, phone_number]
    );
    
    return this.getById(result.rows[0].id);
  },

  async update(id, data) {
    const { user_id, house_number, phone_number } = data;
    await pool.query('UPDATE members SET user_id=$1, house_number=$2, phone=$3 WHERE id=$4', [user_id, house_number, phone_number, id]);
    return { id, user_id, house_number, phone_number };
  },

  async remove(id) {
    await pool.query('DELETE FROM members WHERE id = $1', [id]);
    return { id };
  },

  async getMembersWithComplaints() {
    const result = await pool.query(`
      SELECT m.*, u.name, u.email, COUNT(c.id) as complaint_count
      FROM members m 
      JOIN users u ON m.user_id = u.id
      LEFT JOIN complaints c ON m.id = c.member_id
      GROUP BY m.id, u.name, u.email
      ORDER BY complaint_count DESC
    `);
    return result.rows;
  },

  async getMembersWithPayments() {
    const result = await pool.query(`
      SELECT m.*, u.name, u.email, 
             COALESCE(SUM(CASE WHEN a.type = 'income' THEN a.amount ELSE 0 END), 0) as total_payments,
             COUNT(CASE WHEN a.type = 'income' THEN 1 END) as payment_count
      FROM members m 
      JOIN users u ON m.user_id = u.id
      LEFT JOIN accounting a ON m.id = a.member_id
      GROUP BY m.id, u.name, u.email
      ORDER BY total_payments DESC
    `);
    return result.rows;
  }
};

module.exports = Member;
