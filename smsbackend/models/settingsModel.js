const db = require('../config/db');

const settingsModel = {
  getByUser: async (userId) => {
    const result = await db.query(
      `SELECT s.*, u.name as updated_by_name
       FROM settings s
       LEFT JOIN users u ON s.updated_by = u.id
       WHERE s.user_id = $1 OR s.user_id IS NULL
       ORDER BY s.updated_at DESC
       LIMIT 1`,
      [userId]
    );
    return result.rows[0];
  },

  getDefaultSettings: () => {
    return {
      theme: 'light',
      notifications: true,
      language: 'en',
      timezone: 'UTC'
    };
  },

  exists: async (userId) => {
    const result = await db.query('SELECT id FROM settings WHERE user_id = $1', [userId]);
    return result.rows.length > 0;
  },

  create: async (settingsData) => {
    const { user_id, theme, notifications, language, timezone, created_by, updated_by } = settingsData;
    
    const result = await db.query(
      `INSERT INTO settings 
       (user_id, theme, notifications, language, timezone, created_by, updated_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [user_id, theme, notifications, language, timezone, created_by, updated_by]
    );
    
    return result.rows[0].id;
  },

  update: async (settingsData) => {
    const { user_id, theme, notifications, language, timezone, updated_by } = settingsData;
    
    const result = await db.query(
      `UPDATE settings 
       SET theme = $1, notifications = $2, language = $3, timezone = $4, 
           updated_by = $5, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6 RETURNING id`,
      [theme, notifications, language, timezone, updated_by, user_id]
    );
    
    return result.rows[0];
  }
};

module.exports = settingsModel; 