const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');
const { validate, accountingValidation } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// Get all transactions
router.get('/', transactionController.getAll);

// Admin only routes
router.use(authorize('admin'));

// Create transaction
router.post('/', validate(accountingValidation), transactionController.create);

// Update transaction
router.put('/:id', validate(accountingValidation), transactionController.update);

// Delete transaction
router.delete('/:id', transactionController.remove);

module.exports = router; 