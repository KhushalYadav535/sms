const db = require('../config/db');

const noticeModel = {
  getAll: async () => {
    const result = await db.query(
      `SELECT n.*, u.name as created_by_name 
       FROM announcements n 
       LEFT JOIN users u ON n.created_by = u.id 
       ORDER BY n.created_at DESC`
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query(
      `SELECT n.*, u.name as created_by_name 
       FROM announcements n 
       LEFT JOIN users u ON n.created_by = u.id 
       WHERE n.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  create: async (noticeData) => {
    const { title, content, type, priority, start_date, end_date, created_by } = noticeData;
    
    const result = await db.query(
      `INSERT INTO announcements 
       (title, content, type, priority, start_date, end_date, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [title, content, type, priority, start_date, end_date, created_by]
    );
    
    return result.rows[0].id;
  },

  delete: async (id) => {
    const result = await db.query('DELETE FROM announcements WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  },

  exists: async (id) => {
    const result = await db.query('SELECT id FROM announcements WHERE id = $1', [id]);
    return result.rows.length > 0;
  }
};

module.exports = noticeModel; 