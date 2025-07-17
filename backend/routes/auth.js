const express = require('express');
const router = express.Router();
const { register, login, getMe, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login a user
router.post('/login', login);

// @route   POST /api/auth/googlelogin
// @desc    Login a user with Google
router.post('/googlelogin', googleLogin);

// @route   GET /api/auth/me
// @desc    Get current logged in user
router.get('/me', protect, getMe);

module.exports = router;
