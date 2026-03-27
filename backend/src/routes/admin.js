const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.get('/users', auth, adminController.getAllUsers);
router.get('/waste', auth, adminController.getAllWaste);
router.get('/compliance', auth, adminController.getAllCompliance);
router.get('/stats', auth, adminController.getSystemStats);
router.put('/waste/:id/verify', auth, adminController.verifyWaste);

module.exports = router;
