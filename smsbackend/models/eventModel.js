const pool = require('../config/db');

const Event = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM events');
    return rows;
  },
  async create(data) {
    const { title, description, date } = data;
    const [result] = await pool.query('INSERT INTO events (title, description, date) VALUES (?, ?, ?)', [title, description, date]);
    return { id: result.insertId, ...data };
  },
  async remove(id) {
    await pool.query('DELETE FROM events WHERE id=?', [id]);
    return { id };
  }
};

module.exports = Event;
