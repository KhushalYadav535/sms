const pool = require('../config/db');

const Event = {
  async getAll() {
    const result = await pool.query('SELECT * FROM events');
    return result.rows;
  },
  async create(data) {
    const { title, description, date } = data;
    const result = await pool.query('INSERT INTO events (title, description, date) VALUES ($1, $2, $3) RETURNING id', [title, description, date]);
    return { id: result.rows[0].id, ...data };
  },
  async remove(id) {
    await pool.query('DELETE FROM events WHERE id=$1', [id]);
    return { id };
  }
};

module.exports = Event;
