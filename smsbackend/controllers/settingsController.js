const settingsModel = require('../models/settingsModel');

const settingsController = {
  getByUser: async (req, res) => {
    try {
      const settings = await settingsModel.getByUser(req.user.id);
      
      if (!settings) {
        // Return default settings if none found
        return res.json(settingsModel.getDefaultSettings());
      }

      res.json(settings);
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
      const settingsExist = await settingsModel.exists(user_id);

      if (settingsExist) {
        // Update existing settings
        await settingsModel.update({
          user_id,
          theme,
          notifications,
          language,
          timezone,
          updated_by: user_id
        });
      } else {
        // Create new settings
        await settingsModel.create({
          user_id,
          theme,
          notifications,
          language,
          timezone,
          created_by: user_id,
          updated_by: user_id
        });
      }

      // Get updated settings
      const updatedSettings = await settingsModel.getByUser(user_id);
      res.json(updatedSettings);
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = settingsController;
