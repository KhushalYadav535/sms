const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.use(authMiddleware);

// Get current user's member profile
router.get('/me', memberController.getCurrentMember);

// Get all members
router.get('/', memberController.getAll);

// Create member profile
router.post('/', memberController.create);

// Update member profile
router.put('/:id', memberController.update);

// Delete member profile
router.delete('/:id', memberController.remove);

module.exports = router;
