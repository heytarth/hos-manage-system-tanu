const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');
const auth = require('../middleware/auth');

router.post('/submit', auth, wasteController.submitWaste);
router.get('/all', auth, wasteController.getWaste);
router.get('/recent', auth, wasteController.getRecentWaste);

module.exports = router;
