const db = require('../config/db');

class User {
  static async findByEmail(email) {
    try {
      console.log('Finding user by email:', email);
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      console.log('Query result:', rows);
      return rows[0];
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
      const [columns] = await db.query('SHOW COLUMNS FROM users');
      console.log('Table columns:', columns.map(col => col.Field).join(', '));

      // Check if email already exists
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        throw new Error('Email already exists');
      }

      // Get the role column definition
      const [roleColumn] = await db.query("SHOW COLUMNS FROM users WHERE Field = 'role'");
      const roleEnum = roleColumn[0].Type.match(/enum\((.*)\)/)[1].replace(/'/g, '').split(',');
      console.log('Available roles in database:', roleEnum);

      // Ensure role is in the database's ENUM
      if (!roleEnum.includes(role)) {
        throw new Error(`Invalid role value. Must be one of: ${roleEnum.join(', ')}`);
      }

      // Insert the new user
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, role]
      );
      
      console.log('Insert result:', result);
      
      // Get the created user
      const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      console.log('Created user:', newUser[0]);
      
      return newUser[0];
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === 'ER_DATA_TOO_LONG' || error.code === 'WARN_DATA_TRUNCATED') {
        throw new Error('Invalid role value. Must be one of: admin, user, treasure, security, secretary');
      }
      throw error;
    }
  }

  static async findById(id) {
    try {
      console.log('Finding user by id:', id);
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      console.log('Query result:', rows);
      return rows[0];
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
        .map(key => `${key} = ?`);
      
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

      const [result] = await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        [...values, id]
      );

      console.log('Update result:', result);
      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }

      return this.findById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.code === 'ER_DATA_TOO_LONG' || error.code === 'WARN_DATA_TRUNCATED') {
        throw new Error('Invalid role value. Must be one of: admin, user, treasure, security, secretary');
      }
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.query('SELECT * FROM users');
      return rows;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
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
