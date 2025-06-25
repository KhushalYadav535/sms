const db = require('../config/db');

// Get all security incidents
const getAllIncidents = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM security_incidents ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching security incidents:', error);
    res.status(500).json({ message: 'Error fetching security incidents' });
  }
};

// Create a new security incident
const createIncident = async (req, res) => {
  const { type, description, location, status, date } = req.body;
  
  try {
    const result = await db.query(
      'INSERT INTO security_incidents (type, description, location, status, date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [type, description, location, status, date]
    );
    
    const newIncidentResult = await db.query('SELECT * FROM security_incidents WHERE id = $1', [result.rows[0].id]);
    res.status(201).json(newIncidentResult.rows[0]);
  } catch (error) {
    console.error('Error creating security incident:', error);
    res.status(500).json({ message: 'Error creating security incident' });
  }
};

// Update a security incident
const updateIncident = async (req, res) => {
  const { id } = req.params;
  const { type, description, location, status, date } = req.body;
  
  try {
    await db.query(
      'UPDATE security_incidents SET type = $1, description = $2, location = $3, status = $4, date = $5 WHERE id = $6',
      [type, description, location, status, date, id]
    );
    
    const updatedIncidentResult = await db.query('SELECT * FROM security_incidents WHERE id = $1', [id]);
    if (updatedIncidentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Security incident not found' });
    }
    
    res.json(updatedIncidentResult.rows[0]);
  } catch (error) {
    console.error('Error updating security incident:', error);
    res.status(500).json({ message: 'Error updating security incident' });
  }
};

// Delete a security incident
const deleteIncident = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM security_incidents WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Security incident not found' });
    }
    
    res.json({ message: 'Security incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting security incident:', error);
    res.status(500).json({ message: 'Error deleting security incident' });
  }
};

module.exports = {
  getAllIncidents,
  createIncident,
  updateIncident,
  deleteIncident
}; 