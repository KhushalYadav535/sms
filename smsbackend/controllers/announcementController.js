const pool = require('../config/db');

const announcementController = {
  // Get all announcements
  getAllAnnouncements: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM announcements 
        ORDER BY created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(500).json({ message: 'Error fetching announcements' });
    }
  },

  // Create new announcement
  createAnnouncement: async (req, res) => {
    const { title, content, type, priority, startDate, endDate } = req.body;
    try {
      const result = await pool.query(`
        INSERT INTO announcements (title, content, type, priority, start_date, end_date, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [title, content, type, priority, startDate, endDate, req.user.id]);

      const newAnnouncementResult = await pool.query(
        'SELECT * FROM announcements WHERE id = $1',
        [result.rows[0].id]
      );

      res.status(201).json(newAnnouncementResult.rows[0]);
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
        SET title = $1, content = $2, type = $3, priority = $4, start_date = $5, end_date = $6
        WHERE id = $7
      `, [title, content, type, priority, startDate, endDate, id]);

      const updatedAnnouncementResult = await pool.query(
        'SELECT * FROM announcements WHERE id = $1',
        [id]
      );

      if (updatedAnnouncementResult.rows.length === 0) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      res.json(updatedAnnouncementResult.rows[0]);
    } catch (error) {
      console.error('Error updating announcement:', error);
      res.status(500).json({ message: 'Error updating announcement' });
    }
  },

  // Delete announcement
  deleteAnnouncement: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM announcements WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
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