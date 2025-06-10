const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, reportController.getAll);
router.post('/', auth, reportController.create);
router.get('/:id/download', auth, reportController.download);
router.delete('/:id', auth, reportController.delete);

module.exports = router;
