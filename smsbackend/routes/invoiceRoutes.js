const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all invoices
router.get('/', authMiddleware, invoiceController.getAllInvoices);

// Get invoice by ID
router.get('/:id', authMiddleware, invoiceController.getInvoiceById);

// Generate invoices for a month
router.post('/generate', authMiddleware, invoiceController.generateInvoices);

// Update invoice status
router.put('/:id/status', authMiddleware, invoiceController.updateInvoiceStatus);

// Get standard charges
router.get('/charges/standard', authMiddleware, invoiceController.getStandardCharges);

// Update standard charges
router.put('/charges/standard/:id', authMiddleware, invoiceController.updateStandardCharge);

// Add new standard charge
router.post('/charges/standard', authMiddleware, invoiceController.addStandardCharge);

// Download invoice PDF
router.get('/:id/pdf', authMiddleware, invoiceController.downloadInvoicePDF);

// Send invoice via email
router.post('/:id/send-email', authMiddleware, invoiceController.sendInvoiceEmail);

module.exports = router; 