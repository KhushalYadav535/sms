const Complaint = require('../models/complaintModel');

exports.getAll = async (req, res) => {
  const data = await Complaint.getAll();
  res.json(data);
};

exports.create = async (req, res) => {
  const entry = await Complaint.create(req.body);
  res.status(201).json(entry);
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const entry = await Complaint.updateStatus(req.params.id, status);
  res.json(entry);
};

exports.remove = async (req, res) => {
  await Complaint.remove(req.params.id);
  res.json({ message: 'Deleted' });
};
