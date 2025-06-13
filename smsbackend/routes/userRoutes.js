const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validate, profileUpdateValidation, passwordChangeValidation } = require('../middleware/validator');

// Protected routes - all routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validate(profileUpdateValidation), userController.updateProfile);
router.post('/change-password', validate(passwordChangeValidation), userController.changePassword);

// Dashboard routes
router.get('/dashboard', userController.getUserDashboardStats);
router.get('/admin/dashboard', authorize('admin'), userController.getAdminDashboardStats);

// Admin only routes
router.use(authorize('admin'));
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:userId/role', userController.updateUserRole);
router.delete('/:userId', userController.deleteUser);

module.exports = router;
