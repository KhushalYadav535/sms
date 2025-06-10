const pool = require('../config/db');

const Settings = {
  async getByUser(user_id) {
    const [rows] = await pool.query('SELECT * FROM settings WHERE user_id = ?', [user_id]);
    return rows;
  },
  async update(user_id, key, value) {
    await pool.query('REPLACE INTO settings (user_id, setting_key, setting_value) VALUES (?, ?, ?)', [user_id, key, value]);
    return { user_id, key, value };
  }
};

module.exports = Settings;
