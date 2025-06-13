const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');

// Get all payments
router.get('/', auth, paymentController.getAllPayments);

// Get payment by ID
router.get('/:id', auth, paymentController.getPaymentById);

// Create new payment
router.post('/', auth, paymentController.createPayment);

// Update payment status
router.put('/:id/status', auth, paymentController.updatePaymentStatus);

// Get payments by invoice ID
router.get('/invoice/:invoiceId', auth, paymentController.getPaymentsByInvoice);

// Get payments by member ID
router.get('/member/:memberId', auth, paymentController.getPaymentsByMember);

module.exports = router; 