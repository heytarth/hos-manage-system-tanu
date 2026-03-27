const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/', auth, analyticsController.getAnalytics);
router.get('/trends', auth, analyticsController.getWasteTrends);
router.get('/breakdown', auth, analyticsController.getCategoryBreakdown);

module.exports = router;
