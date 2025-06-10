const Notice = require('../models/noticeModel');

exports.getAll = async (req, res) => {
  const data = await Notice.getAll();
  res.json(data);
};

exports.create = async (req, res) => {
  const entry = await Notice.create(req.body);
  res.status(201).json(entry);
};

exports.remove = async (req, res) => {
  await Notice.remove(req.params.id);
  res.json({ message: 'Deleted' });
};
