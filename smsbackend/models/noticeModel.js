const pool = require('../config/db');

const Notice = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM notices');
    return rows;
  },
  async create(data) {
    const { title, content } = data;
    const [result] = await pool.query('INSERT INTO notices (title, content) VALUES (?, ?)', [title, content]);
    return { id: result.insertId, ...data };
  },
  async remove(id) {
    await pool.query('DELETE FROM notices WHERE id=?', [id]);
    return { id };
  }
};

module.exports = Notice;
