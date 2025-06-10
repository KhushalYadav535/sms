const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const securityController = require('../controllers/securityController');

// Get all security incidents
router.get('/incidents', authMiddleware, (req, res, next) => {
  securityController.getAllIncidents(req, res, next);
});

// Create a new security incident
router.post('/incidents', authMiddleware, (req, res, next) => {
  securityController.createIncident(req, res, next);
});

// Update a security incident
router.put('/incidents/:id', authMiddleware, (req, res, next) => {
  securityController.updateIncident(req, res, next);
});

// Delete a security incident
router.delete('/incidents/:id', authMiddleware, (req, res, next) => {
  securityController.deleteIncident(req, res, next);
});

module.exports = router; 