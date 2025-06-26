const db = require('../config/db');

class User {
  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async create({ username, email, password, role = 'member', firstName, lastName, phone }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await db.query(
      'INSERT INTO users (username, email, password, role, first_name, last_name, phone, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [username, email, hashedPassword, role, firstName, lastName, phone, true]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    // Only allow certain fields to be updated
    const allowedFields = ['username', 'email', 'password', 'role', 'first_name', 'last_name', 'phone', 'is_active'];
    const updates = [];
    const values = [id];
    let idx = 2;
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updates.push(`${key} = $${idx}`);
        values.push(data[key]);
        idx++;
      }
    }
    if (updates.length === 0) return null;
    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    return true;
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
}

// PostgreSQL version, see above class
module.exports = User;