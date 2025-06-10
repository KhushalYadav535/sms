const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, eventController.getAll);
router.post('/', auth, eventController.create);
router.delete('/:id', auth, eventController.remove);

module.exports = router;
