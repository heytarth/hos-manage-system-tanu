const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const auth = require('../middleware/auth');

router.get('/', auth, complianceController.getCompliance);
router.put('/update', auth, complianceController.updateCompliance);

module.exports = router;
