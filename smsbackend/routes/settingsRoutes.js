const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, settingsController.getByUser);
router.post('/', auth, settingsController.update);

module.exports = router;
