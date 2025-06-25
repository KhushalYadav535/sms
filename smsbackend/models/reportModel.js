const db = require('../config/db');

function toPostgreSQLDateTime(date) {
  if (!date) return null;
  // Accepts both Date object and ISO string
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

function safeParse(val) {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return {};
  }
}

class Report {
  static async create(data) {
    try {
      const { type, dateRange, generatedAt } = data;
      console.log('Creating report with data:', { type, dateRange, generatedAt });

      // First check if the table exists
      const tablesResult = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'reports'
      `);
      if (tablesResult.rows.length === 0) {
        throw new Error('Reports table does not exist. Please run the database setup script.');
      }

      // Convert generatedAt to PostgreSQL TIMESTAMP format
      const postgresGeneratedAt = toPostgreSQLDateTime(generatedAt);

      const query = `
        INSERT INTO reports (type, date_range, generated_at)
        VALUES ($1, $2, $3) RETURNING id
      `;
      console.log('Executing query with params:', [type, JSON.stringify(dateRange), postgresGeneratedAt]);
      
      const result = await db.query(query, [type, JSON.stringify(dateRange), postgresGeneratedAt]);
      console.log('Query result:', result.rows[0]);
      
      return { id: result.rows[0].id, type, dateRange, generatedAt };
    } catch (error) {
      console.error('Error in Report.create:', error);
      throw error;
    }
  }

  static async getAll() {
    const query = 'SELECT * FROM reports ORDER BY generated_at DESC';
    const result = await db.query(query);
    return result.rows.map(report => ({
      ...report,
      dateRange: safeParse(report.date_range)
    }));
  }

  static async getById(id) {
    const query = 'SELECT * FROM reports WHERE id = $1';
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) return null;
    const report = result.rows[0];
    return {
      ...report,
      dateRange: safeParse(report.date_range)
    };
  }

  static async delete(id) {
    const query = 'DELETE FROM reports WHERE id = $1';
    await db.query(query, [id]);
  }

  static async generateReport(type, dateRange) {
    let query;
    let params = [];
    
    switch (type) {
      case 'dues':
        query = `
          SELECT 
            m.house_number,
            m.name,
            a.amount,
            a.status,
            a.due_date,
            a.payment_date
          FROM accounting a
          JOIN members m ON a.member_id = m.id
          WHERE a.due_date BETWEEN $1 AND $2
          ORDER BY a.due_date DESC
        `;
        params = [dateRange.start, dateRange.end];
        break;

      case 'members':
        query = `
          SELECT 
            m.house_number,
            m.name,
            m.phone_number,
            m.email,
            m.created_at
          FROM members m
          ORDER BY m.house_number
        `;
        break;

      case 'complaints':
        query = `
          SELECT 
            c.title,
            c.description,
            c.status,
            c.created_at,
            m.house_number,
            m.name
          FROM complaints c
          JOIN members m ON c.member_id = m.id
          WHERE c.created_at BETWEEN $1 AND $2
          ORDER BY c.created_at DESC
        `;
        params = [dateRange.start, dateRange.end];
        break;

      case 'notices':
        query = `
          SELECT 
            n.title,
            n.content,
            n.created_at,
            COUNT(DISTINCT nr.member_id) as read_count
          FROM notices n
          LEFT JOIN notice_reads nr ON n.id = nr.notice_id
          WHERE n.created_at BETWEEN $1 AND $2
          GROUP BY n.id
          ORDER BY n.created_at DESC
        `;
        params = [dateRange.start, dateRange.end];
        break;

      default:
        throw new Error('Invalid report type');
    }

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = Report;
