const express = require('express');
const router = express.Router();
const standardChargesController = require('../controllers/standardChargesController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all standard charges
router.get('/', authMiddleware, standardChargesController.getAllCharges);

// Get charge by ID
router.get('/:id', authMiddleware, standardChargesController.getChargeById);

// Create new charge
router.post('/', authMiddleware, standardChargesController.createCharge);

// Update charge
router.put('/:id', authMiddleware, standardChargesController.updateCharge);

// Delete charge
router.delete('/:id', authMiddleware, standardChargesController.deleteCharge);

module.exports = router; 