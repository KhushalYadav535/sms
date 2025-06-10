const Event = require('../models/eventModel');

exports.getAll = async (req, res) => {
  const data = await Event.getAll();
  res.json(data);
};

exports.create = async (req, res) => {
  const entry = await Event.create(req.body);
  res.status(201).json(entry);
};

exports.remove = async (req, res) => {
  await Event.remove(req.params.id);
  res.json({ message: 'Deleted' });
};
