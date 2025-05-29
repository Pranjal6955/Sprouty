const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  verifyToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.get('/verify-token', protect, verifyToken);

module.exports = router;
