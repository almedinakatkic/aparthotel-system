const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const financialReportController = require('../controllers/financialReportController');

router.get('/all', authMiddleware, financialReportController.getAllReports); 
router.get('/:propertyGroupId', authMiddleware, financialReportController.getReportsByProperty);
router.post('/', authMiddleware, financialReportController.createReport);

module.exports = router;