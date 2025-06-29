const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/dashboard
// @access  Privado/Admin
router.get('/', protect, authorizeAdmin, getDashboardData);

module.exports = router;
