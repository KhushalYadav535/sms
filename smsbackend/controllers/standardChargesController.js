const pool = require('../config/db');

// Get all standard charges
exports.getAllCharges = async (req, res) => {
  try {
    const [charges] = await pool.query('SELECT * FROM standard_charges ORDER BY description');
    res.json(charges);
  } catch (error) {
    console.error('Error fetching standard charges:', error);
    res.status(500).json({ message: 'Error fetching standard charges' });
  }
};

// Get charge by ID
exports.getChargeById = async (req, res) => {
  try {
    const [charge] = await pool.query(
      'SELECT * FROM standard_charges WHERE id = ?',
      [req.params.id]
    );

    if (charge.length === 0) {
      return res.status(404).json({ message: 'Standard charge not found' });
    }

    res.json(charge[0]);
  } catch (error) {
    console.error('Error fetching standard charge:', error);
    res.status(500).json({ message: 'Error fetching standard charge' });
  }
};

// Create new charge
exports.createCharge = async (req, res) => {
  const { description, amount } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO standard_charges (description, amount) VALUES (?, ?)',
      [description, amount]
    );

    res.status(201).json({
      id: result.insertId,
      description,
      amount,
      message: 'Standard charge created successfully'
    });
  } catch (error) {
    console.error('Error creating standard charge:', error);
    res.status(500).json({ message: 'Error creating standard charge' });
  }
};

// Update charge
exports.updateCharge = async (req, res) => {
  const { description, amount } = req.body;
  const chargeId = req.params.id;

  try {
    const [result] = await pool.query(
      'UPDATE standard_charges SET description = ?, amount = ? WHERE id = ?',
      [description, amount, chargeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Standard charge not found' });
    }

    res.json({
      id: chargeId,
      description,
      amount,
      message: 'Standard charge updated successfully'
    });
  } catch (error) {
    console.error('Error updating standard charge:', error);
    res.status(500).json({ message: 'Error updating standard charge' });
  }
};

// Delete charge
exports.deleteCharge = async (req, res) => {
  const chargeId = req.params.id;

  try {
    const [result] = await pool.query(
      'DELETE FROM standard_charges WHERE id = ?',
      [chargeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Standard charge not found' });
    }

    res.json({ message: 'Standard charge deleted successfully' });
  } catch (error) {
    console.error('Error deleting standard charge:', error);
    res.status(500).json({ message: 'Error deleting standard charge' });
  }
}; 