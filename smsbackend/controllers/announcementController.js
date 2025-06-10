const pool = require('../config/db');

const announcementController = {
  // Get all announcements
  getAllAnnouncements: async (req, res) => {
    try {
      const [announcements] = await pool.query(`
        SELECT * FROM announcements 
        ORDER BY created_at DESC
      `);
      res.json(announcements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(500).json({ message: 'Error fetching announcements' });
    }
  },

  // Create new announcement
  createAnnouncement: async (req, res) => {
    const { title, content, type, priority, startDate, endDate } = req.body;
    try {
      const [result] = await pool.query(`
        INSERT INTO announcements (title, content, type, priority, start_date, end_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [title, content, type, priority, startDate, endDate, req.user.id]);

      const [newAnnouncement] = await pool.query(
        'SELECT * FROM announcements WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(newAnnouncement[0]);
    } catch (error) {
      console.error('Error creating announcement:', error);
      res.status(500).json({ message: 'Error creating announcement' });
    }
  },

  // Update announcement
  updateAnnouncement: async (req, res) => {
    const { id } = req.params;
    const { title, content, type, priority, startDate, endDate } = req.body;
    try {
      await pool.query(`
        UPDATE announcements 
        SET title = ?, content = ?, type = ?, priority = ?, start_date = ?, end_date = ?
        WHERE id = ?
      `, [title, content, type, priority, startDate, endDate, id]);

      const [updatedAnnouncement] = await pool.query(
        'SELECT * FROM announcements WHERE id = ?',
        [id]
      );

      if (updatedAnnouncement.length === 0) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      res.json(updatedAnnouncement[0]);
    } catch (error) {
      console.error('Error updating announcement:', error);
      res.status(500).json({ message: 'Error updating announcement' });
    }
  },

  // Delete announcement
  deleteAnnouncement: async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await pool.query(
        'DELETE FROM announcements WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      res.status(500).json({ message: 'Error deleting announcement' });
    }
  }
};

module.exports = announcementController; 