const Settings = require('../models/settingsModel');

exports.getByUser = async (req, res) => {
  const user_id = req.user.id;
  const settings = await Settings.getByUser(user_id);
  res.json(settings);
};

exports.update = async (req, res) => {
  const user_id = req.user.id;
  const { key, value } = req.body;
  const updated = await Settings.update(user_id, key, value);
  res.json(updated);
};
