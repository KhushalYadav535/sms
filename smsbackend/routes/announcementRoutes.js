const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all announcements
router.get('/', announcementController.getAllAnnouncements);

// Create new announcement
router.post('/', announcementController.createAnnouncement);

// Update announcement
router.put('/:id', announcementController.updateAnnouncement);

// Delete announcement
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router; 