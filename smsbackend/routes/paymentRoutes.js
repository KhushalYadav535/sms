const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// Get all payments
router.get('/', authenticateToken, paymentController.getAllPayments);

// Get payment by ID
router.get('/:id', authenticateToken, paymentController.getPaymentById);

// Create new payment
router.post('/', authenticateToken, paymentController.createPayment);

// Update payment status
router.put('/:id/status', authenticateToken, paymentController.updatePaymentStatus);

// Get payments by invoice ID
router.get('/invoice/:invoiceId', authenticateToken, paymentController.getPaymentsByInvoice);

// Get payments by member ID
router.get('/member/:memberId', authenticateToken, paymentController.getPaymentsByMember);

module.exports = router; 