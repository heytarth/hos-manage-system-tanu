const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/', auth, analyticsController.getAnalytics);
router.get('/trends', auth, analyticsController.getWasteTrends);
router.get('/breakdown', auth, analyticsController.getCategoryBreakdown);
router.get('/export/csv', auth, analyticsController.exportAnalyticsCSV);
router.get('/export/pdf', auth, analyticsController.exportAnalyticsPDF);

module.exports = router;
