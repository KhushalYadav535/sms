const db = require('../config/db');

const reportsModel = {
  // Generate financial report
  generateFinancialReport: async (startDate, endDate) => {
    try {
      const query = `
        SELECT 
          type,
          SUM(amount) as total_amount,
          COUNT(*) as transaction_count,
          DATE(date) as transaction_date
        FROM accounting
        WHERE date BETWEEN ? AND ?
        GROUP BY type, DATE(date)
        ORDER BY transaction_date DESC
      `;
      
      const [rows] = await db.query(query, [startDate, endDate]);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Generate member dues report
  generateMemberDuesReport: async () => {
    try {
      const query = `
        SELECT 
          m.name,
          m.flat_no,
          m.block,
          m.phone,
          m.email,
          COALESCE(SUM(CASE WHEN a.type = 'income' THEN a.amount ELSE 0 END), 0) as total_paid,
          COALESCE(SUM(CASE WHEN a.type = 'expense' THEN a.amount ELSE 0 END), 0) as total_dues
        FROM members m
        LEFT JOIN accounting a ON m.id = a.member_id
        GROUP BY m.id
        ORDER BY total_dues DESC
      `;
      
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Generate complaints report
  generateComplaintsReport: async (startDate, endDate) => {
    try {
      const query = `
        SELECT 
          c.title,
          c.description,
          c.status,
          c.date,
          m.name as member_name,
          m.flat_no,
          m.block
        FROM complaints c
        JOIN members m ON c.member_id = m.id
        WHERE c.date BETWEEN ? AND ?
        ORDER BY c.date DESC
      `;
      
      const [rows] = await db.query(query, [startDate, endDate]);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Generate notices report
  generateNoticesReport: async (startDate, endDate) => {
    try {
      const query = `
        SELECT 
          title,
          content,
          date,
          created_by
        FROM notices
        WHERE date BETWEEN ? AND ?
        ORDER BY date DESC
      `;
      
      const [rows] = await db.query(query, [startDate, endDate]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = reportsModel; 