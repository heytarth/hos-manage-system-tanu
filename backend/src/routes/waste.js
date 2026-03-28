const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');
const auth = require('../middleware/auth');

router.post('/submit', auth, wasteController.submitWaste);
router.get('/all', auth, wasteController.getWaste);
router.get('/recent', auth, wasteController.getRecentWaste);
router.get('/export/csv', auth, wasteController.exportWasteCSV);
router.get('/export/pdf', auth, wasteController.exportWastePDF);

module.exports = router;
