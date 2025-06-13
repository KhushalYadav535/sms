const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [notices] = await db.query(
      `SELECT n.*, u.name as created_by_name 
       FROM announcements n 
       LEFT JOIN users u ON n.created_by = u.id 
       ORDER BY n.created_at DESC`
    );

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

    const [result] = await db.query(
      `INSERT INTO announcements 
       (title, content, type, priority, start_date, end_date, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, content, type, priority, start_date, end_date, created_by]
    );

    const [newNotice] = await db.query(
      `SELECT n.*, u.name as created_by_name 
       FROM announcements n 
       LEFT JOIN users u ON n.created_by = u.id 
       WHERE n.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newNotice[0]);
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notice exists
    const [notices] = await db.query(
      'SELECT id FROM announcements WHERE id = ?',
      [id]
    );

    if (notices.length === 0) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Delete notice
    await db.query('DELETE FROM announcements WHERE id = ?', [id]);

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
