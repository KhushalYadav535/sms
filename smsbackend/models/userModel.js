const db = require('../config/db');

class User {
  static async findByEmail(email) {
    try {
      console.log('Finding user by email:', email);
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      console.log('Query result:', result.rows);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async create({ name, email, password, role = 'user' }) {
    try {
      console.log('Creating new user:', { name, email, role });
      
      // Validate role
      const validRoles = ['admin', 'user', 'treasure', 'security', 'secretary'];
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }
      
      // First verify the table structure
      const columnsResult = await db.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      console.log('Table columns:', columnsResult.rows.map(col => col.column_name).join(', '));

      // Check if email already exists
      const existingResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingResult.rows.length > 0) {
        throw new Error('Email already exists');
      }

      // Get the role column definition
      const roleColumnResult = await db.query(`
        SELECT column_name, data_type, check_clause
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
      `);
      console.log('Role column definition:', roleColumnResult.rows[0]);

      // Insert the new user
      const result = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, password, role]
      );
      
      console.log('Insert result:', result.rows[0]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Invalid role value. Must be one of: admin, user, treasure, security, secretary');
      }
      throw error;
    }
  }

  static async findById(id) {
    try {
      console.log('Finding user by id:', id);
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      console.log('Query result:', result.rows);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      console.log('Updating user:', { id, data });
      const allowedFields = ['name', 'email', 'password', 'role'];
      const updates = Object.keys(data)
        .filter(key => allowedFields.includes(key))
        .map((key, index) => `${key} = $${index + 2}`);
      
      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Validate role if it's being updated
      if (data.role) {
        const validRoles = ['admin', 'user', 'treasure', 'security', 'secretary'];
        if (!validRoles.includes(data.role)) {
          throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        }
      }

      const values = Object.keys(data)
        .filter(key => allowedFields.includes(key))
        .map(key => data[key]);

      const result = await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );

      console.log('Update result:', result.rows[0]);
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Invalid role value. Must be one of: admin, user, treasure, security, secretary');
      }
      throw error;
    }
  }

  static async findAll() {
    try {
      const result = await db.query('SELECT * FROM users');
      return result.rows;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM users WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        throw new Error('User not found');
      }
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

module.exports = User;
