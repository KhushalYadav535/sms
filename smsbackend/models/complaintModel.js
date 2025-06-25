const pool = require('../config/db');

const Complaint = {
  async getAll() {
    // Join with users for name/email if needed
    const result = await pool.query(`
      SELECT 
        c.*, 
        u.name as user_name, 
        u.email as user_email,
        TO_CHAR(c.created_at, 'YYYY-MM-DD HH24:MI:SS') as formatted_date
      FROM complaints c 
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);
    return result.rows.map(row => ({
      ...row,
      date: row.formatted_date,
      created_at: row.formatted_date
    }));
  },
  async create(data) {
    const { title, content, user_id } = data;
    const result = await pool.query(
      'INSERT INTO complaints (title, content, user_id, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, content, user_id, 'pending']
    );
    return { id: result.rows[0].id, title, content, user_id, status: 'pending' };
  },
  async updateStatus(id, status) {
    await pool.query('UPDATE complaints SET status=$1 WHERE id=$2', [status, id]);
    return { id, status };
  },
  async remove(id) {
    await pool.query('DELETE FROM complaints WHERE id=$1', [id]);
    return { id };
  }
};

module.exports = Complaint;
