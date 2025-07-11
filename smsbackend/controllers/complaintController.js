const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, u.name as user_name, m.name as member_name
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN members m ON c.member_id = m.id
       ORDER BY c.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const user_id = req.user.id;

    const result = await db.query(
      `INSERT INTO complaints 
       (user_id, title, description, priority, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [user_id, title, description, priority, 'pending']
    );

    const newComplaintResult = await db.query(
      `SELECT c.*, u.name as user_name, m.name as member_name
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN members m ON c.member_id = m.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(newComplaintResult.rows[0]);
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if complaint exists
    const complaintsResult = await db.query(
      'SELECT id FROM complaints WHERE id = $1',
      [id]
    );

    if (complaintsResult.rows.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Update status
    await db.query(
      'UPDATE complaints SET status = $1 WHERE id = $2',
      [status, id]
    );

    const updatedComplaintResult = await db.query(
      `SELECT c.*, u.name as user_name, m.name as member_name
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN members m ON c.member_id = m.id
       WHERE c.id = $1`,
      [id]
    );

    res.json(updatedComplaintResult.rows[0]);
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if complaint exists
    const complaintsResult = await db.query(
      'SELECT id FROM complaints WHERE id = $1',
      [id]
    );

    if (complaintsResult.rows.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Delete complaint
    await db.query('DELETE FROM complaints WHERE id = $1', [id]);

    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
