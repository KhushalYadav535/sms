const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, noticeController.getAll);
router.post('/', auth, noticeController.create);
router.delete('/:id', auth, noticeController.remove);

module.exports = router;
