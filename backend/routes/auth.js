const express = require('express');
const router = express.Router();
const { register, login, getMe, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);

router.post('/login', login);

router.post('/googlelogin', googleLogin);

router.get('/me', protect, getMe);

module.exports = router;
