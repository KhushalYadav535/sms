const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const ensureAdmin = require('../middleware/ensureAdmin');

// Protected routes
router.use(authMiddleware);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Dashboard routes
router.get('/dashboard', userController.getUserDashboardStats);
router.get('/admin/dashboard', ensureAdmin, userController.getAdminDashboardStats);

// Admin only routes
router.use(ensureAdmin);
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:userId/role', userController.updateUserRole);
router.delete('/:userId', userController.deleteUser);

module.exports = router;
