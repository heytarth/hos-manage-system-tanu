const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const auth = require('../middleware/auth');

router.get('/', auth, complianceController.getCompliance);
router.put('/update', auth, complianceController.updateCompliance);
router.get('/export/csv', auth, complianceController.exportComplianceCSV);
router.get('/export/pdf', auth, complianceController.exportCompliancePDF);

module.exports = router;
