const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');
const { validate, noticeValidation } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// Get all notices
router.get('/', noticeController.getAll);

// Create notice (admin only)
router.post('/', authorize('admin'), validate(noticeValidation), noticeController.create);

// Delete notice (admin only)
router.delete('/:id', authorize('admin'), noticeController.remove);

module.exports = router;
