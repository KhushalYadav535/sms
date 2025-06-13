const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const { validate, complaintValidation } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// Get all complaints
router.get('/', complaintController.getAll);

// Create complaint
router.post('/', validate(complaintValidation), complaintController.create);

// Admin only routes
router.use(authorize('admin'));

// Update complaint status
router.put('/:id/status', complaintController.updateStatus);

// Delete complaint
router.delete('/:id', complaintController.remove);

module.exports = router;
