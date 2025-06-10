const reportController = require('../controllers/reportController');

// Reports
router.get('/reports', reportController.getAll);
router.post('/reports', reportController.create);
router.get('/reports/:id/download', reportController.download);
router.delete('/reports/:id', reportController.delete); 