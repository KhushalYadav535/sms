const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');
const ensureAdmin = require('../middleware/ensureAdmin');

// Protected routes
router.use(authMiddleware);

// Get all complaints
router.get('/', (req, res) => {
  pool.query(
    `SELECT c.*, u.name as user_name
     FROM complaints c
     LEFT JOIN users u ON c.user_id = u.id
     ORDER BY c.created_at DESC`
  )
  .then(([rows]) => {
    res.json(rows);
  })
  .catch(error => {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  });
});

// Create new complaint
router.post('/', (req, res) => {
  const { title, description, priority } = req.body;
  const user_id = req.user.id;

  pool.query(
    'INSERT INTO complaints (user_id, title, description, priority, status) VALUES (?, ?, ?, ?, ?)',
    [user_id, title, description, priority, 'Pending']
  )
  .then(([result]) => {
    res.status(201).json({
      id: result.insertId,
      user_id,
      title,
      description,
      priority,
      status: 'Pending'
    });
  })
  .catch(error => {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Error creating complaint' });
  });
});

// Admin only routes
router.use(ensureAdmin);

// Update complaint status
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  pool.query(
    'UPDATE complaints SET status = ? WHERE id = ?',
    [status, id]
  )
  .then(() => {
    res.json({ message: 'Complaint updated successfully' });
  })
  .catch(error => {
    console.error('Error updating complaint:', error);
    res.status(500).json({ message: 'Error updating complaint' });
  });
});

// Delete complaint
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  pool.query('DELETE FROM complaints WHERE id = ?', [id])
  .then(() => {
    res.json({ message: 'Complaint deleted successfully' });
  })
  .catch(error => {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ message: 'Error deleting complaint' });
  });
});

module.exports = router;
