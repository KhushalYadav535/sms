const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { ensureAdmin } = require('../middleware/ensureAdmin');

// All routes require admin access
router.use(ensureAdmin);

// Generate financial report
router.get('/financial', reportsController.generateFinancialReport);

// Generate member dues report
router.get('/member-dues', reportsController.generateMemberDuesReport);

// Generate complaints report
router.get('/complaints', reportsController.generateComplaintsReport);

// Generate notices report
router.get('/notices', reportsController.generateNoticesReport);

module.exports = router; 