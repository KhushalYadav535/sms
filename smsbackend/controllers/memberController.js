const Member = require('../models/memberModel');

exports.getAll = async (req, res) => {
  const members = await Member.getAll();
  res.json(members);
};

exports.getById = async (req, res) => {
  const member = await Member.getById(req.params.id);
  if (!member) return res.status(404).json({ message: 'Not found' });
  res.json(member);
};

exports.create = async (req, res) => {
  try {
    const { name, email, house_number, phone_number } = req.body;
    
    // Validate required fields
    if (!name || !email || !house_number) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'email', 'house_number']
      });
    }

    const member = await Member.create({ name, email, house_number, phone_number });
    res.status(201).json(member);
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(400).json({ 
      message: error.message || 'Error creating member',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.update = async (req, res) => {
  const member = await Member.update(req.params.id, req.body);
  res.json(member);
};

exports.remove = async (req, res) => {
  await Member.remove(req.params.id);
  res.json({ message: 'Deleted' });
};
