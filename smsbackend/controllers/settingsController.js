const db = require('../config/db');

const settingsController = {
  getByUser: async (req, res) => {
    try {
      const [settings] = await db.query(
        `SELECT s.*, u.name as updated_by_name
         FROM settings s
         LEFT JOIN users u ON s.updated_by = u.id
         WHERE s.user_id = ? OR s.user_id IS NULL
         ORDER BY s.updated_at DESC
         LIMIT 1`,
        [req.user.id]
      );

      if (settings.length === 0) {
        // Return default settings if none found
        return res.json({
          theme: 'light',
          notifications: true,
          language: 'en',
          timezone: 'UTC'
        });
      }

      res.json(settings[0]);
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { theme, notifications, language, timezone } = req.body;
      const user_id = req.user.id;

      // Check if settings exist for user
      const [existingSettings] = await db.query(
        'SELECT id FROM settings WHERE user_id = ?',
        [user_id]
      );

      if (existingSettings.length > 0) {
        // Update existing settings
        await db.query(
          `UPDATE settings 
           SET theme = ?, notifications = ?, language = ?, timezone = ?, 
               updated_by = ?, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [theme, notifications, language, timezone, user_id, user_id]
        );
      } else {
        // Create new settings
        await db.query(
          `INSERT INTO settings 
           (user_id, theme, notifications, language, timezone, created_by, updated_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [user_id, theme, notifications, language, timezone, user_id, user_id]
        );
      }

      // Get updated settings
      const [updatedSettings] = await db.query(
        `SELECT s.*, u.name as updated_by_name
         FROM settings s
         LEFT JOIN users u ON s.updated_by = u.id
         WHERE s.user_id = ?`,
        [user_id]
      );

      res.json(updatedSettings[0]);
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = settingsController;
