const express = require('express');
const router = express.Router();
const standardChargesController = require('../controllers/standardChargesController');
const { authenticateToken } = require('../middleware/auth');

// Get all standard charges
router.get('/', authenticateToken, standardChargesController.getAllCharges);

// Get charge by ID
router.get('/:id', authenticateToken, standardChargesController.getChargeById);

// Create new charge
router.post('/', authenticateToken, standardChargesController.createCharge);

// Update charge
router.put('/:id', authenticateToken, standardChargesController.updateCharge);

// Delete charge
router.delete('/:id', authenticateToken, standardChargesController.deleteCharge);

module.exports = router; 