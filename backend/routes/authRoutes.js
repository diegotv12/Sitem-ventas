const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
router.post('/register', registerUser); // Podría protegerse con authorizeAdmin si solo admin puede registrar

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   POST /api/auth/logout
router.post('/logout', protect, logoutUser); // Se necesita estar logueado para hacer logout

// @route   GET /api/auth/me
router.get('/me', protect, getMe); // Ruta protegida para obtener datos del usuario actual

module.exports = router;
