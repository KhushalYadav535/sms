const noticeModel = require('../models/noticeModel');

exports.getAll = async (req, res) => {
  try {
    const notices = await noticeModel.getAll();
    res.json(notices);
  } catch (error) {
    console.error('Get all notices error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, content, type, priority, start_date, end_date } = req.body;
    const created_by = req.user.id;

    const noticeData = {
      title,
      content,
      type,
      priority,
      start_date,
      end_date,
      created_by
    };

    const noticeId = await noticeModel.create(noticeData);
    const newNotice = await noticeModel.getById(noticeId);

    res.status(201).json(newNotice);
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notice exists
    const noticeExists = await noticeModel.exists(id);
    if (!noticeExists) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Delete notice
    await noticeModel.delete(id);

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
